"use client";

import { useEffect, useRef } from "react";

/**
 * Thin brand-purple reading-progress bar pinned to the very top of the viewport,
 * above the sticky header. Smoothness notes: it drives a GPU-composited
 * `transform: scaleX()` (not `width`), carries no CSS transition (so it tracks
 * the scroll position 1:1 instead of chasing it), and writes straight to the DOM
 * via a ref inside a single rAF per frame, so it never re-renders React while
 * scrolling. Decorative, so hidden from assistive tech.
 */
const PURPLE = "#6C2FB0";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
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
        className="h-full w-full origin-left will-change-transform"
        style={{
          transform: "scaleX(0)",
          background: `linear-gradient(90deg, ${PURPLE}, #9b5fd6)`,
          boxShadow: `0 0 10px ${PURPLE}66`,
        }}
      />
    </div>
  );
}
