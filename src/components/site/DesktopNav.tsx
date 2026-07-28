"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavLink = {
  label: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
};

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop primary nav with an animated active-page underline. */
export function DesktopNav({ items }: { items: NavLink[] }) {
  const pathname = usePathname();
  const base =
    "relative text-xs uppercase tracking-wide transition-colors duration-base ease-out-brand";

  return (
    <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
      {items.map((item) => {
        if (item.disabled || !item.href) {
          return (
            <span key={item.label} className={cn(base, "cursor-default text-muted")}>
              {item.label}
            </span>
          );
        }
        if (item.external) {
          return (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(base, "text-secondary hover:text-primary")}
            >
              {item.label}
            </a>
          );
        }
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              base,
              "group",
              active ? "text-primary" : "text-secondary hover:text-primary",
            )}
          >
            {item.label}
            <span
              className={cn(
                "absolute -bottom-1.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-base ease-out-brand",
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
