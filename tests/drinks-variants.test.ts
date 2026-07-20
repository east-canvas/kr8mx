import { describe, it, expect } from "vitest";
import {
  DRINK_FLAVORS,
  PACK_SIZES,
  getDrinkVariants,
  resolveDrinkVariant,
  flavorToSlug,
  slugToFlavor,
  FLAVOR_META,
} from "@/lib/catalog";
import { PLACEHOLDER_PRICES } from "@/db/seed-data";

describe("drink variant selection", () => {
  it("resolves the correct SKU + price for each flavor x pack", () => {
    for (const flavor of DRINK_FLAVORS) {
      const code = FLAVOR_META[flavor].code;
      for (const size of PACK_SIZES) {
        const v = resolveDrinkVariant(flavor, size);
        const pad = String(size).padStart(2, "0");
        expect(v.sku).toBe(`K8D-${code}-${pad}`);
        expect(v.packSize).toBe(size);
        expect(v.priceCents).toBe(PLACEHOLDER_PRICES.drinks[size]);
        expect(v.volumeMl).toBe(355);
      }
    }
  });

  it("returns 3 variants per flavor, ascending by pack size", () => {
    for (const flavor of DRINK_FLAVORS) {
      const variants = getDrinkVariants(flavor);
      expect(variants.map((v) => v.packSize)).toEqual([6, 12, 24]);
    }
  });

  it("round-trips flavor <-> slug", () => {
    expect(flavorToSlug("blue_razz")).toBe("blue-razz");
    expect(slugToFlavor("blue-razz")).toBe("blue_razz");
    expect(slugToFlavor("grape")).toBe("grape");
    expect(slugToFlavor("nope")).toBeNull();
  });

  it("throws for an invalid pack size", () => {
    // @ts-expect-error deliberately invalid pack size
    expect(() => resolveDrinkVariant("grape", 9)).toThrow();
  });
});
