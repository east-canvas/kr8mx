import type { Metadata } from "next";
import Link from "next/link";
import { ThemeZone } from "@/components/ui/ThemeZone";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SlashX } from "@/components/brand/SlashX";
import { Wordmark } from "@/components/brand/Wordmark";
import { CanSilhouette } from "@/components/brand/CanSilhouette";
import { QualityPillars } from "@/components/site/QualityPillars";
import { FLAVOR_META } from "@/lib/catalog";

export const metadata: Metadata = {
  description:
    "One brand, two worlds. KR8MX — built for what's next. Explore the performance line and the precision tablet line.",
};

export default function Home() {
  return (
    <>
      {/* ---- Hero — light, editorial ---- */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="flex flex-col items-center gap-8 text-center">
          <Wordmark height={44} href={null} priority />
          <div className="flex items-center gap-3 text-muted">
            <SlashX size={16} accent />
            <span className="type-kicker">Performance. Elevated.</span>
          </div>
          <h1 className="type-display max-w-[14ch] text-primary text-5xl md:text-6xl">
            Built for what&rsquo;s next.
          </h1>
          <p className="max-w-md text-secondary">
            One brand, two worlds. A performance line and a precision line —
            engineered to a single, higher standard.
          </p>
        </div>
      </section>

      {/* ---- Split gateway — two worlds ---- */}
      <section
        aria-label="Product lines"
        className="mx-auto max-w-6xl px-6 pb-24"
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Drinks — dark performance vitrine, contained + framed */}
          <ThemeZone
            theme="performance"
            className="group relative overflow-hidden rounded-xl border border-hairline"
          >
            <div className="flex min-h-[440px] flex-col justify-between gap-10 p-10">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-3">
                  <span className="type-kicker text-muted">The Performance Line</span>
                  <h2 className="type-display text-primary text-3xl">
                    Energy Drink
                  </h2>
                </div>
                <SlashX size={26} accent />
              </div>

              <div className="flex items-end justify-between gap-6">
                <div className="flex flex-col gap-5">
                  <p className="max-w-[26ch] text-sm text-secondary">
                    Five flavors. Obsidian and light. Sharp, controlled, elevated.
                  </p>
                  <Button href="/drinks" variant="solid" size="md">
                    Explore Drinks
                  </Button>
                </div>
                <CanSilhouette accent="#c6ff00" height={220} idKey="home-drinks" />
              </div>
            </div>
          </ThemeZone>

          {/* Tablets — light precision panel, flavor gradient, premarket */}
          <div className="relative flex min-h-[440px] flex-col justify-between gap-10 overflow-hidden rounded-xl border border-hairline bg-surface p-10">
            {/* soft flavor-gradient accents */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-60 blur-3xl"
              style={{
                background: `radial-gradient(circle, ${FLAVOR_META.blue_razz.hex}33, transparent 70%)`,
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full opacity-50 blur-3xl"
              style={{
                background: `radial-gradient(circle, ${FLAVOR_META.grape.hex}2e, transparent 70%)`,
              }}
            />

            <div className="relative flex items-start justify-between">
              <div className="flex flex-col gap-3">
                <span className="type-kicker text-muted">The Precision Line</span>
                <h2 className="type-display text-primary text-3xl">Tablets</h2>
              </div>
              <Badge variant="outline">Premarket Preview</Badge>
            </div>

            <div className="relative flex flex-col gap-5">
              <p className="max-w-[30ch] text-sm text-secondary">
                Lighter format. Higher standards. Precision-formulated tablets,
                built with MitraGen+&trade;.
              </p>
              <Button href="/tablets" variant="outline" size="md">
                Preview Tablets
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Quality pillars ---- */}
      <QualityPillars />

      {/* ---- Standard callout ---- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="type-kicker text-muted">The Standard</span>
          <p className="type-display max-w-[20ch] text-primary text-2xl md:text-3xl">
            One standard. Every format.
          </p>
          <Link
            href="/standard"
            className="text-xs uppercase tracking-wide text-secondary underline-offset-4 transition-colors duration-base ease-out-brand hover:text-primary hover:underline"
          >
            How we build
          </Link>
        </div>
      </section>
    </>
  );
}
