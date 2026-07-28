import { Wordmark } from "@/components/brand/Wordmark";
import { CartButton } from "@/components/site/CartButton";
import { DesktopNav, type NavLink } from "@/components/site/DesktopNav";
import { MobileMenu } from "@/components/site/MobileMenu";

const NAV: NavLink[] = [
  { href: "/tablets", label: "Products" },
  { href: "/about", label: "Formula" },
  { href: "/contact", label: "Contact" },
];

/**
 * Site header, minimal, precision theme. Wordmark, primary nav, cart. On desktop
 * the nav shows an animated active-page underline; on mobile it collapses into a
 * slide-out drawer. Server component; only the nav, cart, and drawer hydrate.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-bg/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-6">
        <Wordmark height={20} priority sizeClassName="h-[22px] w-auto md:h-5" />

        <DesktopNav items={NAV} />

        <div className="flex items-center gap-3">
          <CartButton />
          <MobileMenu items={NAV} />
        </div>
      </div>
    </header>
  );
}
