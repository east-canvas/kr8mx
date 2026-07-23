import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { QualityPillars } from "@/components/site/QualityPillars";

export const metadata: Metadata = {
  title: "The Standard",
  description:
    "The KR8MX standard, one standard across every format. Premium materials, precision manufacturing, verified lots.",
};

const POINTS = [
  {
    title: "Premium Materials",
    body: "Sourced to a single specification and held to it, lot after lot.",
  },
  {
    title: "Precision Manufacturing",
    body: "Formulated and packed to tight tolerances, verified at every step.",
  },
  {
    title: "Verified Lots",
    body: "Every lot is third-party tested; certificates are published openly.",
  },
];

export default function StandardPage() {
  return (
    <div>
      <div className="mx-auto max-w-4xl px-6 py-16">
        <SectionHeading kicker="The Standard" title="One standard. Every format." as="h1" />
        <p className="mt-5 max-w-prose text-sm text-secondary">
          Two lines, one bar. Whatever the format, the standard does not move.
        </p>

        <HairlineRule className="my-12" />

        <dl className="grid gap-10 sm:grid-cols-3">
          {POINTS.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <dt className="type-display text-primary text-lg">{p.title}</dt>
              <dd className="text-sm text-secondary">{p.body}</dd>
            </div>
          ))}
        </dl>
      </div>

      <QualityPillars />
    </div>
  );
}
