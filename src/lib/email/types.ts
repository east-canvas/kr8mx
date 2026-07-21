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
