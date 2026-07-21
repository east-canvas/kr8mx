import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SlashX } from "@/components/brand/SlashX";
import { CanSilhouette } from "@/components/brand/CanSilhouette";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Reveal } from "@/components/ui/Reveal";
import { getDrinksCatalog, flavorToSlug } from "@/lib/catalog";
import { formatCents } from "@/db/money";

export const metadata: Metadata = {
  title: "Drinks",
  description:
    "The KR8MX Energy Drink line — five flavors, one standard. Sharp, controlled, elevated.",
};

export default function DrinksCollectionPage() {
  const catalog = getDrinksCatalog();

  return (
    <div>
      {/* cinematic hero */}
      <section className="relative overflow-hidden">
        <div className="relative aspect-[16/10] w-full sm:aspect-[16/7]">
          <Image
            src="/brand/drinks-hero.png"
            alt="KR8MX Energy Drink can"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-6xl px-6 pb-10">
              <div className="flex items-center gap-3 text-muted">
                <SlashX size={16} accent />
                <span className="type-kicker">The Performance Line</span>
              </div>
              <h1 className="type-display mt-4 max-w-[16ch] text-primary text-4xl sm:text-5xl md:text-6xl">
                Energy Drink
              </h1>
              <p className="mt-4 max-w-md text-sm text-secondary">
                Five flavors. One standard. No noise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HairlineRule />

      {/* flavor cards — full-bleed dark, alternating */}
      <div>
        {catalog.map((item, i) => {
          const startPrice = item.variants[0]?.priceCents ?? 0;
          const flip = i % 2 === 1;
          return (
            <Link
              key={item.flavor}
              href={`/drinks/${flavorToSlug(item.flavor)}`}
              className="group block border-b border-hairline"
            >
              <article
                className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 md:min-h-[420px] md:flex-row md:justify-between md:py-20"
                style={{
                  background: `radial-gradient(120% 120% at ${
                    flip ? "85%" : "15%"
                  } 30%, ${item.hex}1f, transparent 60%)`,
                }}
              >
                <Reveal className={flip ? "md:order-2" : ""}>
                  <CanSilhouette
                    accent={item.hex}
                    height={300}
                    idKey={item.flavor}
                    className="mx-auto transition-transform duration-slow ease-out-brand group-hover:-translate-y-1.5"
                  />
                </Reveal>

                <Reveal
                  delay={120}
                  className={`flex flex-col gap-5 ${flip ? "md:order-1" : ""}`}
                >
                  <span
                    className="type-kicker"
                    style={{ color: item.hex }}
                  >
                    {String(i + 1).padStart(2, "0")} / Flavor
                  </span>
                  <h2 className="type-display text-primary text-3xl sm:text-4xl md:text-5xl">
                    {item.name}
                  </h2>
                  <p className="text-sm text-secondary">
                    From {formatCents(startPrice)}{" "}
                    <span className="text-muted">· 6 / 12 / 24 pack</span>
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-primary">
                    View
                    <span className="transition-transform duration-base ease-out-brand group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </span>
                </Reveal>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
