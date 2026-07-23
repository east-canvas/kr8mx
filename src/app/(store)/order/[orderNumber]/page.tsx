import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getOrderByNumber } from "@/db/queries";
import { formatCents } from "@/db/money";
import { isStripeConfigured } from "@/lib/payments/stripe";

export const metadata: Metadata = {
  title: "Order",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  paid: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const result = await getOrderByNumber(orderNumber);
  if (!result) notFound();
  const { order, items } = result;
  const paid = order.status === "paid";

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <SectionHeading
        kicker={paid ? "Order Confirmed" : "Order Received"}
        title={paid ? "Thank you." : "Order received."}
        as="h1"
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-secondary">
          Order <span className="text-primary">{order.orderNumber}</span>
        </span>
        <Badge variant={paid ? "accent" : "outline"}>
          {STATUS_LABEL[order.status] ?? order.status}
        </Badge>
      </div>

      {!paid && !isStripeConfigured() ? (
        <p className="mt-4 rounded-md border border-hairline bg-surface-raised px-4 py-3 text-2xs text-secondary">
          Online payment isn&rsquo;t enabled yet, your order is saved and no card
          was charged. We&rsquo;ll be in touch to complete payment before
          fulfillment.
        </p>
      ) : null}

      <HairlineRule className="my-8" />

      <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-primary">{i.nameSnapshot}</span>
              <span className="text-2xs text-muted">
                SKU {i.sku} · Qty {i.quantity}
              </span>
            </div>
            <span className="text-sm text-primary">
              {formatCents(i.lineTotalCents)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd className="text-primary">{formatCents(order.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Shipping</dt>
          <dd className="text-primary">{formatCents(order.shippingCents)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">Tax</dt>
          <dd className="text-primary">{formatCents(order.taxCents)}</dd>
        </div>
        <HairlineRule className="my-1" />
        <div className="flex justify-between">
          <dt className="type-kicker text-muted">Total</dt>
          <dd className="type-display text-xl text-primary">
            {formatCents(order.totalCents)}
          </dd>
        </div>
      </dl>

      <p className="mt-6 text-2xs text-muted">
        A confirmation was sent to {order.email}. Ships to {order.shipState}. 21+
        adult use only.
      </p>

      <div className="mt-8">
        <Button href="/drinks" variant="outline">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
