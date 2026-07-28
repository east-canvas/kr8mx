"use client";

import { useEffect, useState } from "react";

/**
 * Thin brand-purple reading-progress bar pinned to the very top of the viewport.
 * Client-only; renders nothing meaningful for assistive tech (decorative). Sits
 * above the sticky header. Under prefers-reduced-motion it still tracks position
 * (it is a status indicator, not an animation), just without an easing tween.
 */
const PURPLE = "#6C2FB0";

export function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.documentElement;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
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
        className="h-full origin-left transition-[width] duration-150 ease-out"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${PURPLE}, #9b5fd6)`,
          boxShadow: `0 0 10px ${PURPLE}66`,
        }}
      />
    </div>
  );
}
