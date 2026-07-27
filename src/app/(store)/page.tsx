import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { CountUp } from "@/components/site/CountUp";
import { defaultTabletImage, flavorToSlug } from "@/lib/catalog";
import type { Flavor } from "@/db/schema";

export const metadata: Metadata = {
  description:
    "KR8MX Tablets deliver 100 mg MitraGen+™ per tablet, in bottle and blister-pack formats. Five flavors: Grape, Lemon, Peach, Strawberry, and Blue Razz. Built with the proprietary MitraGen+™ formula by Mitragen Labs. 21+.",
};

const PURPLE = "#6C2FB0";
const HERO_DESKTOP = "/brand/tablets/hero-desktop.jpg";
const HERO_MOBILE = "/brand/tablets/hero-mobile.jpg";
const WHOLESALE_URL = "https://www.naturesbridgegroup.com/wholesale";

type Card = { flavor: Flavor; name: string; color: string; tagline: string };
const FLAVOR_CARDS: Card[] = [
  { flavor: "strawberry", name: "Strawberry", color: "#E23140", tagline: "Ripe. Clean. Classic." },
  { flavor: "grape", name: "Grape", color: "#7A3FB0", tagline: "Deep. Bold. Structured." },
  { flavor: "blue_razz", name: "Blue Razz", color: "#12A2C0", tagline: "Cold. Sharp. Electric." },
  { flavor: "peach", name: "Peach", color: "#F0801F", tagline: "Sun-ripe. Smooth." },
  { flavor: "lemon", name: "Lemon", color: "#C79600", tagline: "Bright. Crisp. Dry." },
];

const STATS = [
  { to: 0, suffix: "", label: "PPM 7-OH" },
  { to: 100, suffix: "mg", label: "MitraGen+™ per tab" },
  { to: 200, suffix: "mg", label: "Minor alkaloids" },
  { to: 300, suffix: "mg", label: "Total per tab" },
];

const VALUE_POINTS = [
  { title: "MitraGen+™ Formula", body: "100 mg per tablet, solvent-free.", d: "M9 3v6l-5 8a2 2 0 0 0 1.7 3h12.6a2 2 0 0 0 1.7-3l-5-8V3M7.5 3h9M8 14h8" },
  { title: "Isolated & Standardized", body: "Minor alkaloids. No synthetics.", d: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6zM9 12l2 2 4-4" },
  { title: "Lab-Tested Every Lot", body: "0 PPM 7-hydroxymitragynine.", d: "M8 3h8M10 3v6l-4 9a2 2 0 0 0 1.8 3h8.4a2 2 0 0 0 1.8-3l-4-9V3" },
  { title: "Made in the USA", body: "U.S.-grown kratom.", d: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" },
];

function Chevron() {
  return <span className="font-normal">&rsaquo;</span>;
}

export default function Home() {
  return (
    <>
      {/* ---- Hero: full-panel image, copy overlaid on desktop ---- */}
      <section className="relative overflow-hidden">
        {/* desktop full-panel background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-cover bg-right bg-no-repeat md:block"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(250,251,252,.95) 0%, rgba(250,251,252,.72) 34%, rgba(250,251,252,0) 56%), url('${HERO_DESKTOP}')`,
          }}
        />
        <div className="relative mx-auto flex w-full max-w-[1280px] flex-col px-6 pt-6 sm:pt-8 md:min-h-[620px] md:justify-center md:pt-0">
          <div className="md:max-w-[52%]">
            <span className="type-kicker" style={{ color: PURPLE }}>
              Premium Kratom Tablets
            </span>
            <h1
              className="type-display mt-4 text-primary text-5xl leading-[0.92] [overflow-wrap:normal] sm:text-6xl md:text-7xl"
              style={{ fontWeight: 900 }}
            >
              PURE
              <br />
              SCIENCE.
            </h1>
            <div
              className="mt-6 h-[5px] w-16 rounded-full"
              style={{ background: PURPLE }}
            />
            <p className="mt-5 max-w-[44ch] text-sm leading-relaxed text-secondary sm:text-base">
              <span className="font-semibold text-primary">
                Built with MitraGen+&trade;.
              </span>{" "}
              A proprietary, solvent-free formulation of isolated, standardized
              alkaloids. U.S.-grown kratom. Made in the USA. Lab-tested every
              lot.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/tablets"
                className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: PURPLE }}
              >
                Explore Tablets <Chevron />
              </Link>
              <a
                href={WHOLESALE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] bg-white px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-surface-raised"
                style={{ color: PURPLE, borderColor: PURPLE }}
              >
                Wholesale Pricing <Chevron />
              </a>
            </div>
          </div>

          {/* mobile hero image */}
          <div className="mt-7 overflow-hidden rounded-xl md:hidden">
            <Image
              src={HERO_MOBILE}
              alt="KR8MX Tablets, five flavors"
              width={1200}
              height={800}
              priority
              sizes="100vw"
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* ---- Value points ---- */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="relative z-10 -mt-2 grid grid-cols-1 rounded-xl border border-hairline bg-surface shadow-[0_24px_50px_rgba(20,30,40,0.08)] sm:grid-cols-2 lg:grid-cols-4 md:-mt-10">
          {VALUE_POINTS.map((p, i) => (
            <div
              key={p.title}
              className={`flex items-start gap-3.5 p-6 ${
                i > 0 ? "border-t border-hairline lg:border-l lg:border-t-0" : ""
              } ${i === 2 ? "sm:border-t-0 sm:border-l lg:border-l" : ""} ${
                i === 1 || i === 3 ? "sm:border-l" : ""
              }`}
            >
              <svg
                width={30}
                height={30}
                viewBox="0 0 24 24"
                fill="none"
                stroke={PURPLE}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0"
              >
                <path d={p.d} />
              </svg>
              <div>
                <span className="block text-sm text-primary">{p.title}</span>
                <span className="mt-0.5 block text-2xs leading-relaxed text-muted">
                  {p.body}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---- Beyond 7-OH: the new standard ---- */}
      <section className="relative mt-16 overflow-hidden bg-[#0b0b0d] text-white sm:mt-24">
        <div
          aria-hidden
          className="animate-glow pointer-events-none absolute -right-24 -top-40 h-[560px] w-[560px] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${PURPLE}, transparent 62%)` }}
        />
        <div
          aria-hidden
          className="animate-glow pointer-events-none absolute -left-32 bottom-[-10rem] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, #20b1c9, transparent 65%)",
            animationDelay: "-3.5s",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <Reveal className="max-w-2xl">
            <span className="type-kicker" style={{ color: "#c4a3ef" }}>
              The New Standard
            </span>
            <h2
              className="type-display mt-3 whitespace-nowrap text-white text-[min(8.5vw,3.75rem)] leading-none"
              style={{ fontWeight: 900 }}
            >
              Beyond 7-OH.
            </h2>
            <p className="mt-5 max-w-prose text-sm leading-relaxed text-white/70 sm:text-base">
              New laws are moving the market away from 7-OH. KR8MX is the
              replacement, and the new standard for kratom tablets: 0 PPM
              7-hydroxymitragynine, standardized minor alkaloids, solvent-free
              isolation, and lab-tested every lot. Compliant, precise, and built
              to lead the category.
            </p>
          </Reveal>

          {/* animated stat tiles */}
          <div className="relative mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:mt-14 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-1.5 bg-[#0b0b0d] p-6 sm:p-8"
              >
                <div
                  className="type-display text-4xl sm:text-5xl"
                  style={{ color: "#c4a3ef", fontWeight: 800 }}
                >
                  <CountUp to={s.to} />
                  {s.suffix ? (
                    <span className="ml-0.5 text-2xl sm:text-3xl">{s.suffix}</span>
                  ) : null}
                </div>
                <div className="text-2xs uppercase tracking-wide text-white/55">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- The lineup ---- */}
      <section className="px-6 py-16 text-center sm:py-24">
        <Reveal className="mx-auto max-w-6xl">
          <span className="type-kicker" style={{ color: PURPLE }}>
            The KR8MX&trade; Lineup
          </span>
          <h2 className="type-display mt-3 text-primary text-3xl sm:text-4xl md:text-[40px]">
            Premium Kratom Tablets. Purpose-Built.
          </h2>
          <p className="mx-auto mt-4 max-w-[64ch] text-sm leading-relaxed text-secondary sm:text-base">
            Each tablet delivers 100 mg MitraGen+&trade; plus 200 mg
            standardized minor alkaloids, 300 mg total, in a solvent-free
            formula crafted for consistency, purity, and precision.
          </p>

          {/* cards: desktop grid */}
          <div className="mt-11 hidden gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-5">
            {FLAVOR_CARDS.map((c) => (
              <Link
                key={c.flavor}
                href={`/tablets/${flavorToSlug(c.flavor)}`}
                className="group flex flex-col rounded-xl border border-hairline bg-surface p-4 pb-5 text-center shadow-[0_10px_26px_rgba(20,30,40,0.05)] transition-transform hover:-translate-y-1"
              >
                <div
                  className="flex h-44 items-end justify-center rounded-lg p-3.5"
                  style={{ background: "linear-gradient(180deg,#fbfcfd,#eef1f4)" }}
                >
                  <Image
                    src={defaultTabletImage(c.flavor)}
                    alt={`KR8MX ${c.name} Tablets`}
                    width={130}
                    height={190}
                    className="h-full w-auto object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.18)]"
                  />
                </div>
                <span
                  className="type-display mt-4 text-base tracking-wide"
                  style={{ color: c.color, fontWeight: 800 }}
                >
                  {c.name.toUpperCase()}
                </span>
                <span className="mt-1 text-2xs text-muted">{c.tagline}</span>
                <span
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] px-3.5 py-2.5 text-xs font-semibold"
                  style={{ color: c.color, borderColor: c.color }}
                >
                  View Product <Chevron />
                </span>
              </Link>
            ))}
          </div>

          {/* cards: mobile CTA */}
          <Link
            href="/tablets"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg border-[1.5px] bg-white px-6 py-3.5 text-sm font-semibold sm:hidden"
            style={{ color: PURPLE, borderColor: PURPLE }}
          >
            View All Flavors <Chevron />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
