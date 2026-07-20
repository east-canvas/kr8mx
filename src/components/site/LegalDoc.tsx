import type { ReactNode } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Shared shell for a legal document: heading, a placeholder notice, body. */
export function LegalDoc({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-6">
      <SectionHeading kicker="Legal" title={title} as="h1" />
      <p className="text-xs uppercase tracking-wide text-muted">
        Placeholder — pending counsel review. Last updated: TODO.
      </p>
      <div className="flex flex-col gap-4 text-sm leading-relaxed text-secondary">
        {children}
      </div>
    </article>
  );
}
