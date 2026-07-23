import { describe, it, expect } from "vitest";
import {
  resolveContent,
  applyPriceOverrides,
  getDrinkVariants,
  getTabletVariants,
  getTabletsCatalog,
  tabletPackLabel,
  TABLET_FLAVORS,
  FLAVOR_META,
} from "@/lib/catalog";
import { resolveVariantBySku } from "@/lib/orders/pricing";
import { defaultCopy } from "@/lib/product-copy";
import { scanText } from "@/lib/compliance/content-guard";
import { FLAVORS } from "@/db/seed-data";
import type { ProductContent } from "@/db/schema";

function content(over: Partial<ProductContent>): ProductContent {
  return {
    id: 1,
    category: "drinks",
    flavor: "grape",
    name: null,
    tagline: null,
    description: null,
    imageUrl: null,
    accentHex: null,
    updatedAt: new Date(),
    ...over,
  };
}

describe("resolveContent — override merge", () => {
  it("falls back to seed defaults + default copy when no override row exists", () => {
    const c = resolveContent("drinks", "grape", null);
    expect(c.name).toBe(FLAVOR_META.grape.name);
    expect(c.hex).toBe(FLAVOR_META.grape.hex);
    expect(c.imageUrl).toBeNull();
    // tagline + description now fall back to the compelling default copy
    expect(c.tagline).toBe(defaultCopy("drinks", "grape").tagline);
    expect(c.description).toBe(defaultCopy("drinks", "grape").description);
  });

  it("uses the line-specific default copy (drinks vs tablets differ)", () => {
    const drink = resolveContent("drinks", "peach", null);
    const tablet = resolveContent("tablets", "peach", null);
    expect(drink.description).toBe(defaultCopy("drinks", "peach").description);
    expect(tablet.description).toBe(defaultCopy("tablets", "peach").description);
    expect(drink.description).not.toBe(tablet.description);
  });

  it("layers non-empty overrides over defaults", () => {
    const c = resolveContent(
      "drinks",
      "grape",
      content({
        name: "Grape Reserve",
        accentHex: "#123456",
        description: "  Bold copy  ",
        imageUrl: "https://x.public.blob.vercel-storage.com/a.png",
      }),
    );
    expect(c.name).toBe("Grape Reserve");
    expect(c.hex).toBe("#123456");
    expect(c.description).toBe("Bold copy"); // trimmed
    expect(c.imageUrl).toBe("https://x.public.blob.vercel-storage.com/a.png");
  });

  it("treats blank/whitespace override fields as absent", () => {
    const c = resolveContent(
      "drinks",
      "grape",
      content({ name: "   ", accentHex: "" }),
    );
    expect(c.name).toBe(FLAVOR_META.grape.name);
    expect(c.hex).toBe(FLAVOR_META.grape.hex);
  });
});

describe("applyPriceOverrides", () => {
  it("returns the same variants untouched when no map is given", () => {
    const vs = getDrinkVariants("grape");
    expect(applyPriceOverrides(vs)).toEqual(vs);
    expect(applyPriceOverrides(vs, new Map())).toEqual(vs);
  });

  it("overrides only the SKUs present in the map", () => {
    const vs = getDrinkVariants("grape");
    const target = vs[0];
    const map = new Map<string, number>([[target.sku, 9999]]);
    const out = applyPriceOverrides(vs, map);
    expect(out[0].priceCents).toBe(9999);
    expect(out[1].priceCents).toBe(vs[1].priceCents);
  });
});

describe("default product copy — compliance", () => {
  it("carries a tagline + description for every flavor in both lines", () => {
    for (const category of ["drinks", "tablets"] as const) {
      for (const flavor of FLAVORS) {
        const copy = defaultCopy(category, flavor);
        expect(copy.tagline.length).toBeGreaterThan(0);
        expect(copy.description.length).toBeGreaterThan(20);
      }
    }
  });

  it("contains no prohibited claim words", () => {
    for (const category of ["drinks", "tablets"] as const) {
      for (const flavor of FLAVORS) {
        const copy = defaultCopy(category, flavor);
        expect(scanText(`${copy.tagline}\n${copy.description}`)).toEqual([]);
      }
    }
  });
});

describe("tablet catalog", () => {
  it("returns a blister then container per flavor, ascending by count", () => {
    for (const flavor of TABLET_FLAVORS) {
      const vs = getTabletVariants(flavor);
      expect(vs.map((v) => v.form)).toEqual(["blister", "container"]);
      expect(vs.map((v) => v.tablets)).toEqual([5, 10]);
      expect(vs.every((v) => v.mgPerTab === 100)).toBe(true);
      expect(vs.every((v) => v.status === "coming_soon")).toBe(true);
    }
  });

  it("labels formats and applies price overrides by SKU", () => {
    const vs = getTabletVariants("grape");
    expect(tabletPackLabel(vs[0])).toBe("5-tablet blister");
    expect(tabletPackLabel(vs[1])).toBe("10-tablet container");
    const map = new Map<string, number>([[vs[0].sku, 1234]]);
    const out = applyPriceOverrides(vs, map);
    expect(out[0].priceCents).toBe(1234);
    expect(out[1].priceCents).toBe(vs[1].priceCents);
  });

  it("catalog carries every flavor with its variants", () => {
    const cat = getTabletsCatalog();
    expect(cat.map((c) => c.flavor)).toEqual([...TABLET_FLAVORS]);
    expect(cat.every((c) => c.variants.length === 2)).toBe(true);
  });
});

describe("resolveVariantBySku — live price wins", () => {
  it("uses the DB override price when present, else the seed price", () => {
    const seed = resolveVariantBySku("K8D-GRP-06");
    expect(seed).not.toBeNull();
    const overridden = resolveVariantBySku(
      "K8D-GRP-06",
      new Map([["K8D-GRP-06", 4242]]),
    );
    expect(overridden?.priceCents).toBe(4242);
    // Unrelated SKU in the map does not affect this one.
    const untouched = resolveVariantBySku(
      "K8D-GRP-06",
      new Map([["K8D-STR-06", 1]]),
    );
    expect(untouched?.priceCents).toBe(seed?.priceCents);
  });
});
