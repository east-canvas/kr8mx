import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { CartButton } from "@/components/site/CartButton";

const NAV = [
  // Drinks (Energy Drink line) hidden until market-ready — restore when launching.
  { href: "/tablets", label: "Tablets" },
  { href: "/standard", label: "The Standard" },
  { href: "/access", label: "Access" },
];

/**
 * Site header — minimal, precision theme. Wordmark, primary nav, cart. Generous
 * spacing and a single hairline divider beneath. Server component; only the cart
 * count hydrates.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <Wordmark height={20} priority sizeClassName="h-[22px] w-auto md:h-5" />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-9 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-wide text-secondary transition-colors duration-base ease-out-brand hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />
        </div>
      </div>

      {/* Mobile nav — compact row */}
      <nav
        aria-label="Primary mobile"
        className="flex items-center justify-center gap-7 border-t border-hairline px-6 py-2.5 md:hidden"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-2xs uppercase tracking-wide text-secondary transition-colors duration-base ease-out-brand hover:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
