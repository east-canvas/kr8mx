"use client";

import { useEffect, useRef, useState } from "react";
import { SlashX } from "@/components/brand/SlashX";
import { cn } from "@/lib/cn";

/**
 * Animated section divider: a hairline that draws itself outward from a centered
 * slashed-X mark when scrolled into view. Progressive enhancement, it renders
 * fully drawn without JS and under prefers-reduced-motion, so nothing is ever
 * lost. Decorative, hidden from assistive tech.
 */
export function SectionDivider({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.7 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Fully drawn unless JS armed the animation and it has not yet triggered.
  const drawn = !armed || shown;

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("mx-auto flex max-w-6xl items-center gap-4 px-6", className)}
    >
      <span
        className={cn(
          "h-px flex-1 origin-right bg-hairline transition-transform duration-[900ms] ease-out-brand",
          drawn ? "scale-x-100" : "scale-x-0",
        )}
      />
      <span
        className={cn(
          "transition-all duration-500 ease-out-brand",
          drawn ? "scale-100 opacity-100" : "scale-75 opacity-0",
        )}
        style={{ transitionDelay: drawn ? "220ms" : "0ms" }}
      >
        <SlashX size={16} accent />
      </span>
      <span
        className={cn(
          "h-px flex-1 origin-left bg-hairline transition-transform duration-[900ms] ease-out-brand",
          drawn ? "scale-x-100" : "scale-x-0",
        )}
      />
    </div>
  );
}
