import { cn } from "@/lib/cn";

/**
 * A thin brand rule. Horizontal by default; `orientation="vertical"` for
 * column dividers. Uses the theme's hairline token.
 */
export function HairlineRule({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <hr
      aria-hidden="true"
      className={cn(
        "border-0 bg-hairline",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
