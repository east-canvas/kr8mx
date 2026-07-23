import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductVisual } from "@/components/brand/ProductVisual";
import { SlashX } from "@/components/brand/SlashX";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { DrinkPurchase } from "@/components/drinks/DrinkPurchase";
import { ChevronDownIcon, ExternalIcon } from "@/components/icons/Icons";
import {
  DRINK_FLAVORS,
  FLAVOR_META,
  getDrinkVariants,
  flavorToSlug,
  slugToFlavor,
  resolveContent,
  applyPriceOverrides,
  defaultDrinkImage,
} from "@/lib/catalog";
import { getProductContentMap, getVariantPriceMap } from "@/db/queries";
import { restrictedStatesFor } from "@/lib/compliance/shipping-restrictions";
import { buildDrinkProductGroupJsonLd } from "@/lib/jsonld";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return DRINK_FLAVORS.map((f) => ({ flavor: flavorToSlug(f) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ flavor: string }>;
}): Promise<Metadata> {
  const { flavor: slug } = await params;
  const flavor = slugToFlavor(slug);
  if (!flavor) return { title: "Drinks" };
  const meta = FLAVOR_META[flavor];
  const path = `/drinks/${flavorToSlug(flavor)}`;
  return {
    title: `${meta.name} Energy Drink`,
    description: `KR8MX ${meta.name} Energy Drink. 6, 12, or 24 pack.`,
    alternates: { canonical: path },
    openGraph: {
      title: `KR8MX ${meta.name} Energy Drink`,
      description: "6, 12, or 24 pack.",
      url: path,
      images: [{ url: "/brand/og-drinks.png", width: 1200, height: 630 }],
    },
  };
}

function AccordionRow({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-hairline py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm text-primary [&::-webkit-details-marker]:hidden">
        <span className="uppercase tracking-wide">{title}</span>
        <ChevronDownIcon
          width={18}
          height={18}
          className="text-muted transition-transform duration-base ease-out-brand group-open:rotate-180"
        />
      </summary>
      <div className="pb-5 text-sm leading-relaxed text-secondary">{children}</div>
    </details>
  );
}

export default async function DrinkPdpPage({
  params,
}: {
  params: Promise<{ flavor: string }>;
}) {
  const { flavor: slug } = await params;
  const flavor = slugToFlavor(slug);
  if (!flavor) notFound();

  const [contentMap, priceMap] = await Promise.all([
    getProductContentMap("drinks"),
    getVariantPriceMap(),
  ]);
  const c = resolveContent("drinks", flavor, contentMap.get(flavor));
  const variants = applyPriceOverrides(getDrinkVariants(flavor), priceMap);
  const restricted = restrictedStatesFor("drinks");
  const jsonLd = buildDrinkProductGroupJsonLd(flavor, priceMap);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Drinks", path: "/drinks" },
    { name: c.name, path: `/drinks/${flavorToSlug(flavor)}` },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* breadcrumb + flavor selector */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/drinks"
          className="text-2xs uppercase tracking-wide text-muted transition-colors hover:text-primary"
        >
          &larr; Drinks
        </Link>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Flavors">
          {DRINK_FLAVORS.map((f) => {
            const active = f === flavor;
            return (
              <Link
                key={f}
                href={`/drinks/${flavorToSlug(f)}`}
                role="tab"
                aria-selected={active}
                className={cn(
                  "rounded-sm border px-3 py-1.5 text-2xs uppercase tracking-wide transition-colors duration-base ease-out-brand",
                  active
                    ? "border-accent text-primary"
                    : "border-hairline text-muted hover:text-primary",
                )}
              >
                {FLAVOR_META[f].name}
              </Link>
            );
          })}
        </div>
      </div>

      <HairlineRule className="my-8" />

      <div className="grid gap-12 lg:grid-cols-2">
        {/* visual */}
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-xl border border-hairline py-16"
          style={{
            background: `radial-gradient(90% 90% at 50% 25%, ${c.hex}26, transparent 65%)`,
          }}
        >
          <ProductVisual
            imageUrl={c.imageUrl ?? defaultDrinkImage(flavor)}
            alt={`KR8MX Energy Drink, ${c.name}`}
            accent={c.hex}
            height={460}
            idKey={`pdp-${flavor}`}
            priority
          />
        </div>

        {/* buy box */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <SlashX size={14} accent />
              <span className="type-kicker" style={{ color: c.hex }}>
                {c.tagline ?? "Energy Drink"}
              </span>
            </div>
            <h1 className="type-display text-primary text-3xl sm:text-4xl md:text-5xl">
              {c.name}
            </h1>
            <p className="max-w-prose text-sm text-secondary">
              {c.description ??
                "Sharp. Controlled. Elevated. 12 FL OZ (355 ml) per can, built with MitraGen+™."}
            </p>
          </div>

          <DrinkPurchase
            flavor={flavor}
            flavorName={c.name}
            variants={variants}
          />

          {/* details accordion */}
          <div className="mt-2">
            <AccordionRow title="Ingredients" defaultOpen>
              <p>
                Ingredient panel to be published. Built with the MitraGen+&trade;
                formulation.{" "}
                <span className="text-muted">Full panel to follow.</span>
              </p>
            </AccordionRow>

            <AccordionRow title="Lab Results">
              <Link
                href="/coa/drinks"
                className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
              >
                View Certificates of Analysis
                <ExternalIcon width={15} height={15} className="text-muted" />
              </Link>
              <p className="mt-2 text-muted">
                Each lot is tested to 0 PPM 7-hydroxymitragynine (dry weight
                basis).
              </p>
            </AccordionRow>

            <AccordionRow title="Shipping &amp; Availability">
              <p>21+ adult use only. An adult must receive the delivery.</p>
              <p className="mt-2">
                Not available for shipment to:{" "}
                <span className="text-primary">{restricted.join(", ")}</span>.
              </p>
            </AccordionRow>
          </div>
        </div>
      </div>
    </div>
  );
}
