import type { MetadataRoute } from "next";
import { resolveBaseUrl } from "@/lib/seo";

const DISALLOW = ["/checkout", "/cart", "/account", "/order", "/admin", "/api"];

/**
 * Allow general + AI crawlers (KR8MX opts INTO AI indexing); keep transactional
 * and internal routes out. /admin is also disallowed here per prompt 10.
 */
export default function robots(): MetadataRoute.Robots {
  const base = resolveBaseUrl();
  const aiBots = [
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "OAI-SearchBot",
    "Google-Extended",
  ];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      ...aiBots.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
