"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, orderItems, orderEvents } from "@/db/schema";
import { buildOrderDraft, type OrderInputItem } from "@/lib/orders/build-order";
import { generateOrderNumber } from "@/lib/orders/order-number";
import { assertTransition } from "@/db/order-state";
import { getVariantIdsBySku, getVariantPriceMap } from "@/db/queries";
import { isStripeConfigured, createCheckoutSession } from "@/lib/payments/stripe";

const US_STATE_RE = /^[A-Za-z]{2}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type PlaceOrderResult =
  | { ok: false; error: string }
  | { ok: true; orderNumber: string; redirectUrl?: string };

/**
 * Create an order from the (untrusted) cart. Re-prices server-side, enforces
 * shipping restrictions, writes orders/order_items/order_events, then either
 * starts a Stripe Checkout session (if configured) or leaves the order
 * awaiting_payment for later fulfillment.
 */
export async function placeOrder(input: {
  email: string;
  state: string;
  items: OrderInputItem[];
}): Promise<PlaceOrderResult> {
  const email = input.email?.trim();
  const state = input.state?.trim().toUpperCase();

  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!state || !US_STATE_RE.test(state)) {
    return { ok: false, error: "Select a destination state." };
  }

  // Re-price against live DB prices (admin-editable), falling back to seed.
  const priceOverrides = await getVariantPriceMap();
  const draft = buildOrderDraft({ items: input.items, state, priceOverrides });
  if (!draft.ok) return { ok: false, error: draft.error };

  const orderNumber = generateOrderNumber();
  const { lines, totals } = draft;

  // Resolve variant FKs from SKUs (order_items.variant_id is NOT NULL).
  const variantIds = await getVariantIdsBySku(lines.map((l) => l.sku));
  const missing = lines.find((l) => !variantIds.get(l.sku));
  if (missing) {
    return {
      ok: false,
      error: "One or more items are unavailable. Please refresh your cart.",
    };
  }

  let orderId: number;
  try {
    const db = getDb();
    const [order] = await db
      .insert(orders)
      .values({
        orderNumber,
        status: "pending",
        email,
        shipState: state,
        subtotalCents: totals.subtotalCents,
        shippingCents: totals.shippingCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
      })
      .returning({ id: orders.id });
    orderId = order.id;

    await db.insert(orderItems).values(
      lines.map((l) => ({
        orderId,
        variantId: variantIds.get(l.sku)!,
        sku: l.sku,
        nameSnapshot: l.name,
        quantity: l.quantity,
        unitPriceCents: l.unitPriceCents,
        lineTotalCents: l.lineTotalCents,
      })),
    );

    await db.insert(orderEvents).values({
      orderId,
      type: "created",
      toStatus: "pending",
      payload: { itemCount: lines.length, totalCents: totals.totalCents },
    });
  } catch {
    return {
      ok: false,
      error: "We couldn't create your order. Please try again.",
    };
  }

  // Advance to awaiting_payment.
  try {
    assertTransition("pending", "awaiting_payment");
    const db = getDb();
    await db
      .update(orders)
      .set({ status: "awaiting_payment", updatedAt: new Date() })
      .where(eq(orders.id, orderId));
    await db.insert(orderEvents).values({
      orderId,
      type: "status_changed",
      fromStatus: "pending",
      toStatus: "awaiting_payment",
    });
  } catch {
    /* non-fatal: order exists; leave as pending */
  }

  // Hand off to Stripe when configured; otherwise return the pending order.
  if (isStripeConfigured()) {
    try {
      const h = await headers();
      const proto = h.get("x-forwarded-proto") ?? "https";
      const host = h.get("host") ?? "www.kr8mx.com";
      const origin = `${proto}://${host}`;
      const redirectUrl = await createCheckoutSession({
        orderNumber,
        email,
        lines,
        totals,
        successUrl: `${origin}/order/${orderNumber}?paid=1`,
        cancelUrl: `${origin}/cart`,
      });
      return { ok: true, orderNumber, redirectUrl };
    } catch {
      return { ok: true, orderNumber }; // order saved; payment can be retried
    }
  }

  return { ok: true, orderNumber };
}
