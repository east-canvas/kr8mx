import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { allRestrictedStates } from "@/lib/compliance/shipping-restrictions";

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/shipping", label: "Shipping" },
  { href: "/legal/refunds", label: "Refunds" },
  { href: "/legal/lab-results", label: "Lab Results" },
];

const FDA_DISCLAIMER =
  "This product has not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.";

const OPERATOR_LINE =
  "Operated under Gel Trading Group LLC, LIC# 2027-R-2248133";

/**
 * Persistent compliance footer. Carries the FDA disclaimer, the 21+ notice, a
 * state-availability line generated from the shipping restrictions, the legal
 * nav, and the operator line. Rendered on every page via the root layout.
 */
export function Footer() {
  const restricted = allRestrictedStates();
  const availability =
    restricted.length > 0
      ? `Not available for shipment to: ${restricted.join(", ")}.`
      : "Available for shipment in all serviced states.";

  return (
    <footer className="mt-24 border-t border-hairline bg-surface-raised">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <Wordmark height={22} />
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs uppercase tracking-wide text-secondary transition-colors duration-base ease-out-brand hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <HairlineRule className="my-10" />

        <div className="flex flex-col gap-4 text-2xs leading-relaxed text-muted">
          <p className="font-medium uppercase tracking-wide text-secondary">
            Not for sale to persons under the age of 21.
          </p>
          <p className="max-w-3xl">{FDA_DISCLAIMER}</p>
          <p>{availability}</p>
          <p>
            Contains 0 PPM 7-hydroxymitragynine on a dry weight basis. 21+ adult
            use only.
          </p>
          <p className="pt-2 text-muted">
            {OPERATOR_LINE}
          </p>
          <p className="text-muted">
            © {new Date().getFullYear()} KR8MX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
