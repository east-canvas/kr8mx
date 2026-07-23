import type { Flavor, ProductCategory, VariantStatus } from "./schema";

/* =============================================================================
   Seed data, pure builders (no DB access) so they can be unit-tested directly.
   The seed *script* (seed.ts) imports these and inserts them.
   ============================================================================= */

/** Ordered flavor set shared by both lines. */
export const FLAVORS: readonly Flavor[] = [
  "grape",
  "strawberry",
  "blue_razz",
  "lemon",
  "peach",
] as const;

/** Short uppercase SKU code per flavor (SKUs are uppercase codes by convention). */
export const FLAVOR_CODE: Record<Flavor, string> = {
  grape: "GRP",
  strawberry: "STR",
  blue_razz: "BLZ",
  lemon: "LEM",
  peach: "PCH",
};

export const FLAVOR_NAME: Record<Flavor, string> = {
  grape: "Grape",
  strawberry: "Strawberry",
  blue_razz: "Blue Razz",
  lemon: "Lemon",
  peach: "Peach",
};

export const DRINK_PACK_SIZES = [6, 12, 24] as const;

/* ---------------------------------------------------------------------------
   PLACEHOLDER PRICES, TODO: replace all values below with confirmed retail
   pricing before launch. Every price here is a placeholder in integer cents.
   --------------------------------------------------------------------------- */
export const PLACEHOLDER_PRICES = {
  drinks: {
    6: 1799, // TODO price
    12: 2999, // TODO price
    24: 5499, // TODO price
  } as Record<(typeof DRINK_PACK_SIZES)[number], number>,
  tablets: {
    container10: 2499, // TODO price
    blister5: 1499, // TODO price
  },
} as const;

export type SeedLine = {
  slug: ProductCategory;
  name: string;
  theme: string;
  tagline: string;
  sortOrder: number;
};

export type SeedProduct = {
  lineSlug: ProductCategory;
  slug: string;
  name: string;
  proprietaryIngredient: string;
  flavor: Flavor;
  sortOrder: number;
};

export type SeedVariant = {
  productSlug: string;
  sku: string;
  flavor: Flavor;
  packConfig: Record<string, unknown>;
  priceCents: number;
  status: VariantStatus;
  /** true where priceCents is a placeholder awaiting confirmation */
  priceTodo: boolean;
};

export function buildLines(): SeedLine[] {
  return [
    {
      slug: "drinks",
      name: "KR8MX Energy Drink",
      theme: "performance",
      tagline: "Performance. Elevated.",
      sortOrder: 0,
    },
    {
      slug: "tablets",
      name: "KR8MX Tablets",
      theme: "precision",
      tagline: "Precision. Elevated.",
      sortOrder: 1,
    },
  ];
}

export function buildProducts(): SeedProduct[] {
  const products: SeedProduct[] = [];
  FLAVORS.forEach((flavor, i) => {
    products.push({
      lineSlug: "drinks",
      slug: `drink-${flavor.replace("_", "-")}`,
      name: `KR8MX ${FLAVOR_NAME[flavor]} Energy Drink`,
      proprietaryIngredient: "MitraGen+",
      flavor,
      sortOrder: i,
    });
  });
  FLAVORS.forEach((flavor, i) => {
    products.push({
      lineSlug: "tablets",
      slug: `tablet-${flavor.replace("_", "-")}`,
      name: `KR8MX ${FLAVOR_NAME[flavor]} Tablets`,
      proprietaryIngredient: "MitraGen+",
      flavor,
      sortOrder: i,
    });
  });
  return products;
}

export function buildVariants(): SeedVariant[] {
  const variants: SeedVariant[] = [];

  // Drinks: 5 flavors x pack sizes {6,12,24}. SKU: K8D-{FLV}-{06|12|24}
  for (const flavor of FLAVORS) {
    for (const size of DRINK_PACK_SIZES) {
      const pad = String(size).padStart(2, "0");
      variants.push({
        productSlug: `drink-${flavor.replace("_", "-")}`,
        sku: `K8D-${FLAVOR_CODE[flavor]}-${pad}`,
        flavor,
        packConfig: { kind: "case", units: size, volumeMl: 355 },
        priceCents: PLACEHOLDER_PRICES.drinks[size],
        status: "active",
        priceTodo: true,
      });
    }
  }

  // Tablets: per flavor a 10-tab container + a 5-tab blister, all coming_soon.
  //   container SKU: KR8-T100-10-{FLV}
  //   blister   SKU: KR8-T100-05B-{FLV}
  for (const flavor of FLAVORS) {
    variants.push({
      productSlug: `tablet-${flavor.replace("_", "-")}`,
      sku: `KR8-T100-10-${FLAVOR_CODE[flavor]}`,
      flavor,
      packConfig: { kind: "tablet_container", tablets: 10, mgPerTab: 100 },
      priceCents: PLACEHOLDER_PRICES.tablets.container10,
      status: "coming_soon",
      priceTodo: true,
    });
    variants.push({
      productSlug: `tablet-${flavor.replace("_", "-")}`,
      sku: `KR8-T100-05B-${FLAVOR_CODE[flavor]}`,
      flavor,
      packConfig: { kind: "blister", tablets: 5, mgPerTab: 100 },
      priceCents: PLACEHOLDER_PRICES.tablets.blister5,
      status: "coming_soon",
      priceTodo: true,
    });
  }

  return variants;
}

/** Convenience bundle for the seed script + integrity tests. */
export function buildSeed() {
  return {
    lines: buildLines(),
    products: buildProducts(),
    variants: buildVariants(),
  };
}
