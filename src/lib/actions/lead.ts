"use server";

import { getDb } from "@/db/client";
import { leads } from "@/db/schema";
import { getEmailProvider } from "@/lib/email/providers";
import { leadNotificationEmail } from "@/lib/email/templates";

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

/**
 * Capture a wholesale / retail / general inquiry from the public contact form.
 * Persists the lead (sales pipeline), then fires a best-effort internal
 * notification email. The saved lead is the source of truth; an email failure
 * never fails the submission.
 */
export async function submitLead(input: {
  type?: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const type = (TYPES as readonly string[]).includes(input.type ?? "")
    ? (input.type as LeadType)
    : "general";
  const company = input.company?.trim() || null;
  const phone = input.phone?.trim() || null;
  const message = input.message?.trim() || null;

  if (!name || name.length < 2) {
    return { ok: false, error: "Enter your name." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (message && message.length > 4000) {
    return { ok: false, error: "Message is too long." };
  }

  let lead;
  try {
    const db = getDb();
    const [row] = await db
      .insert(leads)
      .values({ type, name, email, company, phone, message })
      .returning();
    lead = row;
  } catch {
    return { ok: false, error: "Something went wrong. Try again." };
  }

  // Best-effort internal notification; the lead is already saved.
  try {
    const provider = getEmailProvider();
    const rendered = leadNotificationEmail(lead);
    await provider.sendTransactional({
      to: LEADS_RECIPIENT,
      template: "lead_notification",
      subject: rendered.subject,
      html: rendered.html,
    });
  } catch {
    /* ignore: submission already succeeded */
  }

  return { ok: true };
}
