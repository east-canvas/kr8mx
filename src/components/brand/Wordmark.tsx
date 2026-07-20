import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

type WordmarkProps = {
  /** Render tone. The source art is black; "white" inverts it via CSS filter. */
  tone?: "black" | "white";
  /** Rendered height in px (width scales to the 2000x583 source ratio). */
  height?: number;
  className?: string;
  /** Wrap in a link to a destination (defaults to home). Pass null to disable. */
  href?: string | null;
  priority?: boolean;
};

const RATIO = 2000 / 583;

/**
 * KR8MX wordmark. Single black source asset; the white tone is produced with a
 * CSS invert so we ship one file and stay pixel-consistent across both themes.
 */
export function Wordmark({
  tone = "black",
  height = 28,
  className,
  href = "/",
  priority = false,
}: WordmarkProps) {
  const width = Math.round(height * RATIO);
  const img = (
    <Image
      src="/brand/kr8mx-logo-black.png"
      alt="KR8MX"
      width={width}
      height={height}
      priority={priority}
      className={cn(
        "block h-auto w-auto select-none",
        tone === "white" && "[filter:invert(1)_brightness(2)]",
        className,
      )}
      style={{ height, width: "auto" }}
    />
  );

  if (href === null) return img;
  return (
    <Link href={href} aria-label="KR8MX — home" className="inline-flex items-center">
      {img}
    </Link>
  );
}
