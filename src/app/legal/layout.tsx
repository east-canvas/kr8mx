import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { HairlineRule } from "@/components/ui/HairlineRule";

const LEGAL_NAV = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/shipping", label: "Shipping" },
  { href: "/legal/refunds", label: "Refunds" },
  { href: "/legal/lab-results", label: "Lab Results" },
];

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Wordmark height={24} />
      <HairlineRule className="my-8" />
      <nav
        aria-label="Legal documents"
        className="mb-12 flex flex-wrap gap-x-6 gap-y-2"
      >
        {LEGAL_NAV.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-xs uppercase tracking-wide text-secondary transition-colors duration-base ease-out-brand hover:text-primary"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
