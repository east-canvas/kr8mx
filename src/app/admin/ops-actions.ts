"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  orders,
  orderEvents,
  shippingRestrictions,
  inventory,
} from "@/db/schema";
import type { OrderStatus } from "@/db/schema";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { canTransition } from "@/db/order-state";
import { logAudit } from "@/lib/admin/audit";
import { sendOrderEmail } from "@/lib/email/send";
import { sendLaunchAnnouncement } from "@/lib/email/send";
import { getEmailProvider } from "@/lib/email/providers";
import { tabletsLaunchEmail } from "@/lib/email/templates";
import { resolveBaseUrl } from "@/lib/seo";

async function assertAuthed() {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) redirect("/admin");
}
const str = (v: FormDataEntryValue | null) => (v ?? "").toString().trim();

/** Send a test email through the active provider (Resend when configured, else
 *  the mock outbox) to verify delivery from the console. */
export async function sendTestEmailAction(formData: FormData) {
  await assertAuthed();
  const to = str(formData.get("to"));
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
    redirect("/admin?error=test_email");
  }
  const provider = getEmailProvider();
  const rendered = tabletsLaunchEmail(`${resolveBaseUrl()}/unsubscribe?token=test`);
  const res = await provider.sendTransactional({
    to,
    template: "test",
    subject: "KR8MX, test email",
    html: rendered.html,
  });
  redirect(
    `/admin?ok=test&provider=${provider.name}&result=${res.ok ? "sent" : "failed"}`,
  );
}

/** Manual order transition via the state machine. Illegal edges are rejected
 *  server-side; every transition logs the admin actor to order_events. On
 *  `shipped` it fires the shipping email with the tracking slot. */
export async function transitionOrderAction(formData: FormData) {
  await assertAuthed();
  const orderId = Number(str(formData.get("orderId")));
  const to = str(formData.get("toStatus")) as OrderStatus;
  const trackingNumber = str(formData.get("trackingNumber")) || undefined;
  const carrier = str(formData.get("carrier")) || undefined;
  if (!orderId || !to) redirect("/admin/orders?error=fields");

  try {
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) redirect("/admin/orders?error=notfound");
    if (!canTransition(order.status, to)) {
      redirect(`/admin/orders?order=${orderId}&error=illegal`);
    }
    await db
      .update(orders)
      .set({ status: to, updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    await db.insert(orderEvents).values({
      orderId,
      type: "status_changed",
      fromStatus: order.status,
      toStatus: to,
      payload: { actor: "admin", trackingNumber, carrier },
    });
    // Fire the matching email (idempotent; never blocks the transition).
    if (to === "paid") {
      await sendOrderEmail(orderId, "order_confirmation");
    } else if (to === "shipped") {
      await sendOrderEmail(orderId, "shipping_notification", {
        tracking: { number: trackingNumber, carrier },
      });
    }
  } catch {
    redirect("/admin/orders?error=db");
  }
  revalidatePath("/admin/orders");
  redirect(`/admin/orders?order=${orderId}&ok=1`);
}

/** Edit a shipping restriction (data, not deploys). Audit-logged before/after. */
export async function updateRestrictionAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const allowed = str(formData.get("allowed")) === "true";
  const reason = str(formData.get("reason")) || null;
  if (!id) redirect("/admin/restrictions?error=fields");
  try {
    const db = getDb();
    const [before] = await db
      .select()
      .from(shippingRestrictions)
      .where(eq(shippingRestrictions.id, id))
      .limit(1);
    const [after] = await db
      .update(shippingRestrictions)
      .set({ allowed, reason, lastVerified: new Date(), updatedAt: new Date() })
      .where(eq(shippingRestrictions.id, id))
      .returning();
    await logAudit({
      entity: "shipping_restriction",
      entityId: id,
      action: "update",
      before,
      after,
    });
  } catch {
    redirect("/admin/restrictions?error=db");
  }
  revalidatePath("/admin/restrictions");
  redirect("/admin/restrictions?ok=1");
}

/** Inline inventory adjustment. Audit-logged. */
export async function adjustInventoryAction(formData: FormData) {
  await assertAuthed();
  const variantId = Number(str(formData.get("variantId")));
  const onHand = Number(str(formData.get("onHand")));
  if (!variantId || !Number.isInteger(onHand) || onHand < 0) {
    redirect("/admin/inventory?error=fields");
  }
  try {
    const db = getDb();
    const [before] = await db
      .select()
      .from(inventory)
      .where(eq(inventory.variantId, variantId))
      .limit(1);
    const [after] = await db
      .update(inventory)
      .set({ onHand, updatedAt: new Date() })
      .where(eq(inventory.variantId, variantId))
      .returning();
    await logAudit({
      entity: "inventory",
      entityId: variantId,
      action: "adjust",
      before,
      after,
    });
  } catch {
    redirect("/admin/inventory?error=db");
  }
  revalidatePath("/admin/inventory");
  redirect("/admin/inventory?ok=1");
}

/** Send a launch announcement to SUBSCRIBED entries for a variant, idempotent
 *  per (campaign, email). The page shows the recipient count as a confirm step. */
export async function sendAnnouncementAction(formData: FormData) {
  await assertAuthed();
  const campaign = str(formData.get("campaign"));
  const variantRaw = str(formData.get("variantId"));
  if (!campaign) redirect("/admin/notify?error=campaign");
  const variantId = variantRaw ? Number(variantRaw) : null;
  let result;
  try {
    result = await sendLaunchAnnouncement(campaign, variantId);
    await logAudit({
      entity: "campaign",
      entityId: campaign,
      action: "announce",
      after: result,
    });
  } catch {
    redirect("/admin/notify?error=db");
  }
  redirect(
    `/admin/notify?ok=1&sent=${result.sent}&skipped=${result.skipped}&failed=${result.failed}`,
  );
}
