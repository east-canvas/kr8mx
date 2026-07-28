"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Mobile-only sticky action bar for product pages. Keeps the "Notify me" CTA in
 * reach while scrolling. It slides out of the way whenever the on-page notify
 * form, the closing CTA band, or the footer is in view, so it never doubles up
 * with a CTA the user can already see. Progressive enhancement: with no
 * IntersectionObserver it simply stays visible. The link jumps to the notify
 * form (scroll-margin keeps it clear of the sticky header).
 */
export function PdpStickyBar({
  name,
  accent,
  targetId = "notify",
}: {
  name: string;
  accent: string;
  targetId?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const visibleRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = [
      document.getElementById(targetId),
      document.querySelector("[data-cta-band]"),
      document.querySelector("footer"),
    ].filter((el): el is Element => Boolean(el));
    if (targets.length === 0) return;

    const seen = visibleRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        setHidden(seen.size > 0);
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [targetId]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-bg/90 backdrop-blur-md transition-transform duration-slow ease-out-brand md:hidden",
        hidden ? "translate-y-full" : "translate-y-0",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold text-primary">
            {name}
          </span>
          <span className="text-2xs text-muted">
            Premarket · Notify for launch
          </span>
        </div>
        <a
          href={`#${targetId}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          Notify me
        </a>
      </div>
    </div>
  );
}
