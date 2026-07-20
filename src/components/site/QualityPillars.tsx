import {
  IngredientsIcon,
  ShieldIcon,
  PrecisionIcon,
  MovementIcon,
} from "@/components/icons/Icons";

const PILLARS = [
  { label: "Premium Ingredients", Icon: IngredientsIcon },
  { label: "Quality Assured", Icon: ShieldIcon },
  { label: "Precision Formulated", Icon: PrecisionIcon },
  { label: "Made for Movement", Icon: MovementIcon },
];

/** Quality-pillars band — icon + label only. No claims. */
export function QualityPillars() {
  return (
    <section aria-label="Quality standards" className="border-y border-hairline">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-hairline md:grid-cols-4">
        {PILLARS.map(({ label, Icon }) => (
          <li
            key={label}
            className="flex flex-col items-center gap-3 bg-bg px-6 py-10 text-center"
          >
            <Icon width={26} height={26} className="text-primary" />
            <span className="type-kicker text-secondary">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
