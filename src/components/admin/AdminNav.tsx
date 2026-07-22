"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

function Icon(props: SVGProps<SVGSVGElement> & { d: string }) {
  const { d, ...rest } = props;
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

const NAV = [
  { href: "/admin", label: "Catalog", d: "M4 5h7v7H4zM13 5h7v4h-7zM13 12h7v7h-7zM4 15h7v4H4z" },
  { href: "/admin/products", label: "Products", d: "M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v9M8 5.5l8 4.5" },
  { href: "/admin/coa", label: "COAs", d: "M7 3h7l4 4v14H7zM14 3v4h4M9 13h6M9 17h6" },
  { href: "/admin/orders", label: "Orders", d: "M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10" },
  { href: "/admin/notify", label: "Notify", d: "M6 8a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6M10 21h4" },
  { href: "/admin/restrictions", label: "Restrictions", d: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM9 12l2 2 4-4" },
  { href: "/admin/inventory", label: "Inventory", d: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ orientation }: { orientation: "sidebar" | "mobile" }) {
  const pathname = usePathname();

  if (orientation === "mobile") {
    return (
      <nav
        aria-label="Admin sections"
        className="flex gap-1.5 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV.map((n) => {
          const active = isActive(pathname, n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-2xs uppercase tracking-wide transition-colors",
                active
                  ? "border-primary bg-primary text-bg"
                  : "border-hairline text-secondary",
              )}
            >
              <Icon d={n.d} width={14} height={14} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav aria-label="Admin sections" className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-surface-raised font-medium text-primary"
                : "text-secondary hover:bg-surface-raised hover:text-primary",
            )}
          >
            <Icon d={n.d} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
