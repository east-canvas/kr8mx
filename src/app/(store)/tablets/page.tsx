import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { NotifyForm } from "@/components/site/NotifyForm";
import { FLAVOR_META, DRINK_FLAVORS } from "@/lib/catalog";

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

export default function TabletsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center gap-3">
        <Badge variant="outline">Premarket Preview</Badge>
      </div>
      <SectionHeading
        kicker="The Precision Line"
        title="Tablets"
        as="h1"
        className="mt-6"
      />
      <p className="mt-5 max-w-prose text-sm text-secondary">
        Lighter format. Higher standards. Built with MitraGen+&trade;. Five
        flavor-coded options, 21+ adult use only.
      </p>

      <HairlineRule className="my-10" />

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {DRINK_FLAVORS.map((f) => {
          const meta = FLAVOR_META[f];
          return (
            <li
              key={f}
              className="flex flex-col items-center gap-3 rounded-md border border-hairline p-5 text-center"
            >
              <span
                className="h-8 w-8 rounded-full"
                style={{ background: `${meta.hex}` }}
                aria-hidden
              />
              <span className="text-xs text-primary">{meta.name}</span>
            </li>
          );
        })}
      </ul>

      <HairlineRule className="my-10" />

      <div className="max-w-md">
        <span className="type-kicker text-muted">Be first in line</span>
        <p className="mb-4 mt-2 text-sm text-secondary">
          Join the list for launch updates and early access.
        </p>
        <NotifyForm cta="Notify me" />
        <p className="mt-3 text-2xs text-muted">
          Premarket preview — availability and pricing to be announced. 21+ only.
        </p>
      </div>
    </div>
  );
}
