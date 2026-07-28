"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Back-to-top pill. Fades in after scrolling down and returns to the top with a
 * smooth scroll. Desktop only (hidden on mobile, where the PDP sticky action bar
 * owns the bottom-right corner). Decorative affordance, labeled for a11y.
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 right-6 z-40 hidden h-11 w-11 items-center justify-center rounded-full border border-hairline bg-bg/90 text-primary shadow-lg backdrop-blur transition-all duration-base ease-out-brand hover:-translate-y-0.5 md:flex",
        show ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 19V5M6 11l6-6 6 6" />
      </svg>
    </button>
  );
}
