/* =============================================================================
   SEO helpers, base URL resolution + structured data. Claim-free throughout.
   ============================================================================= */

export const SITE = {
  name: "KR8MX",
  alternateName: "Kr8Mx",
  tagline: "Pure Science.",
  legalName: "Gel Trading Group LLC",
  // Brand-defining description. Helps search + AI overviews recognize KR8MX as
  // a distinct brand (not the Keychron keyboard) with clear products.
  description:
    "KR8MX is a premium 21+ kratom-derived brand. KR8MX Tablets deliver 100 mg MitraGen+™ per tablet in bottle and blister-pack formats, in five flavors: Grape, Lemon, Peach, Strawberry, and Blue Razz. MitraGen+™ is a proprietary formula by Mitragen Labs.",
  mitragen: {
    name: "MitraGen+™",
    owner: "Mitragen Labs",
  },
} as const;

/** NEXT_PUBLIC_SITE_URL (origin only) → VERCEL_URL → localhost. */
export function resolveBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit).origin;
    } catch {
      /* ignore malformed env */
    }
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/** Sitewide Organization + Brand JSON-LD. Defines KR8MX as a distinct brand. */
export function organizationJsonLd() {
  const base = resolveBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: SITE.name,
    alternateName: SITE.alternateName,
    legalName: SITE.legalName,
    url: base,
    logo: {
      "@type": "ImageObject",
      url: `${base}/brand/kr8mx-wordmark-black.png`,
    },
    image: `${base}/brand/og-default.png`,
    description: SITE.description,
    slogan: SITE.tagline,
    brand: {
      "@type": "Brand",
      name: SITE.name,
      slogan: SITE.tagline,
      logo: `${base}/brand/kr8mx-wordmark-black.png`,
    },
    // MitraGen+™ is a proprietary formula owned by Mitragen Labs.
    knowsAbout: [SITE.mitragen.name, SITE.mitragen.owner, "kratom tablets"],
    sameAs: [], // TODO: add verified social profiles to strengthen the entity
  };
}

/** WebSite JSON-LD, tied to the Organization, so search engines link the two. */
export function websiteJsonLd() {
  const base = resolveBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: SITE.name,
    alternateName: SITE.alternateName,
    url: base,
    description: SITE.description,
    inLanguage: "en-US",
    publisher: { "@id": `${base}/#organization` },
  };
}

/** AboutPage JSON-LD, linked to the Organization + WebSite entities. */
export function aboutPageJsonLd() {
  const base = resolveBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${base}/about`,
    url: `${base}/about`,
    name: `About ${SITE.name}`,
    description: SITE.description,
    about: { "@id": `${base}/#organization` },
    isPartOf: { "@id": `${base}/#website` },
    inLanguage: "en-US",
  };
}

/** BreadcrumbList JSON-LD from [{name, path}] items (path relative to origin). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const base = resolveBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${base}${it.path}`,
    })),
  };
}

/** Small helper to embed JSON-LD as a script tag payload. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data);
}
