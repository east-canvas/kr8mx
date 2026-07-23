import { CanSilhouette } from "./CanSilhouette";
import { TabletSilhouette } from "./TabletSilhouette";
import { cn } from "@/lib/cn";

/**
 * Product hero visual. When the admin has uploaded an image for a flavor it is
 * shown; otherwise a generated silhouette (can for drinks, blister card for
 * tablets) is rendered as a graceful fallback. Height maps to the silhouette's
 * px height so both paths occupy the same footprint in the layout.
 */
export function ProductVisual({
  imageUrl,
  alt,
  accent,
  height = 320,
  idKey,
  className,
  priority = false,
  shape = "can",
}: {
  imageUrl: string | null;
  alt: string;
  accent: string;
  height?: number;
  idKey: string;
  className?: string;
  priority?: boolean;
  shape?: "can" | "tablet";
}) {
  if (imageUrl) {
    // Plain img: the source may be any aspect ratio (a can, a blister, or an
    // arbitrary admin upload), so we fix the height and let width follow the
    // image's true intrinsic ratio — no distortion, no need to know dimensions.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={alt}
        style={{ height, width: "auto" }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          "block max-w-full object-contain drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]",
          className,
        )}
      />
    );
  }
  const Silhouette = shape === "tablet" ? TabletSilhouette : CanSilhouette;
  return (
    <Silhouette
      accent={accent}
      height={height}
      idKey={idKey}
      className={className}
    />
  );
}
