import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { NotifyForm } from "@/components/site/NotifyForm";

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

      <NotifyForm cta="Join the list" />
      <p className="mt-3 text-2xs text-muted">21+ only. No spam.</p>
    </div>
  );
}
