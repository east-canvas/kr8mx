/* =============================================================================
   SEO helpers, base URL resolution + structured data. Claim-free throughout.
   ============================================================================= */

export const SITE = {
  name: "KR8MX",
  tagline: "Performance. Elevated.",
  legalName: "Gel Trading Group LLC",
  license: "2027-R-2248133",
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

/** Sitewide Organization JSON-LD. legalName + license are operator slots. */
export function organizationJsonLd() {
  const base = resolveBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.legalName,
    url: base,
    logo: `${base}/brand/kr8mx-wordmark-black.png`,
    // Operating license for the entity (see footer compliance line).
    identifier: {
      "@type": "PropertyValue",
      propertyID: "license",
      value: SITE.license,
    },
    sameAs: [], // TODO: social profiles
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
