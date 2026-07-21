import { resolveVariantBySku, computeTotals, type PricedLine } from "./pricing";
import { checkShipping } from "@/lib/compliance/shipping-restrictions";

export type OrderInputItem = { sku: string; quantity: number };

export type OrderDraft =
  | { ok: false; error: string }
  | { ok: true; lines: PricedLine[]; totals: ReturnType<typeof computeTotals> };

/**
 * Validate + price a cart against a destination state. Pure (no DB / no Stripe):
 * resolves each SKU server-side, rejects unavailable items and bad quantities,
 * and blocks any item that can't ship to the destination.
 */
export function buildOrderDraft({
  items,
  state,
}: {
  items: OrderInputItem[];
  state: string;
}): OrderDraft {
  if (!items || items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  const lines: PricedLine[] = [];
  for (const it of items) {
    const v = resolveVariantBySku(it.sku);
    if (!v) return { ok: false, error: `Unknown item: ${it.sku}` };
    if (v.status !== "active") {
      return { ok: false, error: `${v.name} is not available for purchase yet.` };
    }
    const qty = Number(it.quantity);
    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return { ok: false, error: `Invalid quantity for ${v.name}.` };
    }
    const restriction = checkShipping(v.category, state);
    if (!restriction.allowed) {
      return { ok: false, error: `${v.name}: ${restriction.reason}` };
    }
    lines.push({
      sku: v.sku,
      name: v.name,
      category: v.category,
      quantity: qty,
      unitPriceCents: v.priceCents,
      lineTotalCents: v.priceCents * qty,
    });
  }

  return { ok: true, lines, totals: computeTotals(lines) };
}
