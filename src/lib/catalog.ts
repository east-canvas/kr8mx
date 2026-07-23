import type { Flavor, ProductContent } from "@/db/schema";
import {
  FLAVORS,
  FLAVOR_NAME,
  FLAVOR_CODE,
  DRINK_PACK_SIZES,
  buildVariants,
} from "@/db/seed-data";

/* =============================================================================
   Catalog access for the storefront. Derived from the pure seed builders so the
   collection/PDP render (and their tests run) without a live DB connection. Once
   DATABASE_URL is wired, the same shapes can be served from product_variants.
   ============================================================================= */

export type DrinkPackSize = (typeof DRINK_PACK_SIZES)[number];

export type FlavorMeta = {
  flavor: Flavor;
  name: string;
  code: string;
  /** flavor accent hex — the abstract-gradient tint on dark drink cards */
  hex: string;
};

const FLAVOR_HEX: Record<Flavor, string> = {
  grape: "#8e6ccf",
  strawberry: "#eb4c5b",
  blue_razz: "#20b1c9",
  lemon: "#ffd34d",
  peach: "#ff9a4d",
};

export const FLAVOR_META: Record<Flavor, FlavorMeta> = Object.fromEntries(
  FLAVORS.map((f) => [
    f,
    { flavor: f, name: FLAVOR_NAME[f], code: FLAVOR_CODE[f], hex: FLAVOR_HEX[f] },
  ]),
) as Record<Flavor, FlavorMeta>;

export const DRINK_FLAVORS = FLAVORS;
export const PACK_SIZES = DRINK_PACK_SIZES;

/**
 * Default can artwork per flavor (committed under public/brand/drinks). Used as
 * the storefront visual when no admin-uploaded image overrides it, so the real
 * product shots show without depending on the DB / Blob.
 */
const DRINK_IMAGE: Record<Flavor, string> = {
  grape: "/brand/drinks/grape.png",
  strawberry: "/brand/drinks/strawberry.png",
  blue_razz: "/brand/drinks/blue-razz.png",
  lemon: "/brand/drinks/lemon.png",
  peach: "/brand/drinks/peach.png",
};

export function defaultDrinkImage(flavor: Flavor): string {
  return DRINK_IMAGE[flavor];
}

export type DrinkVariant = {
  sku: string;
  flavor: Flavor;
  packSize: DrinkPackSize;
  priceCents: number;
  volumeMl: number;
};

const ALL_VARIANTS = buildVariants();

/** Flavor slug used in URLs, e.g. blue_razz -> "blue-razz". */
export function flavorToSlug(flavor: Flavor): string {
  return flavor.replace("_", "-");
}

export function slugToFlavor(slug: string): Flavor | null {
  const f = slug.replace("-", "_") as Flavor;
  return (FLAVORS as readonly string[]).includes(f) ? f : null;
}

/** All drink variants for a flavor, ordered by pack size ascending. */
export function getDrinkVariants(flavor: Flavor): DrinkVariant[] {
  return ALL_VARIANTS.filter(
    (v) => v.productSlug === `drink-${flavorToSlug(flavor)}`,
  )
    .map((v) => {
      const cfg = v.packConfig as { units: number; volumeMl: number };
      return {
        sku: v.sku,
        flavor,
        packSize: cfg.units as DrinkPackSize,
        priceCents: v.priceCents,
        volumeMl: cfg.volumeMl,
      };
    })
    .sort((a, b) => a.packSize - b.packSize);
}

/**
 * Layer live DB prices (SKU → cents) over seed-default variants. Pure — pages
 * fetch the map and apply it so displayed prices match what checkout charges.
 * A SKU absent from the map keeps its seed price. Generic over any priced,
 * SKU-keyed variant (drinks or tablets).
 */
export function applyPriceOverrides<T extends { sku: string; priceCents: number }>(
  variants: T[],
  priceMap?: Map<string, number>,
): T[] {
  if (!priceMap || priceMap.size === 0) return variants;
  return variants.map((v) => {
    const cents = priceMap.get(v.sku);
    return typeof cents === "number" ? { ...v, priceCents: cents } : v;
  });
}

/** Resolve a single drink variant by flavor + pack size (SKU + price). */
export function resolveDrinkVariant(
  flavor: Flavor,
  packSize: DrinkPackSize,
): DrinkVariant {
  const match = getDrinkVariants(flavor).find((v) => v.packSize === packSize);
  if (!match) {
    throw new Error(`No drink variant for ${flavor} / ${packSize}-pack`);
  }
  return match;
}

/** The full drinks catalog for collection rendering. */
export function getDrinksCatalog(): Array<FlavorMeta & { variants: DrinkVariant[] }> {
  return FLAVORS.map((flavor) => ({
    ...FLAVOR_META[flavor],
    variants: getDrinkVariants(flavor),
  }));
}

/* ---------------------------------------------------------------- tablets -- */

export const TABLET_FLAVORS = FLAVORS;

export type TabletForm = "blister" | "container";

export type TabletVariant = {
  sku: string;
  flavor: Flavor;
  form: TabletForm;
  tablets: number;
  mgPerTab: number;
  priceCents: number;
  status: "active" | "coming_soon";
};

/** Human label for a tablet pack, e.g. "5-tablet blister". */
export function tabletPackLabel(v: Pick<TabletVariant, "form" | "tablets">): string {
  return v.form === "blister"
    ? `${v.tablets}-tablet blister`
    : `${v.tablets}-tablet container`;
}

/** All tablet variants for a flavor, blister (smaller) before container. */
export function getTabletVariants(flavor: Flavor): TabletVariant[] {
  return ALL_VARIANTS.filter(
    (v) => v.productSlug === `tablet-${flavorToSlug(flavor)}`,
  )
    .map((v) => {
      const cfg = v.packConfig as {
        kind: string;
        tablets: number;
        mgPerTab: number;
      };
      return {
        sku: v.sku,
        flavor,
        form: (cfg.kind === "blister" ? "blister" : "container") as TabletForm,
        tablets: cfg.tablets,
        mgPerTab: cfg.mgPerTab,
        priceCents: v.priceCents,
        status: v.status,
      };
    })
    .sort((a, b) => a.tablets - b.tablets);
}

/** The full tablets catalog for collection rendering. */
export function getTabletsCatalog(): Array<
  FlavorMeta & { variants: TabletVariant[] }
> {
  return FLAVORS.map((flavor) => ({
    ...FLAVOR_META[flavor],
    variants: getTabletVariants(flavor),
  }));
}

/**
 * Resolved, display-ready product content for a flavor: the static defaults
 * (name / accent) with any admin-edited overrides layered on top, plus optional
 * marketing copy and a hero image. `imageUrl === null` means render the
 * CanSilhouette fallback. A pure merge so pages and tests stay deterministic.
 */
export type ResolvedContent = {
  flavor: Flavor;
  name: string;
  hex: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
};

function isNonEmpty(v: string | null | undefined): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function resolveContent(
  flavor: Flavor,
  override?: ProductContent | null,
): ResolvedContent {
  const base = FLAVOR_META[flavor];
  return {
    flavor,
    name: isNonEmpty(override?.name) ? override!.name!.trim() : base.name,
    hex: isNonEmpty(override?.accentHex) ? override!.accentHex!.trim() : base.hex,
    tagline: isNonEmpty(override?.tagline) ? override!.tagline!.trim() : null,
    description: isNonEmpty(override?.description)
      ? override!.description!.trim()
      : null,
    imageUrl: isNonEmpty(override?.imageUrl) ? override!.imageUrl!.trim() : null,
  };
}
