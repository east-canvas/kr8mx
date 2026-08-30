import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  orders,
  orderItems,
  sentEmails,
  notifyList,
  leads,
  leadReplies,
} from "@/db/schema";
import { getEmailProvider } from "./providers";
import {
  orderConfirmationEmail,
  shippingNotificationEmail,
  tabletsLaunchEmail,
  leadReplyEmail,
} from "./templates";
import { resolveBaseUrl } from "@/lib/seo";

/** Branded sender + reply-to for 1:1 lead replies. Env-overridable so the
 *  monitored inbox can change without a deploy. */
const LEAD_REPLY_FROM = process.env.LEADS_REPLY_FROM || "KR8MX <info@kr8mx.com>";
const LEAD_REPLY_TO = process.env.LEADS_REPLY_TO || "info@kr8mx.com";

export type OrderEmailTemplate = "order_confirmation" | "shipping_notification";

/**
 * Send an order email idempotently. Reserves a sent_emails row first
 * (unique on order_id+template); if the reservation is a no-op the email was
 * already sent, so we skip. Never throws, a send failure records a dead-letter
 * status and returns, so it can't block an order transition.
 */
export async function sendOrderEmail(
  orderId: number,
  template: OrderEmailTemplate,
  extra?: { tracking?: { number?: string; carrier?: string; url?: string } },
): Promise<{ sent: boolean; skipped?: boolean; failed?: boolean }> {
  let db;
  try {
    db = getDb();
  } catch {
    return { sent: false, failed: true };
  }

  // Reserve idempotency slot.
  let reserved;
  try {
    reserved = await db
      .insert(sentEmails)
      .values({ template, toEmail: "", orderId, status: "pending" })
      .onConflictDoNothing()
      .returning({ id: sentEmails.id });
  } catch {
    return { sent: false, failed: true };
  }
  if (reserved.length === 0) return { sent: false, skipped: true };
  const sentId = reserved[0].id;

  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) throw new Error("order not found");
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));

    const rendered =
      template === "order_confirmation"
        ? orderConfirmationEmail(order, items)
        : shippingNotificationEmail(order, items, extra?.tracking ?? {});

    const provider = getEmailProvider();
    const result = await provider.sendTransactional({
      to: order.email,
      template,
      subject: rendered.subject,
      html: rendered.html,
    });

    await db
      .update(sentEmails)
      .set({
        toEmail: order.email,
        status: result.ok ? "sent" : "failed",
        providerMessageId: result.providerMessageId ?? null,
      })
      .where(eq(sentEmails.id, sentId));

    return result.ok ? { sent: true } : { sent: false, failed: true };
  } catch {
    // Dead-letter: mark failed but never throw.
    try {
      await db
        .update(sentEmails)
        .set({ status: "failed" })
        .where(eq(sentEmails.id, sentId));
    } catch {
      /* ignore */
    }
    return { sent: false, failed: true };
  }
}

/**
 * Send a branded 1:1 reply to a lead from the admin console. Sends from
 * info@kr8mx.com with reply-to set to the monitored inbox (so the lead's reply
 * never lands in a personal Gmail), logs the reply to lead_replies, and moves
 * the lead to "contacted" on success. Never throws.
 */
export async function sendLeadReply(
  leadId: number,
  subject: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  let db;
  try {
    db = getDb();
  } catch {
    return { ok: false, error: "db_unavailable" };
  }

  try {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);
    if (!lead) return { ok: false, error: "lead_not_found" };

    const rendered = leadReplyEmail({ name: lead.name, subject, body });
    const provider = getEmailProvider();
    const result = await provider.sendTransactional({
      to: lead.email,
      template: "lead_reply",
      subject: rendered.subject,
      html: rendered.html,
      from: LEAD_REPLY_FROM,
      replyTo: LEAD_REPLY_TO,
    });

    // The email send is the source of truth for success. Logging + status are
    // best-effort so a not-yet-migrated table can't report a sent mail as failed.
    try {
      await db.insert(leadReplies).values({
        leadId,
        toEmail: lead.email,
        subject,
        body,
        status: result.ok ? "sent" : "failed",
        providerMessageId: result.providerMessageId ?? null,
      });
      if (result.ok && lead.status === "new") {
        await db
          .update(leads)
          .set({ status: "contacted" })
          .where(eq(leads.id, leadId));
      }
    } catch {
      /* best-effort log; don't fail a sent email on a logging error */
    }

    return result.ok ? { ok: true } : { ok: false, error: result.error };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Send a launch announcement to SUBSCRIBED notify-list entries for a variant,
 * idempotent per (campaign, email). Returns per-recipient outcome counts.
 */
export async function sendLaunchAnnouncement(
  campaign: string,
  variantId: number | null,
): Promise<{ sent: number; skipped: number; failed: number; total: number }> {
  const db = getDb();
  const provider = getEmailProvider();
  const base = resolveBaseUrl();

  const recipients = await db
    .select()
    .from(notifyList)
    .where(
      and(
        eq(notifyList.subscribed, true),
        variantId === null
          ? isNull(notifyList.variantId)
          : eq(notifyList.variantId, variantId),
      ),
    );

  let sent = 0,
    skipped = 0,
    failed = 0;
  for (const r of recipients) {
    const reserved = await db
      .insert(sentEmails)
      .values({ template: "tablets_launch", toEmail: r.email, campaign, status: "pending" })
      .onConflictDoNothing()
      .returning({ id: sentEmails.id });
    if (reserved.length === 0) {
      skipped++;
      continue;
    }
    const unsubscribeUrl = `${base}/unsubscribe?token=${r.unsubscribeToken ?? ""}`;
    const rendered = tabletsLaunchEmail(unsubscribeUrl);
    const result = await provider.sendTransactional({
      to: r.email,
      template: "tablets_launch",
      subject: rendered.subject,
      html: rendered.html,
    });
    await db
      .update(sentEmails)
      .set({
        status: result.ok ? "sent" : "failed",
        providerMessageId: result.providerMessageId ?? null,
      })
      .where(eq(sentEmails.id, reserved[0].id));
    if (result.ok) sent++;
    else failed++;
  }
  return { sent, skipped, failed, total: recipients.length };
}
