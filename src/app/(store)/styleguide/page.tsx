import type { Metadata } from "next";
import { ThemeZone } from "@/components/ui/ThemeZone";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SlashX } from "@/components/brand/SlashX";
import { Wordmark } from "@/components/brand/Wordmark";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "KR8MX design system, every primitive, rendered in both theme zones.",
};

/** Renders the full set of primitives. Dropped inside a <ThemeZone> so the same
 *  markup can be verified against both themes side by side. */
function Primitives({ tone }: { tone: "black" | "white" }) {
  return (
    <div className="flex flex-col gap-10 p-8">
      <Wordmark tone={tone} height={30} href={null} />

      <SectionHeading
        kicker="Section Heading"
        title="Built for what's next."
      />

      {/* Buttons */}
      <div className="flex flex-col gap-4">
        <span className="type-kicker text-muted">Buttons</span>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="solid">Shop now</Button>
          <Button variant="outline">Learn more</Button>
          <Button variant="ghost">Details</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="solid" size="sm">
            Small
          </Button>
          <Button variant="outline" size="md">
            Medium
          </Button>
          <Button variant="outline" size="lg">
            Large
          </Button>
          <Button variant="solid" disabled>
            Disabled
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-col gap-4">
        <span className="type-kicker text-muted">Badges</span>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">Original</Badge>
          <Badge variant="outline">Premarket Preview</Badge>
          <Badge variant="accent">New Drop</Badge>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-4">
        <span className="type-kicker text-muted">Cards</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <div className="flex items-center gap-2">
              <SlashX size={16} accent />
              <span className="type-kicker text-muted">Quality Assured</span>
            </div>
            <p className="mt-3 text-sm text-secondary">
              A restrained surface framed by a hairline. No shadow, no shout.
            </p>
          </Card>
          <Card elevated>
            <div className="flex items-center gap-2">
              <SlashX size={16} accent />
              <span className="type-kicker text-muted">Precision Formulated</span>
            </div>
            <p className="mt-3 text-sm text-secondary">
              The elevated variant sits on the raised surface token.
            </p>
          </Card>
        </div>
      </div>

      {/* Hairline + motif */}
      <div className="flex flex-col gap-4">
        <span className="type-kicker text-muted">Hairline &amp; Motif</span>
        <HairlineRule />
        <div className="flex items-center gap-6">
          <SlashX size={40} />
          <SlashX size={40} accent />
          <HairlineRule orientation="vertical" className="h-10" />
          <span className="type-kicker text-muted">Slashed-X</span>
        </div>
      </div>

      {/* Type scale */}
      <div className="flex flex-col gap-3">
        <span className="type-kicker text-muted">Type</span>
        <p className="type-display text-primary text-4xl">Display 4XL</p>
        <p className="type-display text-primary text-2xl">Display 2XL</p>
        <p className="text-lg text-primary">Body large, refined neutral sans.</p>
        <p className="text-sm text-secondary">Body small, secondary tone.</p>
        <p className="text-xs text-muted">Caption, muted tone.</p>
      </div>

      {/* Accent swatch */}
      <div className="flex items-center gap-3">
        <span className="h-6 w-6 rounded-sm bg-accent" />
        <span className="text-xs text-secondary">Accent (scalpel use only)</span>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto max-w-6xl px-8 py-12">
        <SectionHeading kicker="KR8MX Design System" title="Styleguide" as="h1" />
        <p className="mt-4 max-w-prose text-secondary">
          Every primitive rendered in both theme zones, proving each reads
          correctly in <strong className="text-primary">precision</strong> (light) and{" "}
          <strong className="text-primary">performance</strong> (dark).
        </p>
      </header>

      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-lg border border-hairline bg-hairline lg:grid-cols-2">
        <ThemeZone theme="precision">
          <div className="flex items-center gap-2 px-8 pt-8">
            <Badge variant="outline">Precision, Light</Badge>
          </div>
          <Primitives tone="black" />
        </ThemeZone>

        <ThemeZone theme="performance">
          <div className="flex items-center gap-2 px-8 pt-8">
            <Badge variant="outline">Performance, Dark</Badge>
          </div>
          <Primitives tone="white" />
        </ThemeZone>
      </div>

      <footer className="mx-auto max-w-6xl px-8 py-12">
        <HairlineRule />
        <p className="mt-6 text-xs text-muted">
          KR8MX, Brand strategy &amp; visual identity. Confidential / internal.
        </p>
      </footer>
    </main>
  );
}
