import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

type WordmarkProps = {
  /** Render tone. Two crisp, padding-trimmed source assets (not a CSS filter). */
  tone?: "black" | "white";
  /** Rendered height in px (width scales to the trimmed source ratio). */
  height?: number;
  className?: string;
  /**
   * Optional Tailwind size classes (e.g. "h-[22px] w-auto md:h-5"). When set,
   * the mark is sized by CSS instead of a fixed px height, used for responsive
   * sizing. `height` still sets the intrinsic aspect ratio.
   */
  sizeClassName?: string;
  /** Wrap in a link to a destination (defaults to home). Pass null to disable. */
  href?: string | null;
  priority?: boolean;
};

// Trimmed source assets are 1344 x 451.
const RATIO = 1344 / 451;

/**
 * KR8MX wordmark. Uses padding-trimmed black / white PNGs rendered `unoptimized`
 * so the browser downsamples the full-resolution art directly, the fine slashed-X
 * stays crisp instead of aliasing through the image optimizer at small sizes.
 */
export function Wordmark({
  tone = "black",
  height = 28,
  className,
  sizeClassName,
  href = "/",
  priority = false,
}: WordmarkProps) {
  const width = Math.round(height * RATIO);
  const src =
    tone === "white"
      ? "/brand/kr8mx-wordmark-white.png"
      : "/brand/kr8mx-wordmark-black.png";

  const img = (
    <Image
      src={src}
      alt="KR8MX"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      // Explicit px width (not "auto") so a flex parent's default
      // align-items: stretch can never distort the aspect ratio. shrink-0 +
      // max-w-none keep it from being squeezed in tight containers. When
      // sizeClassName is set, CSS controls the size (responsive) instead.
      className={cn(
        "block max-w-none shrink-0 select-none",
        sizeClassName,
        className,
      )}
      style={sizeClassName ? undefined : { height, width }}
    />
  );

  if (href === null) return img;
  return (
    <Link
      href={href}
      aria-label="KR8MX, home"
      className="inline-flex items-center"
    >
      {img}
    </Link>
  );
}
