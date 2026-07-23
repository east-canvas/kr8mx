import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductVisual } from "@/components/brand/ProductVisual";
import { SlashX } from "@/components/brand/SlashX";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Badge } from "@/components/ui/Badge";
import { NotifyForm } from "@/components/site/NotifyForm";
import { MitraGenStandard } from "@/components/product/MitraGenStandard";
import { ChevronDownIcon, ExternalIcon } from "@/components/icons/Icons";
import {
  TABLET_FLAVORS,
  FLAVOR_META,
  getTabletVariants,
  tabletPackLabel,
  flavorToSlug,
  slugToFlavor,
  resolveContent,
  defaultTabletImage,
} from "@/lib/catalog";
import { getProductContentMap } from "@/db/queries";
import { restrictedStatesFor } from "@/lib/compliance/shipping-restrictions";
import { breadcrumbJsonLd } from "@/lib/seo";
import { cn } from "@/lib/cn";

export function generateStaticParams() {
  return TABLET_FLAVORS.map((f) => ({ flavor: flavorToSlug(f) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ flavor: string }>;
}): Promise<Metadata> {
  const { flavor: slug } = await params;
  const flavor = slugToFlavor(slug);
  if (!flavor) return { title: "Tablets" };
  const meta = FLAVOR_META[flavor];
  const path = `/tablets/${flavorToSlug(flavor)}`;
  return {
    title: `${meta.name} — Tablets`,
    description: `KR8MX Tablets — ${meta.name}. Premarket preview.`,
    alternates: { canonical: path },
    openGraph: {
      title: `KR8MX Tablets — ${meta.name}`,
      description: "Lighter format. Higher standards. Premarket preview.",
      url: path,
      images: [{ url: "/brand/og-tablets.png", width: 1200, height: 630 }],
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

export default async function TabletPdpPage({
  params,
}: {
  params: Promise<{ flavor: string }>;
}) {
  const { flavor: slug } = await params;
  const flavor = slugToFlavor(slug);
  if (!flavor) notFound();

  const contentMap = await getProductContentMap("tablets");
  const c = resolveContent("tablets", flavor, contentMap.get(flavor));
  // Only the 10-tablet bottle ("tube") ships for now — hide the blister format.
  const variants = getTabletVariants(flavor).filter((v) => v.form === "container");
  const restricted = restrictedStatesFor("tablets");
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tablets", path: "/tablets" },
    { name: c.name, path: `/tablets/${flavorToSlug(flavor)}` },
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* breadcrumb + flavor selector */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          href="/tablets"
          className="text-2xs uppercase tracking-wide text-muted transition-colors hover:text-primary"
        >
          &larr; Tablets
        </Link>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Flavors">
          {TABLET_FLAVORS.map((f) => {
            const active = f === flavor;
            return (
              <Link
                key={f}
                href={`/tablets/${flavorToSlug(f)}`}
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
            imageUrl={c.imageUrl ?? defaultTabletImage(flavor)}
            alt={`KR8MX Tablets — ${c.name}`}
            accent={c.hex}
            height={420}
            idKey={`tab-pdp-${flavor}`}
            shape="tablet"
            priority
          />
        </div>

        {/* info + notify */}
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <SlashX size={14} accent />
              <span className="type-kicker" style={{ color: c.hex }}>
                {c.tagline ?? "Tablets"}
              </span>
              <Badge variant="outline">Premarket</Badge>
            </div>
            <h1 className="type-display text-primary text-3xl sm:text-4xl md:text-5xl">
              {c.name}
            </h1>
            <p className="max-w-prose text-sm text-secondary">
              {c.description ??
                "Lighter format. Higher standards. Built with MitraGen+™. 21+ adult use only."}
            </p>
          </div>

          {/* format */}
          <div className="flex flex-col gap-3">
            <span className="type-kicker text-muted">Format</span>
            <ul className="flex flex-col gap-2.5">
              {variants.map((v) => (
                <li
                  key={v.sku}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline p-4"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm text-primary">
                      {tabletPackLabel(v)}
                    </span>
                    <span className="text-2xs text-muted">
                      100 mg MitraGen+™ per tablet · 300 mg total
                    </span>
                  </div>
                  <Badge variant="outline">Coming soon</Badge>
                </li>
              ))}
            </ul>
          </div>

          {/* notify */}
          <div className="flex flex-col gap-3 rounded-lg border border-hairline p-5">
            <span className="type-kicker text-muted">Be first in line</span>
            <p className="text-sm text-secondary">
              Join the list for {c.name} launch updates and early access.
            </p>
            <NotifyForm cta="Notify me" />
          </div>

          {/* details accordion */}
          <div className="mt-2">
            <AccordionRow title="Composition" defaultOpen>
              <p>
                300 mg per tablet — 100 mg MitraGen+&trade; proprietary
                signature plus 200 mg standardized minor alkaloids, including
                Speciociliatine and Mitragynine. Solvent-free isolation, no
                synthetics.
              </p>
              <p className="mt-2 text-muted">
                Scored for ½-tablet servings. Full ingredient panel published on
                pack.
              </p>
            </AccordionRow>

            <AccordionRow title="Lab Results">
              <Link
                href="/coa/tablets"
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

      {/* The MitraGen+ Standard — extensive formulation story */}
      <div className="mt-14">
        <MitraGenStandard accent={c.hex} />
      </div>
    </div>
  );
}
