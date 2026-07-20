import type { Flavor } from "@/db/schema";
import { FLAVOR_META, getDrinkVariants, flavorToSlug } from "@/lib/catalog";

/* =============================================================================
   JSON-LD for drink PDPs. A ProductGroup that variesBy flavor + pack size, with
   one Product variant per pack. Deliberately omits any consumption/medical or
   nutrition properties — no health, dosage, or effect signals.
   ============================================================================= */

const SITE = "https://kr8mx.com";

export function buildDrinkProductGroupJsonLd(flavor: Flavor) {
  const meta = FLAVOR_META[flavor];
  const variants = getDrinkVariants(flavor);
  const url = `${SITE}/drinks/${flavorToSlug(flavor)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    "@id": url,
    name: `KR8MX Energy Drink — ${meta.name}`,
    url,
    brand: { "@type": "Brand", name: "KR8MX" },
    category: "Energy Drink",
    productGroupID: `K8D-${meta.code}`,
    variesBy: ["https://schema.org/flavor", "https://schema.org/size"],
    hasVariant: variants.map((v) => ({
      "@type": "Product",
      name: `KR8MX Energy Drink — ${meta.name}, ${v.packSize}-pack`,
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
