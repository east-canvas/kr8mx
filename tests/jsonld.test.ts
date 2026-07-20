import { describe, it, expect } from "vitest";
import { buildDrinkProductGroupJsonLd } from "@/lib/jsonld";
import { DRINK_FLAVORS, getDrinkVariants } from "@/lib/catalog";

describe("drink JSON-LD (ProductGroup + variants)", () => {
  const ld = buildDrinkProductGroupJsonLd("grape");

  it("is a schema.org ProductGroup with brand + group id", () => {
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("ProductGroup");
    expect(ld.brand).toEqual({ "@type": "Brand", name: "KR8MX" });
    expect(ld.productGroupID).toBe("K8D-GRP");
  });

  it("variesBy flavor and size", () => {
    expect(ld.variesBy).toContain("https://schema.org/flavor");
    expect(ld.variesBy).toContain("https://schema.org/size");
  });

  it("has one Product variant per pack with a priced Offer", () => {
    expect(ld.hasVariant).toHaveLength(getDrinkVariants("grape").length);
    for (const v of ld.hasVariant) {
      expect(v["@type"]).toBe("Product");
      expect(v.sku).toMatch(/^K8D-GRP-(06|12|24)$/);
      expect(v.offers["@type"]).toBe("Offer");
      expect(v.offers.priceCurrency).toBe("USD");
      expect(v.offers.price).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it("omits any consumption / medical / nutrition properties", () => {
    const serialized = JSON.stringify(buildDrinkProductGroupJsonLd("lemon"));
    for (const banned of [
      "nutrition",
      "NutritionInformation",
      "drug",
      "MedicalEntity",
      "dosage",
      "activeIngredient",
      "healthCondition",
    ]) {
      expect(serialized.toLowerCase()).not.toContain(banned.toLowerCase());
    }
  });

  it("builds for every flavor without throwing", () => {
    for (const f of DRINK_FLAVORS) {
      expect(() => buildDrinkProductGroupJsonLd(f)).not.toThrow();
    }
  });
});
