import Image from "next/image";
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
    return (
      <Image
        src={imageUrl}
        alt={alt}
        width={Math.round(height * 0.72)}
        height={height}
        priority={priority}
        sizes="(max-width: 768px) 60vw, 320px"
        style={{ height, width: "auto" }}
        className={cn("block object-contain", className)}
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
