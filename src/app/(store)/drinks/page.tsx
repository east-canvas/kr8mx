import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SlashX } from "@/components/brand/SlashX";
import { ProductVisual } from "@/components/brand/ProductVisual";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Reveal } from "@/components/ui/Reveal";
import {
  getDrinksCatalog,
  flavorToSlug,
  resolveContent,
  applyPriceOverrides,
  defaultDrinkImage,
} from "@/lib/catalog";
import { getProductContentMap, getVariantPriceMap } from "@/db/queries";
import { formatCents } from "@/db/money";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Drinks",
  description:
    "The KR8MX Energy Drink line — five flavors, one standard. Sharp, controlled, elevated.",
  alternates: { canonical: "/drinks" },
  openGraph: {
    title: "KR8MX Energy Drink",
    description: "Five flavors. One standard.",
    url: "/drinks",
    images: [{ url: "/brand/og-drinks.png", width: 1200, height: 630 }],
  },
};

export default async function DrinksCollectionPage() {
  const catalog = getDrinksCatalog();
  const [content, priceMap] = await Promise.all([
    getProductContentMap("drinks"),
    getVariantPriceMap(),
  ]);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Drinks", path: "/drinks" },
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
            src="/brand/drinks-hero.png"
            alt="KR8MX Energy Drink can"
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
                <span className="type-kicker">The Performance Line</span>
              </div>
              <h1 className="type-display mt-4 max-w-[16ch] text-primary text-4xl sm:text-5xl md:text-6xl">
                Energy Drink
              </h1>
              <p className="mt-4 max-w-md text-sm text-secondary">
                Five flavors. One standard. No noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HairlineRule />

      {/* flavor cards — full-bleed dark, alternating */}
      <div>
        {catalog.map((item, i) => {
          const variants = applyPriceOverrides(item.variants, priceMap);
          const startPrice = variants[0]?.priceCents ?? 0;
          const flip = i % 2 === 1;
          const c = resolveContent(item.flavor, content.get(item.flavor));
          return (
            <Link
              key={item.flavor}
              href={`/drinks/${flavorToSlug(item.flavor)}`}
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
                    imageUrl={c.imageUrl ?? defaultDrinkImage(item.flavor)}
                    alt={`KR8MX Energy Drink — ${c.name}`}
                    accent={c.hex}
                    height={340}
                    idKey={item.flavor}
                    className="mx-auto transition-transform duration-slow ease-out-brand group-hover:-translate-y-1.5"
                  />
                </Reveal>

                <Reveal
                  delay={120}
                  className={`flex flex-col gap-5 ${flip ? "md:order-1" : ""}`}
                >
                  <span
                    className="type-kicker"
                    style={{ color: c.hex }}
                  >
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
                    From {formatCents(startPrice)}{" "}
                    <span className="text-muted">· 6 / 12 / 24 pack</span>
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
                    View
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
    </div>
  );
}
