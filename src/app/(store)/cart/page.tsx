"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatCents } from "@/db/money";

export default function CartPage() {
  const { items, subtotalCents, removeItem, count } = useCart();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading kicker="Your Bag" title="Cart" as="h1" />
      <HairlineRule className="my-8" />

      {count === 0 ? (
        <div className="flex flex-col items-start gap-5 py-10">
          <p className="text-sm text-secondary">Your cart is empty.</p>
          <Button href="/drinks" variant="outline">
            Explore Drinks
          </Button>
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
            {items.map((i) => (
              <li key={i.sku} className="flex items-center justify-between gap-4 py-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-primary">{i.name}</span>
                  <span className="text-2xs text-muted">
                    SKU {i.sku} · Qty {i.quantity}
                  </span>
                </div>
                <div className="flex items-center gap-5">
                  <span className="text-sm text-primary">
                    {formatCents(i.unitPriceCents * i.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(i.sku)}
                    className="text-2xs uppercase tracking-wide text-muted transition-colors hover:text-primary"
                    aria-label={`Remove ${i.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-center justify-between">
            <span className="type-kicker text-muted">Subtotal</span>
            <span className="type-display text-2xl text-primary">
              {formatCents(subtotalCents)}
            </span>
          </div>
          <p className="mt-2 text-2xs text-muted">
            Prices are placeholders pending final pricing. Shipping and tax
            calculated at checkout.
          </p>
          <div className="mt-6">
            <Button href="/checkout" variant="solid" size="lg" className="w-full">
              Checkout
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
