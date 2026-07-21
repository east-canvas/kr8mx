import "server-only";
import Stripe from "stripe";
import type { PricedLine, OrderTotals } from "@/lib/orders/pricing";

/**
 * Stripe integration. Fully dormant until STRIPE_SECRET_KEY is set — checkout
 * then falls back to creating a pending order without charging. Use Stripe TEST
 * keys to validate card checkout end-to-end now; a bank account is only needed
 * for live payouts at launch.
 */
export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

let cached: Stripe | null = null;
function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  cached = new Stripe(key);
  return cached;
}

/**
 * Create a hosted Stripe Checkout session for an order and return its URL.
 * Shipping is added as a separate line item; prices are the server-resolved
 * cents (never client values).
 */
export async function createCheckoutSession(args: {
  orderNumber: string;
  email: string;
  lines: PricedLine[];
  totals: OrderTotals;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripe();

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = args.lines.map(
    (l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "usd",
        unit_amount: l.unitPriceCents,
        product_data: { name: l.name, metadata: { sku: l.sku } },
      },
    }),
  );

  if (args.totals.shippingCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: args.totals.shippingCents,
        product_data: { name: "Shipping" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: args.email,
    line_items: lineItems,
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    metadata: { orderNumber: args.orderNumber },
    payment_intent_data: { metadata: { orderNumber: args.orderNumber } },
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

/** Verify + parse a Stripe webhook event (throws if signature invalid). */
export function constructWebhookEvent(
  payload: string,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}
