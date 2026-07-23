import { cn } from "@/lib/cn";

type SlashXProps = {
  /** Rendered height in px. */
  size?: number;
  /** Extra classes (e.g. a text color to tint via currentColor). */
  className?: string;
  /** Tint with the theme accent instead of currentColor. */
  accent?: boolean;
  title?: string;
};

// The real slashed-X from the KR8MX wordmark (public/brand/kr8mx-x.png).
const RATIO = 304 / 451;

/**
 * The brand's slashed-X mark, the actual X lifted from the wordmark, rendered
 * via a CSS mask so it inherits `currentColor` (or the accent) and stays crisp
 * at any size. Same API as before, so every existing usage picks it up.
 */
export function SlashX({ size = 24, className, accent = false, title }: SlashXProps) {
  const width = Math.round(size * RATIO);
  return (
    <span
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{
        width: `${width}px`,
        height: `${size}px`,
        WebkitMaskImage: "url(/brand/kr8mx-x.png)",
        maskImage: "url(/brand/kr8mx-x.png)",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
      className={cn(
        "inline-block shrink-0 align-middle",
        accent ? "bg-accent" : "bg-current",
        className,
      )}
    />
  );
}
