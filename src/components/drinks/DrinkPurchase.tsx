"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/lib/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatCents } from "@/db/money";

export type PurchaseVariant = {
  sku: string;
  packSize: number;
  priceCents: number;
  volumeMl: number;
};

/**
 * PDP purchase controls: pack-size selector (per-pack pricing), quantity, and
 * add-to-cart. Variant resolution is by pack size; the resolved SKU + price feed
 * the cart. Acid lime is used only for the active state and the CTA.
 */
export function DrinkPurchase({
  flavor,
  flavorName,
  variants,
}: {
  flavor: string;
  flavorName: string;
  variants: PurchaseVariant[];
}) {
  const [packSize, setPackSize] = useState(variants[0]?.packSize ?? 12);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const selected = useMemo(
    () => variants.find((v) => v.packSize === packSize) ?? variants[0],
    [variants, packSize],
  );

  function handleAdd() {
    if (!selected) return;
    addItem(
      {
        sku: selected.sku,
        name: `KR8MX Energy Drink — ${flavorName}, ${selected.packSize}-pack`,
        flavor,
        packSize: selected.packSize,
        unitPriceCents: selected.priceCents,
      },
      quantity,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* pack-size selector */}
      <fieldset className="flex flex-col gap-3">
        <legend className="type-kicker mb-1 text-muted">Pack size</legend>
        <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Pack size">
          {variants.map((v) => {
            const active = v.packSize === packSize;
            return (
              <button
                key={v.sku}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPackSize(v.packSize)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border px-4 py-4 transition-colors duration-base ease-out-brand",
                  active
                    ? "border-accent bg-accent/10 text-primary"
                    : "border-hairline text-secondary hover:border-secondary",
                )}
              >
                <span className="type-display text-lg">{v.packSize}</span>
                <span className="text-2xs uppercase tracking-wide text-muted">
                  Pack
                </span>
                <span className="mt-1 text-xs text-primary">
                  {formatCents(v.priceCents)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* quantity + price */}
      <div className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <span className="type-kicker text-muted">Quantity</span>
          <div className="flex items-center gap-1 rounded-md border border-hairline">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3.5 py-2 text-primary transition-colors duration-fast hover:text-accent"
            >
              &minus;
            </button>
            <span className="min-w-8 text-center text-sm text-primary" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              className="px-3.5 py-2 text-primary transition-colors duration-fast hover:text-accent"
            >
              +
            </button>
          </div>
        </div>

        <div className="text-right">
          <span className="type-kicker block text-muted">Total</span>
          <span className="type-display text-2xl text-primary">
            {formatCents((selected?.priceCents ?? 0) * quantity)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="solid" size="lg" onClick={handleAdd} className="w-full">
          {added ? "Added to cart" : "Add to cart"}
        </Button>
        {selected ? (
          <p className="text-2xs text-muted">SKU {selected.sku}</p>
        ) : null}
      </div>
    </div>
  );
}
