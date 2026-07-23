import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { orders, orderEvents } from "@/db/schema";
import { constructWebhookEvent } from "@/lib/payments/stripe";
import { canTransition } from "@/db/order-state";
import { sendOrderEmail } from "@/lib/email/send";

/**
 * Stripe webhook, dormant until STRIPE_WEBHOOK_SECRET is set. On a completed
 * checkout it transitions the order to `paid` and appends an order event. (When
 * the processor is the high-risk gateway instead of Stripe, this is where its
 * equivalent notification is handled.)
 */
export async function POST(req: Request): Promise<Response> {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event;
  try {
    const body = await req.text();
    event = constructWebhookEvent(body, sig);
  } catch (err) {
    return new Response(`Webhook error: ${(err as Error).message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { metadata?: { orderNumber?: string } };
    const orderNumber = session.metadata?.orderNumber;
    if (orderNumber) {
      try {
        const db = getDb();
        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.orderNumber, orderNumber))
          .limit(1);
        if (order && canTransition(order.status, "paid")) {
          await db
            .update(orders)
            .set({ status: "paid", updatedAt: new Date() })
            .where(eq(orders.id, order.id));
          await db.insert(orderEvents).values({
            orderId: order.id,
            type: "payment_captured",
            fromStatus: order.status,
            toStatus: "paid",
            payload: { provider: "stripe", eventId: event.id },
          });
          // Fire-and-record; never blocks the transition (idempotent).
          await sendOrderEmail(order.id, "order_confirmation");
        }
      } catch {
        // Return 500 so Stripe retries.
        return new Response("Order update failed", { status: 500 });
      }
    }
  }

  return new Response("ok", { status: 200 });
}
