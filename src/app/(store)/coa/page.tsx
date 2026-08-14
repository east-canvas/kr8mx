import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { HairlineRule } from "@/components/ui/HairlineRule";

export const metadata: Metadata = {
  title: "Certificates of Analysis",
  description:
    "KR8MX Certificates of Analysis. Every lot of our kratom leaf extract tablets is third-party tested, including 7-hydroxymitragynine (7-OH) under 400 ppm on a dry weight basis.",
  alternates: { canonical: "/coa" },
  openGraph: {
    title: "KR8MX Certificates of Analysis",
    description:
      "Third-party lab results for KR8MX kratom leaf extract tablets, published per lot. 21+.",
    url: "/coa",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
};

const CATEGORIES = [
  {
    href: "/coa/tablets",
    label: "Tablets",
    note: "Tablet line, per-lot certificates.",
  },
];

export default function CoaIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading kicker="Transparency" title="Certificates of Analysis" as="h1" />
      <p className="mt-5 max-w-prose text-sm text-secondary">
        Third-party lab results by product category. Every lot is tested and
        published here.
      </p>

      <HairlineRule className="my-10" />

      <div className="grid gap-5 sm:grid-cols-2">
        {CATEGORIES.map((c) => (
          <Link key={c.href} href={c.href} className="group">
            <Card className="h-full transition-colors duration-base ease-out-brand group-hover:border-secondary">
              <h2 className="type-display text-primary text-2xl">{c.label}</h2>
              <p className="mt-2 text-sm text-secondary">{c.note}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
                View COAs
                <span className="transition-transform duration-base ease-out-brand group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
