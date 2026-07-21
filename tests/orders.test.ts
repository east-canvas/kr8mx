import { describe, it, expect } from "vitest";
import {
  resolveVariantBySku,
  computeTotals,
  type PricedLine,
} from "@/lib/orders/pricing";
import { buildOrderDraft } from "@/lib/orders/build-order";
import {
  generateOrderNumber,
  ORDER_NUMBER_RE,
} from "@/lib/orders/order-number";

describe("order pricing (server-side, untrusted cart)", () => {
  it("resolves a drink SKU to its catalog price + name", () => {
    const v = resolveVariantBySku("K8D-GRP-06");
    expect(v).not.toBeNull();
    expect(v!.category).toBe("drinks");
    expect(v!.status).toBe("active");
    expect(v!.priceCents).toBe(1799);
    expect(v!.name).toContain("Grape");
  });

  it("marks tablet SKUs as coming_soon (not purchasable)", () => {
    const v = resolveVariantBySku("KR8-T100-10-LEM");
    expect(v!.category).toBe("tablets");
    expect(v!.status).toBe("coming_soon");
  });

  it("returns null for an unknown SKU", () => {
    expect(resolveVariantBySku("NOPE-1")).toBeNull();
  });

  it("computes totals in integer cents (placeholder shipping/tax)", () => {
    const lines: PricedLine[] = [
      {
        sku: "K8D-GRP-06",
        name: "x",
        category: "drinks",
        quantity: 2,
        unitPriceCents: 1799,
        lineTotalCents: 3598,
      },
    ];
    const t = computeTotals(lines);
    expect(t.subtotalCents).toBe(3598);
    expect(t.shippingCents).toBe(699); // under $50
    expect(t.taxCents).toBe(0);
    expect(t.totalCents).toBe(4297);
  });

  it("free shipping over $50", () => {
    const lines: PricedLine[] = [
      {
        sku: "K8D-GRP-24",
        name: "x",
        category: "drinks",
        quantity: 1,
        unitPriceCents: 5499,
        lineTotalCents: 5499,
      },
    ];
    expect(computeTotals(lines).shippingCents).toBe(0);
  });
});

describe("buildOrderDraft — validation + restrictions", () => {
  it("prices a valid drink order and ignores client prices", () => {
    const d = buildOrderDraft({
      items: [{ sku: "K8D-STR-12", quantity: 3 }],
      state: "CA",
    });
    expect(d.ok).toBe(true);
    if (d.ok) {
      expect(d.lines[0].unitPriceCents).toBe(2999);
      expect(d.lines[0].lineTotalCents).toBe(8997);
    }
  });

  it("blocks shipment to a restricted state", () => {
    const d = buildOrderDraft({
      items: [{ sku: "K8D-STR-12", quantity: 1 }],
      state: "AL",
    });
    expect(d.ok).toBe(false);
    if (!d.ok) expect(d.error).toMatch(/not available/i);
  });

  it("rejects coming_soon (tablet) items", () => {
    const d = buildOrderDraft({
      items: [{ sku: "KR8-T100-10-LEM", quantity: 1 }],
      state: "CA",
    });
    expect(d.ok).toBe(false);
  });

  it("rejects bad quantities and empty carts", () => {
    expect(buildOrderDraft({ items: [], state: "CA" }).ok).toBe(false);
    expect(
      buildOrderDraft({ items: [{ sku: "K8D-STR-12", quantity: 0 }], state: "CA" }).ok,
    ).toBe(false);
    expect(
      buildOrderDraft({ items: [{ sku: "K8D-STR-12", quantity: 200 }], state: "CA" })
        .ok,
    ).toBe(false);
  });
});

describe("order number", () => {
  it("matches the K8-YYMMDD-XXXXXX format", () => {
    for (let i = 0; i < 25; i++) {
      expect(generateOrderNumber()).toMatch(ORDER_NUMBER_RE);
    }
  });

  it("is reasonably unique", () => {
    const set = new Set(Array.from({ length: 200 }, () => generateOrderNumber()));
    expect(set.size).toBeGreaterThan(190);
  });
});
