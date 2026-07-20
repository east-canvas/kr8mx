import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Badge } from "@/components/ui/Badge";
import { ExternalIcon } from "@/components/icons/Icons";
import { getPublishedCoas } from "@/db/queries";
import type { ProductCategory } from "@/db/schema";

const CATEGORIES: ProductCategory[] = ["drinks", "tablets"];

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${label} — Certificates of Analysis`,
    description: `KR8MX ${label} lab results, issued under Nature's Bridge Group Inc.`,
  };
}

function fmtDate(d: Date | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function CoaCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (!CATEGORIES.includes(category as ProductCategory)) notFound();
  const cat = category as ProductCategory;
  const label = cat.charAt(0).toUpperCase() + cat.slice(1);

  const coas = await getPublishedCoas(cat);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center gap-4 text-2xs uppercase tracking-wide text-muted">
        <Link href="/coa" className="transition-colors hover:text-primary">
          Certificates of Analysis
        </Link>
        <span>/</span>
        <span className="text-secondary">{label}</span>
      </div>

      <SectionHeading
        kicker="Nature's Bridge Group Inc"
        title={`${label} Lab Results`}
        as="h1"
        className="mt-6"
      />

      <HairlineRule className="my-10" />

      {coas.length === 0 ? (
        <div className="rounded-md border border-dashed border-hairline px-6 py-16 text-center">
          <p className="text-sm text-secondary">
            No published certificates yet for this category.
          </p>
          <p className="mt-2 text-2xs text-muted">
            Documents are managed in the admin and appear here once published.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
          {coas.map((coa) => (
            <li
              key={coa.id}
              className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-primary">{coa.title}</span>
                  {coa.lotNumber ? (
                    <Badge variant="outline">Lot {coa.lotNumber}</Badge>
                  ) : null}
                </div>
                {coa.resultLine ? (
                  <span className="text-2xs text-muted">{coa.resultLine}</span>
                ) : null}
                <span className="text-2xs text-muted">
                  Issued {fmtDate(coa.issuedDate)} · {coa.issuedBy}
                </span>
              </div>
              <a
                href={coa.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 self-start rounded-sm border border-hairline px-4 py-2 text-xs uppercase tracking-wide text-primary transition-colors duration-base ease-out-brand hover:border-secondary sm:self-auto"
              >
                View PDF
                <ExternalIcon width={15} height={15} className="text-muted" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
