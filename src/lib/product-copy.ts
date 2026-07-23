import type { Flavor, ProductCategory } from "@/db/schema";

/* =============================================================================
   Default per-flavor marketing copy.

   These are the storefront fallbacks used when a product_content row leaves
   `tagline` / `description` blank, and they are also surfaced as the admin
   editor's placeholders, so every flavor reads as complete out of the box
   while staying fully overridable.

   COMPLIANCE: KR8MX is a kratom-derived product. This copy is sensory / craft /
   standard language ONLY, no structure/function or effect claims. It must stay
   clear of the content-guard denylist (energy*, focus, boost, enhance, mood,
   relief, calm, treat, cure, dose, wellness). *"Energy Drink" is the whitelisted
   legal category descriptor.
   ============================================================================= */

export type DefaultCopy = { tagline: string; description: string };

const DRINK_COPY: Record<Flavor, DefaultCopy> = {
  grape: {
    tagline: "Dark & Structured",
    description:
      "Deep, jammy grape with a cool, structured finish. Lightly carbonated and dialed in, 12 fl oz of sharp, controlled refreshment, built on the MitraGen+™ standard.",
  },
  strawberry: {
    tagline: "Ripe & Composed",
    description:
      "Ripe, sun-warmed strawberry with a crisp, clean edge. Never syrupy, never loud, 12 fl oz of composed, elevated refreshment, built on the MitraGen+™ standard.",
  },
  blue_razz: {
    tagline: "Cold & Electric",
    description:
      "Tart blue raspberry with a bright, snapping finish. Cold, sharp, and precise, 12 fl oz of controlled refreshment, built on the MitraGen+™ standard.",
  },
  lemon: {
    tagline: "Sharp & Dry",
    description:
      "Bright, real-citrus lemon with a dry, clean finish. Crisp and unsweet, 12 fl oz of sharp, controlled refreshment, built on the MitraGen+™ standard.",
  },
  peach: {
    tagline: "Sun-Ripe & Smooth",
    description:
      "Sun-ripened orchard peach, lightly sparkling and clean to the finish. Smooth, never cloying, 12 fl oz of controlled, elevated refreshment, built on the MitraGen+™ standard.",
  },
};

const TABLET_COPY: Record<Flavor, DefaultCopy> = {
  grape: {
    tagline: "Dark & Structured",
    description:
      "Deep grape, flavor-coded and precise. A lighter, exact format built on the MitraGen+™ standard, 100 mg per tablet. 21+ adult use only.",
  },
  strawberry: {
    tagline: "Ripe & Composed",
    description:
      "Ripe strawberry in a lighter, exact format. Flavor-coded and precise, built on the MitraGen+™ standard, 100 mg per tablet. 21+ adult use only.",
  },
  blue_razz: {
    tagline: "Cold & Electric",
    description:
      "Tart blue razz, flavor-coded and precise. A lighter, exact format built on the MitraGen+™ standard, 100 mg per tablet. 21+ adult use only.",
  },
  lemon: {
    tagline: "Sharp & Dry",
    description:
      "Sharp citrus lemon in a lighter, exact format. Flavor-coded and precise, built on the MitraGen+™ standard, 100 mg per tablet. 21+ adult use only.",
  },
  peach: {
    tagline: "Sun-Ripe & Smooth",
    description:
      "Sun-ripe peach, flavor-coded and precise. A lighter, exact format built on the MitraGen+™ standard, 100 mg per tablet. 21+ adult use only.",
  },
};

/** Default tagline + description for a flavor in a given line. */
export function defaultCopy(
  category: ProductCategory,
  flavor: Flavor,
): DefaultCopy {
  return category === "tablets" ? TABLET_COPY[flavor] : DRINK_COPY[flavor];
}
