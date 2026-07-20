import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { HairlineRule } from "@/components/ui/HairlineRule";

export const metadata: Metadata = {
  title: "Access",
  description: "KR8MX Access — members-first drops and early availability.",
};

export default function AccessPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Badge variant="outline">Members Only</Badge>
      <SectionHeading kicker="Access" title="Built for the few." as="h1" className="mt-6" />
      <p className="mt-5 text-sm text-secondary">
        Limited drops. Early availability. First in line. Access opens soon.
      </p>

      <HairlineRule className="my-10" />

      <form className="flex flex-col gap-3 sm:flex-row" aria-label="Join the list">
        <input
          type="email"
          required
          placeholder="you@email.com"
          aria-label="Email address"
          className="flex-1 rounded-md border border-hairline bg-surface px-4 py-3 text-sm text-primary outline-none focus-visible:border-accent"
        />
        <button
          type="submit"
          className="rounded-sm border border-primary px-6 py-3 text-xs font-medium uppercase tracking-wide text-primary transition-colors duration-base ease-out-brand hover:bg-primary hover:text-bg"
        >
          Join the list
        </button>
      </form>
      <p className="mt-3 text-2xs text-muted">21+ only. No spam.</p>
    </div>
  );
}
