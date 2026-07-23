import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SlashX } from "@/components/brand/SlashX";
import { Wordmark } from "@/components/brand/Wordmark";
import { QualityPillars } from "@/components/site/QualityPillars";
import { Reveal } from "@/components/ui/Reveal";
import { FLAVOR_META } from "@/lib/catalog";

export const metadata: Metadata = {
  description:
    "KR8MX — built for what's next. The precision tablet line: lighter format, higher standards, five flavors. 21+.",
};

export default function Home() {
  return (
    <>
      {/* ---- Hero — light, editorial ---- */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 md:pb-28 md:pt-28">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-8">
          <div className="animate-rise" style={{ animationDelay: "0ms" }}>
            <Wordmark height={44} href={null} priority />
          </div>
          <div
            className="flex animate-rise items-center gap-3 text-muted"
            style={{ animationDelay: "80ms" }}
          >
            <SlashX size={16} accent />
            <span className="type-kicker">Performance. Elevated.</span>
          </div>
          <h1
            className="type-display max-w-[14ch] animate-rise text-balance text-primary text-4xl sm:text-5xl md:text-6xl"
            style={{ animationDelay: "150ms" }}
          >
            Built for what&rsquo;s next.
          </h1>
          <p
            className="max-w-md animate-rise text-sm text-secondary sm:text-base"
            style={{ animationDelay: "240ms" }}
          >
            The precision tablet line — lighter format, higher standards,
            engineered to a single standard. Five flavors. 21+.
          </p>
        </div>
      </section>

      {/* ---- Tablets spotlight — the live precision line ---- */}
      <section aria-label="Product line" className="mx-auto max-w-6xl px-6 pb-24">
        <Reveal>
          <div className="relative flex min-h-[360px] flex-col justify-between gap-8 overflow-hidden rounded-xl border border-hairline bg-surface p-7 sm:min-h-[440px] sm:gap-10 sm:p-10 lg:flex-row lg:items-center lg:gap-12">
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

            <div className="relative flex flex-1 flex-col gap-5 lg:max-w-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="type-kicker text-muted">The Precision Line</span>
                <SlashX size={22} accent />
              </div>
              <h2 className="type-display text-primary text-3xl sm:text-4xl md:text-5xl">
                Tablets
              </h2>
              <p className="max-w-[34ch] text-sm text-secondary">
                Lighter format. Higher standards. Five flavors, built with
                MitraGen+&trade;. 21+ adult use only.
              </p>
              <Button href="/tablets" variant="solid" size="md">
                Explore Tablets
              </Button>
            </div>

            <div className="relative -mx-1 flex-1 overflow-hidden rounded-lg">
              <div className="relative aspect-[16/9]">
                <Image
                  src="/brand/hero-home.png"
                  alt="KR8MX tablets — five flavors"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---- Quality pillars ---- */}
      <Reveal>
        <QualityPillars />
      </Reveal>

      {/* ---- Standard callout ---- */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <Reveal className="flex flex-col items-center gap-6 text-center">
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
        </Reveal>
      </section>
    </>
  );
}
