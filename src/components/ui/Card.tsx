import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Surface container framed by a hairline. Restrained by default, no shadow;
 * `elevated` swaps to the raised surface token for gentle separation.
 */
export function Card({
  children,
  elevated = false,
  className,
}: {
  children: ReactNode;
  elevated?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-hairline p-6",
        elevated ? "bg-surface-raised" : "bg-surface",
        className,
      )}
    >
      {children}
    </div>
  );
}
