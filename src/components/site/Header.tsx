import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { CartButton } from "@/components/site/CartButton";

type NavLink = {
  label: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
};

const NAV: NavLink[] = [
  { href: "/tablets", label: "Products" },
  { href: "/about", label: "Formula" },
  {
    href: "https://www.naturesbridgegroup.com/wholesale",
    label: "Wholesale",
    external: true,
  },
  // Contact destination undecided; shown but not linked for now.
  { label: "Contact", disabled: true },
];

/** Renders a nav item: external anchor (new tab), internal Link, or an inert
 *  span for items whose destination isn't set yet. */
function NavItem({
  item,
  className,
}: {
  item: NavLink;
  className: string;
}) {
  if (item.disabled || !item.href) {
    return <span className={`${className} cursor-default`}>{item.label}</span>;
  }
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

/**
 * Site header, minimal, precision theme. Wordmark, primary nav, cart. Generous
 * spacing and a single hairline divider beneath. Server component; only the cart
 * count hydrates.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <Wordmark height={20} priority sizeClassName="h-[22px] w-auto md:h-5" />

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              className="text-xs uppercase tracking-wide text-secondary transition-colors duration-base ease-out-brand hover:text-primary"
            />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartButton />
        </div>
      </div>

      {/* Mobile nav, compact row */}
      <nav
        aria-label="Primary mobile"
        className="flex items-center justify-center gap-7 border-t border-hairline px-6 py-2.5 md:hidden"
      >
        {NAV.map((item) => (
          <NavItem
            key={item.label}
            item={item}
            className="text-2xs uppercase tracking-wide text-secondary transition-colors duration-base ease-out-brand hover:text-primary"
          />
        ))}
      </nav>
    </header>
  );
}
