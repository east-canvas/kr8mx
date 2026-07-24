import { describe, it, expect } from "vitest";
import {
  salesCatalog,
  salesSku,
  bottlesPerUnit,
  generateSalesOrderNumber,
  CASE_BOTTLES,
  SALES_BRANDS,
  SALES_FLAVORS,
} from "@/lib/sales/catalog";
import { orderItemsToCsv, orderToPlainText, ordersToCsv } from "@/lib/sales/format";
import type { SalesOrder, SalesOrderItem, SalesRep } from "@/db/schema";

describe("sales catalog", () => {
  it("has one SKU per brand x flavor (10 total), all unique", () => {
    const cat = salesCatalog();
    expect(cat).toHaveLength(SALES_BRANDS.length * SALES_FLAVORS.length);
    expect(new Set(cat.map((p) => p.sku)).size).toBe(cat.length);
  });

  it("builds stable SKUs", () => {
    expect(salesSku("KR8MX", "Grape")).toBe("K8-TAB-GRP");
    expect(salesSku("Sigma 7", "Blue Razz")).toBe("S7-TAB-BLZ");
  });

  it("cases carry 200 bottles, bottles carry 1", () => {
    expect(bottlesPerUnit("case")).toBe(CASE_BOTTLES);
    expect(bottlesPerUnit("bottle")).toBe(1);
  });

  it("order numbers follow SO-YYMMDD-XXXXX", () => {
    const n = generateSalesOrderNumber(new Date(Date.UTC(2026, 7, 3)));
    expect(n).toMatch(/^SO-260803-[0-9A-HJKMNP-TV-Z]{5}$/);
  });
});

function makeItem(over: Partial<SalesOrderItem>): SalesOrderItem {
  return {
    id: 1, orderId: 1, brand: "KR8MX", flavor: "Grape", sku: "K8-TAB-GRP",
    unit: "case", bottlesPerUnit: 200, quantity: 2, bottles: 400,
    unitPriceCents: 0, lineTotalCents: 0, ...over,
  };
}
function makeOrder(over: Partial<SalesOrder>): SalesOrder {
  return {
    id: 1, orderNumber: "SO-260803-ABCDE", repId: 1, status: "new",
    company: "Acme Distributors", contactName: "Jamie", email: "j@acme.com",
    phone: null, shipAddress: null, shipCity: "Miami", shipState: "FL",
    shipZip: null, notes: null, subtotalCents: 0, totalBottles: 400,
    createdAt: new Date("2026-08-03T00:00:00Z"),
    updatedAt: new Date("2026-08-03T00:00:00Z"), ...over,
  };
}

describe("sales export format", () => {
  it("emits a header + one CSV row per item", () => {
    const csv = orderItemsToCsv([makeItem({}), makeItem({ id: 2, flavor: "Lemon" })]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("sku,brand,flavor,unit,quantity,bottles,unit_price,line_total");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("K8-TAB-GRP");
  });

  it("quotes CSV fields containing commas", () => {
    const csv = ordersToCsv([makeOrder({ company: "Acme, Inc." })]);
    expect(csv).toContain('"Acme, Inc."');
  });

  it("renders a readable plaintext summary with case math", () => {
    const txt = orderToPlainText(
      makeOrder({ totalBottles: 400, subtotalCents: 120000 }),
      { id: 1, name: "AJ", email: null, phone: null, code: "AJ", active: true, createdAt: new Date() } as SalesRep,
      [makeItem({ quantity: 2, bottles: 400, unitPriceCents: 60000, lineTotalCents: 120000 })],
    );
    expect(txt).toContain("ORDER SO-260803-ABCDE");
    expect(txt).toContain("Acme Distributors");
    expect(txt).toContain("AJ");
    expect(txt).toContain("400 bottles");
    expect(txt).toContain("2 cases");
  });
});
