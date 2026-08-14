import type { Flavor } from "@/db/schema";
import {
  FLAVOR_META,
  getDrinkVariants,
  getTabletsCatalog,
  flavorToSlug,
  applyPriceOverrides,
} from "@/lib/catalog";
import { resolveBaseUrl } from "@/lib/seo";

/* =============================================================================
   JSON-LD for product pages. Deliberately omits any consumption/medical or
   nutrition properties, no health, dosage, or effect signals. Base URL always
   resolves from the environment so staging/preview builds emit correct @id/url.
   ============================================================================= */

export function buildDrinkProductGroupJsonLd(
  flavor: Flavor,
  priceOverrides?: Map<string, number>,
) {
  const site = resolveBaseUrl();
  const meta = FLAVOR_META[flavor];
  const variants = applyPriceOverrides(getDrinkVariants(flavor), priceOverrides);
  const url = `${site}/drinks/${flavorToSlug(flavor)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": url,
    name: `KR8MX ${meta.name} Drink`,
    url,
    brand: { "@type": "Brand", name: "KR8MX" },
    category: "Beverage",
    productGroupID: `K8D-${meta.code}`,
    variesBy: ["https://schema.org/flavor", "https://schema.org/size"],
    hasVariant: variants.map((v) => ({
      "@type": "Product",
      name: `KR8MX ${meta.name} Drink, ${v.packSize}-pack`,
      sku: v.sku,
      flavor: meta.name,
      size: `${v.packSize} x ${v.volumeMl}ml`,
      brand: { "@type": "Brand", name: "KR8MX" },
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: (v.priceCents / 100).toFixed(2),
        availability: "https://schema.org/InStock",
        url,
      },
    })),
  };
}

/* -------------------------------------------------------- tablets ---------- */

/** Per-tablet composition, surfaced as PropertyValues (facts, not claims). */
const TABLET_COMPOSITION: { name: string; value: string }[] = [
  { name: "MitraGen+ kratom leaf extract", value: "100 mg per tablet" },
  { name: "Speciociliatine", value: "150 mg per tablet" },
  { name: "Mitragynine", value: "50 mg per tablet" },
  { name: "Total kratom alkaloids", value: "300 mg per tablet" },
];

function tabletDescription(name: string): string {
  return `KR8MX ${name} kratom leaf extract tablets, led by Speciociliatine (150 mg) with Mitragynine (50 mg) via MitraGen+, 300 mg total kratom alkaloids per tablet. No added 7-hydroxymitragynine (7-OH), lab-tested every lot. 21 plus.`;
}

/** Product schema for a single tablet flavor PDP. Premarket, so no live offer. */
export function buildTabletProductJsonLd(
  flavor: Flavor,
  opts: { name?: string; description?: string; imageUrl?: string | null } = {},
) {
  const site = resolveBaseUrl();
  const meta = FLAVOR_META[flavor];
  const displayName = opts.name ?? meta.name;
  const url = `${site}/tablets/${flavorToSlug(flavor)}`;
  const image =
    opts.imageUrl && opts.imageUrl.startsWith("http")
      ? opts.imageUrl
      : opts.imageUrl
        ? `${site}${opts.imageUrl}`
        : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `KR8MX ${displayName} Kratom Leaf Extract Tablets`,
    url,
    category: "Kratom Leaf Extract Tablets",
    brand: { "@type": "Brand", name: "KR8MX" },
    ...(image ? { image } : {}),
    description: opts.description || tabletDescription(displayName),
    additionalProperty: TABLET_COMPOSITION.map((c) => ({
      "@type": "PropertyValue",
      name: c.name,
      value: c.value,
    })),
  };
}

/** ItemList schema for the tablets collection page. */
export function buildTabletsItemListJsonLd() {
  const site = resolveBaseUrl();
  const catalog = getTabletsCatalog();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "KR8MX Kratom Leaf Extract Tablets",
    itemListElement: catalog.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${site}/tablets/${flavorToSlug(item.flavor)}`,
      name: `KR8MX ${FLAVOR_META[item.flavor].name} Kratom Leaf Extract Tablets`,
    })),
  };
}
