"use server";

import { getDb } from "@/db/client";
import { leads } from "@/db/schema";
import { getEmailProvider } from "@/lib/email/providers";
import {
  leadNotificationEmail,
  leadAutoReplyEmail,
} from "@/lib/email/templates";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TYPES = ["wholesale", "retail", "general"] as const;
type LeadType = (typeof TYPES)[number];

// Where lead notifications will ultimately land once that inbox is live.
const LEADS_INBOX = "info@kr8mx.com";
// info@kr8mx.com is not receiving mail yet, so for now we redirect to a working
// inbox for testing. To go live: set LEADS_NOTIFY_EMAIL to LEADS_INBOX (or drop
// the fallback below) once info@kr8mx.com is active. No other change needed.
const LEADS_REDIRECT_UNTIL_INBOX_LIVE = "aj@gelhq.com";
const LEADS_RECIPIENT =
  process.env.LEADS_NOTIFY_EMAIL || LEADS_REDIRECT_UNTIL_INBOX_LIVE;
void LEADS_INBOX;

const clip = (v: string | undefined, max: number) => {
  const s = v?.trim();
  return s ? s.slice(0, max) : null;
};

/**
 * Capture a wholesale / retail / general inquiry from the public contact form.
 * Persists the lead (sales pipeline), then fires two best-effort emails: an
 * internal notification and a branded auto-reply to the submitter. The saved
 * lead is the source of truth; an email failure never fails the submission.
 */
export async function submitLead(input: {
  type?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  businessType?: string;
  volume?: string;
  location?: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const type = (TYPES as readonly string[]).includes(input.type ?? "")
    ? (input.type as LeadType)
    : "general";
  const company = clip(input.company, 120);
  const phone = clip(input.phone, 40);
  const businessType = clip(input.businessType, 80);
  const volume = clip(input.volume, 80);
  const location = clip(input.location, 80);
  const message = clip(input.message, 4000);

  if (!name || name.length < 2) {
    return { ok: false, error: "Enter your name." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  let lead;
  try {
    const db = getDb();
    const [row] = await db
      .insert(leads)
      .values({
        type,
        name: name.slice(0, 160),
        email,
        company,
        phone,
        businessType,
        volume,
        location,
        message,
      })
      .returning();
    lead = row;
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }

  // Best-effort emails; the lead is already saved.
  try {
    const provider = getEmailProvider();
    const internal = leadNotificationEmail(lead);
    const autoReply = leadAutoReplyEmail(lead);
    await Promise.allSettled([
      provider.sendTransactional({
        to: LEADS_RECIPIENT,
        template: "lead_notification",
        subject: internal.subject,
        html: internal.html,
      }),
      provider.sendTransactional({
        to: lead.email,
        template: "lead_auto_reply",
        subject: autoReply.subject,
        html: autoReply.html,
      }),
    ]);
  } catch {
    /* ignore: submission already succeeded */
  }

  return { ok: true };
}
