import type { MetadataRoute } from "next";
import { resolveBaseUrl } from "@/lib/seo";
import { DRINK_FLAVORS, TABLET_FLAVORS, flavorToSlug } from "@/lib/catalog";

/** Sitemap for both zones. Excludes checkout / cart / account / order / admin. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = resolveBaseUrl();
  const staticPaths = [
    "",
    "/drinks",
    "/tablets",
    "/standard",
    "/access",
    "/coa",
    "/coa/drinks",
    "/coa/tablets",
    "/legal/terms",
    "/legal/privacy",
    "/legal/shipping",
    "/legal/refunds",
    "/legal/lab-results",
  ];

  const drinkPdps = DRINK_FLAVORS.map((f) => `/drinks/${flavorToSlug(f)}`);
  const tabletPdps = TABLET_FLAVORS.map((f) => `/tablets/${flavorToSlug(f)}`);

  return [...staticPaths, ...drinkPdps, ...tabletPdps].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
