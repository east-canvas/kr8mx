import type { Flavor, ProductCategory } from "@/db/schema";
import { buildVariants, FLAVOR_NAME } from "@/db/seed-data";

/* =============================================================================
   Server-side pricing. The client cart is untrusted — at checkout we resolve
   every SKU's price + name from the catalog here, never from the browser. Pure
   and unit-tested. (Drinks are `active`; tablets are `coming_soon` and cannot be
   purchased yet.)
   ============================================================================= */

const ALL_VARIANTS = buildVariants();

export type ResolvedVariant = {
  sku: string;
  category: ProductCategory;
  flavor: Flavor;
  name: string;
  packSize: number;
  priceCents: number;
  status: "active" | "coming_soon";
};

export function resolveVariantBySku(
  sku: string,
  priceOverrides?: Map<string, number>,
): ResolvedVariant | null {
  const v = ALL_VARIANTS.find((x) => x.sku === sku);
  if (!v) return null;
  // Live DB price wins over the seed default when present.
  const override = priceOverrides?.get(sku);
  const priceCents = typeof override === "number" ? override : v.priceCents;
  const category: ProductCategory = v.productSlug.startsWith("drink-")
    ? "drinks"
    : "tablets";
  const cfg = v.packConfig as {
    kind: string;
    units?: number;
    tablets?: number;
  };
  const flavorName = FLAVOR_NAME[v.flavor];

  let name: string;
  let packSize: number;
  if (category === "drinks") {
    packSize = cfg.units ?? 0;
    name = `KR8MX Energy Drink — ${flavorName}, ${packSize}-pack`;
  } else {
    packSize = cfg.tablets ?? 0;
    const form = cfg.kind === "blister" ? "5-tab blister" : "10-tab";
    name = `KR8MX Tablets — ${flavorName}, ${form}`;
  }

  return {
    sku: v.sku,
    category,
    flavor: v.flavor,
    name,
    packSize,
    priceCents,
    status: v.status,
  };
}

export type PricedLine = {
  sku: string;
  name: string;
  category: ProductCategory;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type OrderTotals = {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

/**
 * TODO: shipping is a flat placeholder (free over $50, else $6.99) and tax is 0
 * pending a real tax provider. Both are computed in integer cents.
 */
export function computeTotals(lines: PricedLine[]): OrderTotals {
  const subtotalCents = lines.reduce((n, l) => n + l.lineTotalCents, 0);
  const shippingCents = subtotalCents === 0 || subtotalCents >= 5000 ? 0 : 699; // TODO
  const taxCents = 0; // TODO: per-destination tax
  return {
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents,
  };
}
