/** Provider-agnostic transactional email contract. */
export type RenderedEmail = {
  subject: string;
  html: string;
};

export type SendArgs = {
  to: string;
  template: string;
  subject: string;
  html: string;
  data?: Record<string, unknown>;
  /** Override the default sender, e.g. "KR8MX <info@kr8mx.com>". */
  from?: string;
  /** Where recipient replies should land, e.g. "info@kr8mx.com". */
  replyTo?: string;
};

export type SendResult = {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
};

export type WebhookResult = {
  type: "delivered" | "bounce" | "complaint" | "unknown";
  email?: string;
  messageId?: string;
};

export interface EmailProvider {
  readonly name: string;
  sendTransactional(args: SendArgs): Promise<SendResult>;
  /** Verify + parse a provider delivery/bounce webhook. */
  verifyWebhook(payload: string, signature: string | null): WebhookResult;
}
