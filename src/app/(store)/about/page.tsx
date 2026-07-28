import type { Metadata } from "next";
import Link from "next/link";
import { SlashX } from "@/components/brand/SlashX";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Button } from "@/components/ui/Button";
import { MitraGenStandard } from "@/components/product/MitraGenStandard";
import { aboutPageJsonLd, breadcrumbJsonLd, SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description:
    "KR8MX is a premium 21+ kratom-derived brand. KR8MX Tablets are built with MitraGen+™, a proprietary formula by Mitragen Labs, in bottle and blister-pack formats across five flavors.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About KR8MX",
    description: SITE.description,
    url: "/about",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="flex items-center gap-2.5 text-muted">
        <SlashX size={16} accent />
        <span className="type-kicker">About KR8MX</span>
      </div>
      <h1 className="type-display mt-5 max-w-[16ch] text-primary text-4xl sm:text-5xl">
        The KR8MX standard.
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
        KR8MX is a premium, 21+ kratom-derived brand built on a single higher
        standard. Every KR8MX Tablet is built with MitraGen+™, a proprietary
        formulation, for a clean, consistent, precisely standardized profile.
        Pure science. Elevated.
      </p>

      <HairlineRule className="my-10" />

      {/* the formula + the standard */}
      <MitraGenStandard accent="#6C2FB0" />

      {/* the line */}
      <section className="mt-12 flex flex-col gap-3">
        <span className="type-kicker text-muted">The line</span>
        <h2 className="type-display text-primary text-2xl sm:text-3xl">
          KR8MX Tablets
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-secondary">
          KR8MX Tablets come in bottle and blister-pack formats, with 100 mg
          MitraGen+™ per tablet, across five flavors: Grape, Lemon, Peach,
          Strawberry, and Blue Razz. Each lot is third-party tested to 0 PPM
          7-hydroxymitragynine on a dry weight basis.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button href="/tablets" variant="solid" size="md">
            Explore Tablets
          </Button>
          <Button href="/coa" variant="outline" size="md">
            Lab Results
          </Button>
        </div>
      </section>

      {/* company */}
      <section className="mt-12 flex flex-col gap-3">
        <span className="type-kicker text-muted">The company</span>
        <p className="max-w-2xl text-sm leading-relaxed text-secondary">
          KR8MX is operated under {SITE.legalName}. Products are manufactured in
          the USA and extracted in Florida. MitraGen+™ is a proprietary formula
          of Mitragen Labs. 21+ adult use only.
        </p>
      </section>
    </div>
  );
}
