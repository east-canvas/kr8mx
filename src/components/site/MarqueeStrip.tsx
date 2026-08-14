import { SlashX } from "@/components/brand/SlashX";

/* =============================================================================
   Infinite trust ticker. Pure-CSS marquee (no JS): a single track holds two
   identical item groups and slides -50%, so it loops seamlessly. Respects
   prefers-reduced-motion (the .animate-marquee utility freezes it). Content is
   descriptive/compliance-only, no effect claims. Purely decorative, so it is
   hidden from assistive tech.
   ============================================================================= */

const DEFAULT_ITEMS = [
  "Made in the USA",
  "Lab-Tested Every Lot",
  "No Added 7-OH",
  "Solvent-Free Isolation",
  "U.S.-Grown Kratom",
  "Standardized Minor Alkaloids",
  "Florida Compliant",
  "Federally Compliant",
] as const;

function Group({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex shrink-0 items-center">
      {items.map((s, i) => (
        <li
          key={i}
          className="type-kicker flex items-center whitespace-nowrap text-muted"
        >
          <span>{s}</span>
          <SlashX size={11} accent className="mx-7 opacity-70 sm:mx-9" />
        </li>
      ))}
    </ul>
  );
}

export function MarqueeStrip({
  items = DEFAULT_ITEMS,
}: {
  items?: readonly string[];
}) {
  return (
    <div
      aria-hidden
      className="group relative flex overflow-hidden border-y border-hairline bg-surface/50 py-4"
    >
      {/* edge fades so items enter and exit softly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent sm:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent sm:w-24" />
      <div className="animate-marquee flex will-change-transform group-hover:[animation-play-state:paused]">
        <Group items={items} />
        <Group items={items} />
      </div>
    </div>
  );
}
