import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ThemeZoneProps = {
  theme: "performance" | "precision";
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

/**
 * Establishes a design-token scope. Everything inside resolves semantic
 * utilities (bg-surface, text-primary, accent, …) against the given theme.
 *
 * The zone paints its own base surface + text color so a `performance` tile
 * dropped into a light `precision` page reads as a contained, deliberate
 * vitrine rather than leaking the outer theme.
 */
export function ThemeZone({
  theme,
  as: Tag = "div",
  className,
  children,
}: ThemeZoneProps) {
  return (
    <Tag data-theme={theme} className={cn("bg-bg text-primary", className)}>
      {children}
    </Tag>
  );
}
