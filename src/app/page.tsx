import { Wordmark } from "@/components/brand/Wordmark";
import { SlashX } from "@/components/brand/SlashX";
import { Button } from "@/components/ui/Button";
import { HairlineRule } from "@/components/ui/HairlineRule";

/**
 * Placeholder landing. The full "one brand, two worlds" home page is built in a
 * later step (Prompt 4); this keeps the root route on-brand and points at the
 * design-system proof route in the meantime.
 */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-10 px-6 py-24">
      <div className="flex flex-col gap-6">
        <Wordmark height={40} href={null} priority />
        <div className="flex items-center gap-3 text-muted">
          <SlashX size={16} accent />
          <span className="type-kicker">Performance. Elevated.</span>
        </div>
      </div>

      <h1 className="type-display text-primary text-4xl md:text-5xl max-w-[16ch]">
        Built for what&rsquo;s next.
      </h1>

      <HairlineRule />

      <p className="max-w-prose text-secondary">
        Design foundation in place — brand tokens, the two-theme system, typography,
        and shared primitives. Explore every primitive rendered in both theme zones.
      </p>

      <div>
        <Button href="/styleguide" variant="outline" size="lg">
          View the styleguide
        </Button>
      </div>
    </main>
  );
}
