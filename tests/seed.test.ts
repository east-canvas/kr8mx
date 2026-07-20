import { describe, it, expect } from "vitest";
import {
  buildLines,
  buildProducts,
  buildVariants,
  FLAVORS,
  DRINK_PACK_SIZES,
} from "@/db/seed-data";

describe("seed integrity", () => {
  const lines = buildLines();
  const products = buildProducts();
  const variants = buildVariants();

  it("has exactly the two product lines with theme keys", () => {
    expect(lines).toHaveLength(2);
    const bySlug = Object.fromEntries(lines.map((l) => [l.slug, l]));
    expect(bySlug.drinks.theme).toBe("performance");
    expect(bySlug.tablets.theme).toBe("precision");
  });

  it("has 5 drink products and 5 tablet products (one per flavor)", () => {
    const drinks = products.filter((p) => p.lineSlug === "drinks");
    const tablets = products.filter((p) => p.lineSlug === "tablets");
    expect(drinks).toHaveLength(5);
    expect(tablets).toHaveLength(5);
    expect(new Set(drinks.map((p) => p.flavor))).toEqual(new Set(FLAVORS));
    expect(new Set(tablets.map((p) => p.flavor))).toEqual(new Set(FLAVORS));
  });

  it("has 5 x 3 = 15 drink variants across pack sizes 6/12/24", () => {
    const drinkVariants = variants.filter((v) =>
      v.productSlug.startsWith("drink-"),
    );
    expect(drinkVariants).toHaveLength(15);
    // 3 pack sizes per flavor
    for (const flavor of FLAVORS) {
      const perFlavor = drinkVariants.filter((v) => v.flavor === flavor);
      expect(perFlavor).toHaveLength(DRINK_PACK_SIZES.length);
    }
  });

  it("has 5 x 2 = 10 tablet variants (container + blister per flavor)", () => {
    const tabletVariants = variants.filter((v) =>
      v.productSlug.startsWith("tablet-"),
    );
    expect(tabletVariants).toHaveLength(10);
    for (const flavor of FLAVORS) {
      const perFlavor = tabletVariants.filter((v) => v.flavor === flavor);
      expect(perFlavor).toHaveLength(2);
    }
  });

  it("has 25 variants total with unique SKUs", () => {
    expect(variants).toHaveLength(25);
    const skus = variants.map((v) => v.sku);
    expect(new Set(skus).size).toBe(skus.length);
  });

  it("drink SKUs follow K8D-{FLV}-{06|12|24}", () => {
    const drinkVariants = variants.filter((v) =>
      v.productSlug.startsWith("drink-"),
    );
    for (const v of drinkVariants) {
      expect(v.sku).toMatch(/^K8D-(GRP|STR|BLZ|LEM|PCH)-(06|12|24)$/);
    }
  });

  it("tablet SKUs follow KR8-T100-10-{FLV} and KR8-T100-05B-{FLV}", () => {
    const tabletVariants = variants.filter((v) =>
      v.productSlug.startsWith("tablet-"),
    );
    const containers = tabletVariants.filter((v) =>
      v.sku.startsWith("KR8-T100-10-"),
    );
    const blisters = tabletVariants.filter((v) =>
      v.sku.startsWith("KR8-T100-05B-"),
    );
    expect(containers).toHaveLength(5);
    expect(blisters).toHaveLength(5);
    for (const v of tabletVariants) {
      expect(v.sku).toMatch(/^KR8-T100-(10|05B)-(GRP|STR|BLZ|LEM|PCH)$/);
    }
  });

  it("all tablet variants are coming_soon; all drink variants active", () => {
    const drinkVariants = variants.filter((v) =>
      v.productSlug.startsWith("drink-"),
    );
    const tabletVariants = variants.filter((v) =>
      v.productSlug.startsWith("tablet-"),
    );
    expect(drinkVariants.every((v) => v.status === "active")).toBe(true);
    expect(tabletVariants.every((v) => v.status === "coming_soon")).toBe(true);
  });

  it("every price is integer cents and flagged as a TODO placeholder", () => {
    for (const v of variants) {
      expect(Number.isInteger(v.priceCents)).toBe(true);
      expect(v.priceCents).toBeGreaterThan(0);
      expect(v.priceTodo).toBe(true);
    }
  });

  it("pack_config carries the right shape per variant kind", () => {
    for (const v of variants) {
      const cfg = v.packConfig as Record<string, unknown>;
      if (v.productSlug.startsWith("drink-")) {
        expect(cfg.kind).toBe("case");
        expect(cfg.volumeMl).toBe(355);
      } else if (v.sku.includes("-05B-")) {
        expect(cfg.kind).toBe("blister");
        expect(cfg.tablets).toBe(5);
      } else {
        expect(cfg.kind).toBe("tablet_container");
        expect(cfg.tablets).toBe(10);
      }
    }
  });
});
