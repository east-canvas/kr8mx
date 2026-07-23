/**
 * Minimal className joiner, filters out falsy values.
 * Kept dependency-free; the design system is small enough that
 * conflict-resolution (tailwind-merge) isn't required yet.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
