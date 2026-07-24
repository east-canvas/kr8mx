/* =============================================================================
   Wholesale sales catalog. The B2B order system sells the tablet line for two
   brands, five flavors, by the case (200 bottles) or the individual bottle.
   Pure data + helpers so the order form and totals stay deterministic.
   ============================================================================= */

export const SALES_BRANDS = ["KR8MX", "Sigma 7"] as const;
export type SalesBrand = (typeof SALES_BRANDS)[number];

export const SALES_FLAVORS = [
  "Grape",
  "Lemon",
  "Peach",
  "Strawberry",
  "Blue Razz",
] as const;
export type SalesFlavor = (typeof SALES_FLAVORS)[number];

/** Bottles in a full case (packing spec: 200 bottles per box). */
export const CASE_BOTTLES = 200;

export type SalesUnit = "case" | "bottle";
export const SALES_UNITS: SalesUnit[] = ["case", "bottle"];

export function bottlesPerUnit(unit: SalesUnit): number {
  return unit === "case" ? CASE_BOTTLES : 1;
}

const BRAND_CODE: Record<SalesBrand, string> = {
  KR8MX: "K8",
  "Sigma 7": "S7",
};

const FLAVOR_CODE: Record<SalesFlavor, string> = {
  Grape: "GRP",
  Lemon: "LEM",
  Peach: "PCH",
  Strawberry: "STR",
  "Blue Razz": "BLZ",
};

export type SalesProduct = {
  sku: string;
  brand: SalesBrand;
  flavor: SalesFlavor;
  label: string; // "KR8MX Tablets, Grape"
};

/** SKU for a brand + flavor tablet product, e.g. "K8-TAB-GRP". */
export function salesSku(brand: SalesBrand, flavor: SalesFlavor): string {
  return `${BRAND_CODE[brand]}-TAB-${FLAVOR_CODE[flavor]}`;
}

/** The full sales product matrix (2 brands x 5 flavors = 10 tablet SKUs). */
export function salesCatalog(): SalesProduct[] {
  const out: SalesProduct[] = [];
  for (const brand of SALES_BRANDS) {
    for (const flavor of SALES_FLAVORS) {
      out.push({
        sku: salesSku(brand, flavor),
        brand,
        flavor,
        label: `${brand} Tablets, ${flavor}`,
      });
    }
  }
  return out;
}

/** Human-friendly sales order number: SO-{YYMMDD}-{5 base32}. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function generateSalesOrderNumber(now: Date = new Date()): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `SO-${yy}${mm}${dd}-${suffix}`;
}

export const SALES_ORDER_STATUSES = [
  "new",
  "invoiced",
  "paid",
  "submitted",
  "cancelled",
] as const;
export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number];

export const SALES_STATUS_LABEL: Record<SalesOrderStatus, string> = {
  new: "New",
  invoiced: "Invoiced",
  paid: "Paid",
  submitted: "Submitted",
  cancelled: "Cancelled",
};
