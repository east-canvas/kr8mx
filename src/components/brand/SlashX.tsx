import { cn } from "@/lib/cn";

type SlashXProps = {
  /** Size in px (applied to width & height). */
  size?: number;
  /** Tailwind color class for the primary strokes. Defaults to currentColor. */
  className?: string;
  /** When set, the trailing slash uses the accent color as a scalpel highlight. */
  accent?: boolean;
  title?: string;
};

/**
 * The brand's slashed-X motif — the amplified "X" from the KR8MX wordmark.
 * Two crossing strokes with one elongated accent slash breaking past the frame.
 * Inherits `currentColor` for the primary strokes; opt into `accent` for the
 * lime / flavor highlight on the slash.
 */
export function SlashX({ size = 24, className, accent = false, title }: SlashXProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("shrink-0", className)}
    >
      {title ? <title>{title}</title> : null}
      {/* primary stroke — top-left to bottom-right */}
      <path
        d="M6 5 L26 27"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="square"
      />
      {/* counter stroke — bottom-left to upper-right, stopping short */}
      <path
        d="M7 26 L20 11"
        stroke="currentColor"
        strokeWidth="3.25"
        strokeLinecap="square"
      />
      {/* the slash — elongated accent breaking past the frame */}
      <path
        d="M18 13 L31 -1"
        stroke={accent ? "var(--color-accent)" : "currentColor"}
        strokeWidth="3.25"
        strokeLinecap="square"
      />
    </svg>
  );
}
