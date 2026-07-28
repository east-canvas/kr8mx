"use client";

import { useEffect, useRef } from "react";

/**
 * Thin brand-purple reading-progress bar pinned to the top of the viewport,
 * above the sticky header.
 *
 * Smoothness: where the browser supports scroll-driven animations, the bar is
 * driven entirely by CSS `animation-timeline: scroll()` (see .scroll-progress in
 * globals.css). The compositor maps scroll position onto `scaleX` off the main
 * thread, so there are no scroll listeners, no per-frame React renders, and no
 * repaints. The effect below is a pure fallback that only runs when that CSS
 * feature is unavailable, driving `scaleX` via a single rAF per frame. The bar
 * carries no box-shadow on purpose: a blurred shadow repaints every frame and
 * was the source of the earlier flicker. Decorative, so hidden from a11y.
 */
const PURPLE = "#6C2FB0";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Native scroll-timeline handles it; nothing to do on the main thread.
    if (
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("animation-timeline: scroll()")
    ) {
      return;
    }

    const el = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
      bar.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]"
    >
      <div
        ref={barRef}
        className="scroll-progress h-full w-full"
        style={{ background: `linear-gradient(90deg, ${PURPLE}, #9b5fd6)` }}
      />
    </div>
  );
}
