"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartProvider";
import { CartIcon } from "@/components/icons/Icons";

/** Header cart control, icon + live item count from the client cart. */
export function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative inline-flex items-center justify-center rounded-sm p-1.5 text-primary transition-colors duration-base ease-out-brand hover:text-secondary"
    >
      <CartIcon width={20} height={20} />
      {count > 0 ? (
        <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-accent-contrast">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
