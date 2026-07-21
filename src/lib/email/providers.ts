import "server-only";
import { getDb } from "@/db/client";
import { emailOutbox } from "@/db/schema";
import type { EmailProvider, SendArgs, SendResult, WebhookResult } from "./types";

/**
 * Dev provider: renders are written to the email_outbox table and logged
 * instead of being sent. Lets the whole flow run with no email vendor.
 */
export class MockProvider implements EmailProvider {
  readonly name = "mock";

  async sendTransactional(args: SendArgs): Promise<SendResult> {
    try {
      const db = getDb();
      const [row] = await db
        .insert(emailOutbox)
        .values({
          toEmail: args.to,
          template: args.template,
          subject: args.subject,
          html: args.html,
          data: args.data ?? null,
        })
        .returning({ id: emailOutbox.id });
      console.log(`[email:mock] -> ${args.to} "${args.subject}" (${args.template})`);
      return { ok: true, providerMessageId: `mock-${row.id}` };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  verifyWebhook(): WebhookResult {
    return { type: "unknown" };
  }
}

/**
 * Resend slot — active when RESEND_API_KEY is set.
 *
 * README / TODO-VERIFY (domain auth — set real values in DNS, do NOT fabricate):
 *   - SPF   TXT  @   "v=spf1 include:<resend> ~all"     (TODO-VERIFY)
 *   - DKIM  CNAME    resend._domainkey -> <resend>       (TODO-VERIFY)
 *   - DMARC TXT  _dmarc "v=DMARC1; p=quarantine; ..."    (TODO-VERIFY)
 * Swapping to Postmark = another implementation of this same interface.
 */
export class ResendProvider implements EmailProvider {
  readonly name = "resend";
  constructor(
    private apiKey: string,
    private from = "KR8MX <no-reply@kr8mx.com>",
  ) {}

  async sendTransactional(args: SendArgs): Promise<SendResult> {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: args.to,
          subject: args.subject,
          html: args.html,
        }),
      });
      if (!res.ok) return { ok: false, error: `Resend ${res.status}` };
      const json = (await res.json()) as { id?: string };
      return { ok: true, providerMessageId: json.id };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  }

  verifyWebhook(payload: string): WebhookResult {
    // TODO: verify Resend webhook signature; parse delivery/bounce events.
    try {
      const e = JSON.parse(payload) as { type?: string; data?: { email?: string } };
      const map: Record<string, WebhookResult["type"]> = {
        "email.delivered": "delivered",
        "email.bounced": "bounce",
        "email.complained": "complaint",
      };
      return { type: map[e.type ?? ""] ?? "unknown", email: e.data?.email };
    } catch {
      return { type: "unknown" };
    }
  }
}

export function getEmailProvider(): EmailProvider {
  const key = process.env.RESEND_API_KEY;
  if (key) return new ResendProvider(key);
  return new MockProvider();
}
