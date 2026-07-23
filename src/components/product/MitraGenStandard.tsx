import { SlashX } from "@/components/brand/SlashX";

/* =============================================================================
   The MitraGen+™ Standard, the formulation-technology story shared across the
   product pages. Product/ingredient + manufacturing description only; no
   structure/function or effect claims (see the content guard).
   ============================================================================= */

const COMPOSITION = [
  {
    mg: "100 mg",
    label: "MitraGen+™",
    note: "Proprietary formulation",
  },
  {
    mg: "200 mg",
    label: "Minor alkaloids",
    note: "Standardized, incl. Speciociliatine, Mitragynine",
  },
  {
    mg: "300 mg",
    label: "Total per tablet",
    note: "Scored for ½-tablet servings",
  },
] as const;

const PILLARS = [
  {
    title: "Cutting-edge formulation",
    body: "MitraGen+™ is a proprietary formulation technology centered on isolation, standardization, and bioavailability. Innovation in every batch.",
  },
  {
    title: "Solvent-free isolation",
    body: "Minor alkaloids are isolated without harsh solvents. No DCM, ever. Pure science, not shortcuts.",
  },
  {
    title: "Isolated & standardized",
    body: "Standardized, isolated alkaloids mean a clean, consistent, repeatable profile in every single tablet.",
  },
] as const;

const STANDARDS = [
  "Manufactured in the USA",
  "Extracted in Florida",
  "Florida Compliant",
  "Federally Compliant",
  "Isolated, standardized alkaloids",
  "No 7-hydroxymitragynine",
  "No MGM",
  "No masking agents",
  "No DCM",
  "No synthetics",
] as const;

export function MitraGenStandard({ accent = "#1e2528" }: { accent?: string }) {
  return (
    <section
      aria-label="The MitraGen+ Standard"
      className="relative overflow-hidden rounded-xl border border-hairline p-6 sm:p-10"
      style={{
        background: `radial-gradient(120% 90% at 100% 0%, ${accent}12, transparent 60%)`,
      }}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <SlashX size={14} accent />
          <span className="type-kicker" style={{ color: accent }}>
            The MitraGen+™ Standard
          </span>
        </div>
        <h2 className="type-display text-primary text-2xl sm:text-3xl md:text-4xl">
          Pure science. Elevated.
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-secondary">
          Every KR8MX tablet is built with MitraGen+™, a proprietary formulation
          engineered in the USA with cutting-edge extraction technology.
          Solvent-free isolation separates and standardizes minor alkaloids, so
          every tablet carries a clean, consistent, precisely standardized
          profile. No masking. No synthetics. Pure science.
        </p>
      </div>

      {/* composition */}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {COMPOSITION.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-1 rounded-lg border border-hairline bg-surface/60 p-4"
          >
            <span
              className="type-display text-2xl sm:text-3xl"
              style={{ color: accent }}
            >
              {row.mg}
            </span>
            <span className="text-sm text-primary">{row.label}</span>
            <span className="text-2xs text-muted">{row.note}</span>
          </div>
        ))}
      </div>

      {/* pillars */}
      <div className="mt-6 grid gap-5 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="flex flex-col gap-1.5">
            <span className="text-sm text-primary">{p.title}</span>
            <p className="text-2xs leading-relaxed text-secondary">{p.body}</p>
          </div>
        ))}
      </div>

      {/* standards / free-from */}
      <div className="mt-8 border-t border-hairline pt-6">
        <span className="type-kicker text-muted">Held to a standard</span>
        <ul className="mt-3 flex flex-wrap gap-2">
          {STANDARDS.map((s) => (
            <li
              key={s}
              className="rounded-sm border border-hairline px-3 py-1.5 text-2xs uppercase tracking-wide text-secondary"
            >
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-2xs text-muted">
          21+ adult use only. Made in the USA.
        </p>
      </div>
    </section>
  );
}
