import Link from "next/link";
import { SlashX } from "@/components/brand/SlashX";

/* =============================================================================
   Closing call-to-action band. A brand-purple full-bleed section that gives the
   marketing pages a strong conversion point before the footer. Positioning /
   compliance copy only, no effect claims (see the content guard). No em dashes.
   ============================================================================= */

const PURPLE = "#6C2FB0";

function Chevron() {
  return <span className="font-normal">&rsaquo;</span>;
}

export function CtaBand({
  kicker = "Wholesale & Retail",
  heading = "Built to lead.",
  body = "KR8MX is the new standard for kratom tablets: no added 7-hydroxymitragynine, standardized minor alkaloids led by Speciociliatine, and lab-tested every lot. Now open for premarket preview and wholesale.",
}: {
  kicker?: string;
  heading?: string;
  body?: string;
}) {
  return (
    <section
      data-cta-band
      className="relative overflow-hidden"
      style={{ background: `linear-gradient(120deg, ${PURPLE} 0%, #40196d 100%)` }}
    >
      {/* soft sheen */}
      <div
        aria-hidden
        className="animate-glow pointer-events-none absolute -right-24 -top-32 h-[440px] w-[440px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, #ffffff, transparent 68%)" }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-16 sm:py-20 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 text-white/80">
            <SlashX size={14} />
            <span className="type-kicker">{kicker}</span>
          </div>
          <h2
            className="type-display mt-3 text-white text-3xl sm:text-4xl md:text-5xl"
            style={{ fontWeight: 900 }}
          >
            {heading}
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-white/80 sm:text-base">
            {body}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
          <Link
            href="/tablets"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold transition-transform duration-base ease-out-brand hover:-translate-y-0.5"
            style={{ color: PURPLE }}
          >
            Explore Tablets <Chevron />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-white/70 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-base ease-out-brand hover:bg-white/10"
          >
            Wholesale <Chevron />
          </Link>
        </div>
      </div>
    </section>
  );
}
