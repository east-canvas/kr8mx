import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "outline" | "accent";

const variants: Record<Variant, string> = {
  default: "bg-surface-raised text-secondary border-transparent",
  outline: "bg-transparent text-secondary border-hairline",
  accent: "bg-accent text-accent-contrast border-accent",
};

export function Badge({
  children,
  variant = "outline",
  className,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1",
        "font-body text-2xs font-medium uppercase tracking-kicker",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
