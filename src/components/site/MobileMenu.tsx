"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SlashX } from "@/components/brand/SlashX";
import { cn } from "@/lib/cn";
import type { NavLink } from "./DesktopNav";

function isActive(pathname: string, href?: string) {
  if (!href) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Mobile slide-out drawer. A morphing hamburger toggles a right-side panel with
 * staggered link entrances and a dimmed, blurred backdrop. Closes on route
 * change, Escape, or backdrop tap, and locks body scroll while open.
 */
export function MobileMenu({ items }: { items: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-9 w-9 items-center justify-center text-primary"
      >
        <span className="relative block h-4 w-6">
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-6 bg-current transition-all duration-base ease-out-brand",
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-1/2 block h-0.5 w-6 -translate-y-1/2 bg-current transition-opacity duration-base ease-out-brand",
              open ? "opacity-0" : "opacity-100",
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-0.5 w-6 bg-current transition-all duration-base ease-out-brand",
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
            )}
          />
        </span>
      </button>

      {/* overlay, portaled to body so it escapes the header's backdrop-filter
          containing block and covers the full viewport */}
      {mounted &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[55] md:hidden",
              open ? "pointer-events-auto" : "pointer-events-none",
            )}
          >
            <div
              onClick={() => setOpen(false)}
              className={cn(
                "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-base ease-out-brand",
                open ? "opacity-100" : "opacity-0",
              )}
            />
        <nav
          aria-label="Mobile"
          className={cn(
            "absolute right-0 top-0 flex h-full w-[80%] max-w-xs flex-col border-l border-hairline bg-bg shadow-2xl transition-transform duration-slow ease-out-brand",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center gap-2.5 border-b border-hairline px-6 py-5">
            <SlashX size={16} accent />
            <span className="type-kicker text-muted">Menu</span>
          </div>
          <ul className="flex flex-col px-3 py-4">
            {items.map((item, i) => {
              const style = {
                transitionDelay: open ? `${90 + i * 55}ms` : "0ms",
              };
              const active = !item.external && isActive(pathname, item.href);
              const inner = (
                <span className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  ) : null}
                </span>
              );
              const cls = cn(
                "block rounded-lg px-3 py-3.5 text-lg tracking-wide transition-all duration-slow ease-out-brand",
                open ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0",
                active ? "text-primary" : "text-secondary",
              );
              return (
                <li key={item.label}>
                  {item.disabled || !item.href ? (
                    <span
                      style={style}
                      className={cn(cls, "cursor-default text-muted")}
                    >
                      {inner}
                    </span>
                  ) : item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={style}
                      className={cls}
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      style={style}
                      className={cls}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
