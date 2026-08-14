import type { Metadata } from "next";
import Link from "next/link";
import { SlashX } from "@/components/brand/SlashX";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Button } from "@/components/ui/Button";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Kratom Alkaloid Science: Speciociliatine, MitraGen+ & 7-OH",
  description:
    "The science behind KR8MX kratom leaf extract tablets: Speciociliatine (150 mg per tablet), Mitragynine (50 mg), MitraGen+™, and 7-hydroxymitragynine (7-OH). 300 mg total kratom alkaloids per tablet, no added 7-OH, from Mitragyna speciosa leaf.",
  alternates: { canonical: "/science" },
  openGraph: {
    title: "Kratom Alkaloid Science | KR8MX",
    description:
      "Speciociliatine, Mitragynine, MitraGen+™, and 7-OH explained. Speciociliatine-forward kratom leaf extract tablets. 21+.",
    url: "/science",
    images: [{ url: "/brand/og-default.png", width: 1200, height: 630 }],
  },
};

/* Definitional, botanical/chemical facts only. No effect, health, or comparative
   claims (see the content guard and Label Compliance Spec Rev 1.1 §7). */

const COMPOSITION = [
  { name: "MitraGen+™ kratom leaf extract", value: "100 mg" },
  { name: "Speciociliatine", value: "150 mg" },
  { name: "Mitragynine", value: "50 mg" },
  { name: "Total kratom alkaloids", value: "300 mg" },
];

const FAQ = [
  {
    q: "What is Speciociliatine?",
    a: "Speciociliatine is a naturally occurring minor alkaloid found in Mitragyna speciosa (kratom) leaf, a stereoisomer of mitragynine. KR8MX tablets are standardized to 150 mg of Speciociliatine per tablet, the largest single alkaloid in the formula.",
  },
  {
    q: "What is Mitragynine?",
    a: "Mitragynine is the most abundant alkaloid in most kratom leaf. In KR8MX tablets it is standardized to 50 mg per tablet, alongside 150 mg of Speciociliatine.",
  },
  {
    q: "What is MitraGen+™?",
    a: "MitraGen+™ is the proprietary, solvent-free formulation technology behind KR8MX. It isolates and standardizes the kratom leaf's minor alkaloids so every tablet carries the same profile. Each tablet contains 100 mg of MitraGen+™.",
  },
  {
    q: "What is 7-hydroxymitragynine (7-OH)?",
    a: "7-hydroxymitragynine (7-OH) is a minor alkaloid that occurs naturally in Mitragyna speciosa leaf at trace levels. KR8MX adds none. Every lot is third-party tested to confirm under 400 ppm 7-OH on a dry weight basis.",
  },
  {
    q: "What is Mitragyna speciosa?",
    a: "Mitragyna speciosa, commonly called kratom, is a tree in the coffee family native to Southeast Asia. Its leaf contains a family of alkaloids, including mitragynine and speciociliatine.",
  },
  {
    q: "How many kratom alkaloids are in each KR8MX tablet?",
    a: "300 mg of total kratom alkaloids per tablet: 100 mg MitraGen+™, 150 mg Speciociliatine, and 50 mg Mitragynine. Scored for one-half-tablet servings.",
  },
];

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default function SciencePage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Science", path: "/science" },
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />

      <div className="flex items-center gap-2.5 text-muted">
        <SlashX size={16} accent />
        <span className="type-kicker">The Science</span>
      </div>
      <h1 className="type-display mt-5 max-w-[20ch] text-primary text-3xl sm:text-4xl">
        Kratom alkaloid science
      </h1>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-secondary sm:text-base">
        KR8MX makes kratom leaf extract tablets from Mitragyna speciosa,
        standardized with MitraGen+™ and led by Speciociliatine. Here is what is
        in every tablet and what each term means. 21+ adult use only.
      </p>

      <HairlineRule className="my-10" />

      {/* composition */}
      <section aria-label="Composition per tablet">
        <span className="type-kicker text-muted">Per tablet</span>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {COMPOSITION.map((row) => (
            <div
              key={row.name}
              className="flex items-baseline justify-between gap-3 rounded-lg border border-hairline bg-surface p-4"
            >
              <span className="text-sm text-primary">{row.name}</span>
              <span className="type-display text-lg" style={{ color: "#6C2FB0" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-2xs text-muted">
          300 mg total kratom alkaloids per tablet. No added 7-OH. Every lot is
          third-party tested to under 400 ppm 7-hydroxymitragynine on a dry
          weight basis.
        </p>
      </section>

      <HairlineRule className="my-10" />

      {/* definitions / FAQ */}
      <section aria-label="Definitions">
        <h2 className="type-display text-primary text-2xl">
          Terms, defined
        </h2>
        <div className="mt-6 flex flex-col divide-y divide-hairline border-y border-hairline">
          {FAQ.map((f) => (
            <div key={f.q} className="flex flex-col gap-2 py-6">
              <h3 className="text-base font-semibold text-primary">{f.q}</h3>
              <p className="text-sm leading-relaxed text-secondary">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/tablets" variant="solid" size="md">
          Explore Tablets
        </Button>
        <Button href="/coa" variant="outline" size="md">
          Lab Results
        </Button>
      </div>
    </div>
  );
}
