import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SlashX } from "@/components/brand/SlashX";
import { ProductVisual } from "@/components/brand/ProductVisual";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { NotifyForm } from "@/components/site/NotifyForm";
import {
  getTabletsCatalog,
  flavorToSlug,
  resolveContent,
} from "@/lib/catalog";
import { getProductContentMap } from "@/db/queries";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tablets",
  description:
    "KR8MX Tablets — lighter format, higher standards. Premarket preview.",
  alternates: { canonical: "/tablets" },
  openGraph: {
    title: "KR8MX Tablets",
    description: "Lighter format. Higher standards. Premarket preview.",
    url: "/tablets",
    images: [{ url: "/brand/og-tablets.png", width: 1200, height: 630 }],
  },
};

export default async function TabletsCollectionPage() {
  const catalog = getTabletsCatalog();
  const content = await getProductContentMap("tablets");
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tablets", path: "/tablets" },
  ]);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {/* cinematic hero */}
      <section className="relative overflow-hidden">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/7]">
          <Image
            src="/brand/hero-home.png"
            alt="KR8MX tablet packs"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-6xl px-6 pb-10">
              <div className="flex items-center gap-3 text-muted">
                <SlashX size={16} accent />
                <span className="type-kicker">The Precision Line</span>
                <Badge variant="outline">Premarket Preview</Badge>
              </div>
              <h1 className="type-display mt-4 max-w-[16ch] text-primary text-4xl sm:text-5xl md:text-6xl">
                Tablets
              </h1>
              <p className="mt-4 max-w-md text-sm text-secondary">
                Lighter format. Higher standards. 21+ adult use only.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HairlineRule />

      {/* flavor cards — full-bleed dark, alternating */}
      <div>
        {catalog.map((item, i) => {
          const flip = i % 2 === 1;
          const c = resolveContent(item.flavor, content.get(item.flavor));
          return (
            <Link
              key={item.flavor}
              href={`/tablets/${flavorToSlug(item.flavor)}`}
              className="group block border-b border-hairline"
            >
              <article
                className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 md:min-h-[420px] md:flex-row md:justify-between md:py-20"
                style={{
                  background: `radial-gradient(120% 120% at ${
                    flip ? "85%" : "15%"
                  } 30%, ${c.hex}1f, transparent 60%)`,
                }}
              >
                <Reveal className={flip ? "md:order-2" : ""}>
                  <ProductVisual
                    imageUrl={c.imageUrl}
                    alt={`KR8MX Tablets — ${c.name}`}
                    accent={c.hex}
                    height={300}
                    idKey={`tab-${item.flavor}`}
                    shape="tablet"
                    className="mx-auto transition-transform duration-slow ease-out-brand group-hover:-translate-y-1.5"
                  />
                </Reveal>

                <Reveal
                  delay={120}
                  className={`flex flex-col gap-5 ${flip ? "md:order-1" : ""}`}
                >
                  <span className="type-kicker" style={{ color: c.hex }}>
                    {c.tagline ?? `${String(i + 1).padStart(2, "0")} / Flavor`}
                  </span>
                  <h2 className="type-display text-primary text-3xl sm:text-4xl md:text-5xl">
                    {c.name}
                  </h2>
                  {c.description ? (
                    <p className="max-w-md text-sm text-secondary">
                      {c.description}
                    </p>
                  ) : null}
                  <p className="text-sm text-secondary">
                    Premarket{" "}
                    <span className="text-muted">· 5 / 10-tablet formats</span>
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
                    Preview
                    <span className="transition-transform duration-base ease-out-brand group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </Reveal>
              </article>
            </Link>
          );
        })}
      </div>

      {/* notify */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-md">
          <span className="type-kicker text-muted">Be first in line</span>
          <p className="mb-4 mt-2 text-sm text-secondary">
            Join the list for launch updates and early access.
          </p>
          <NotifyForm cta="Notify me" />
          <p className="mt-3 text-2xs text-muted">
            Premarket preview — availability and pricing to be announced. 21+
            only.
          </p>
        </div>
      </section>
    </div>
  );
}
