"use client";

import { useEffect } from "react";

/**
 * Themes the global scroll-progress bar to a page-specific color (used on product
 * pages so the bar adopts the active flavor's accent). Sets CSS variables on the
 * document element, which the fixed ScrollProgress bar reads, and clears them on
 * unmount so every other page falls back to the brand purple. Renders nothing.
 */
export function ProgressTheme({ color }: { color: string }) {
  useEffect(() => {
    const el = document.documentElement;
    el.style.setProperty("--kr8-progress", color);
    el.style.setProperty(
      "--kr8-progress-light",
      `color-mix(in srgb, ${color} 55%, white)`,
    );
    return () => {
      el.style.removeProperty("--kr8-progress");
      el.style.removeProperty("--kr8-progress-light");
    };
  }, [color]);

  return null;
}
