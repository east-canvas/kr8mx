import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SlashX } from "@/components/brand/SlashX";

/**
 * Editorial section heading: a quiet kicker, a wide-tracked display title, and
 * the slashed-X motif as a small brand accent. Restraint over volume.
 */
export function SectionHeading({
  kicker,
  title,
  align = "left",
  showMotif = true,
  as: Tag = "h2",
  className,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  align?: "left" | "center";
  showMotif?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker ? (
        <div
          className={cn(
            "flex items-center gap-2.5 text-muted",
            align === "center" && "justify-center",
          )}
        >
          {showMotif ? <SlashX size={14} accent /> : null}
          <span className="type-kicker">{kicker}</span>
        </div>
      ) : null}
      <Tag className="type-display text-primary text-3xl md:text-4xl max-w-[18ch]">
        {title}
      </Tag>
    </div>
  );
}
