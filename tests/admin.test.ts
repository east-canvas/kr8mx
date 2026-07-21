import { describe, it, expect } from "vitest";
import { adminGuard } from "@/lib/admin/middleware-guard";
import { notifyListToCsv } from "@/lib/admin/csv";
import { canTransition } from "@/db/order-state";

describe("admin middleware guard", () => {
  it("blocks unauthenticated /admin/* (redirect) and /api/admin (401)", () => {
    expect(adminGuard("/admin/orders", false)).toBe("redirect");
    expect(adminGuard("/admin/notify/export", false)).toBe("redirect");
    expect(adminGuard("/api/admin/x", false)).toBe("unauthorized");
  });

  it("allows the /admin login page and authenticated access", () => {
    expect(adminGuard("/admin", false)).toBe("allow"); // login page itself
    expect(adminGuard("/admin/orders", true)).toBe("allow");
    expect(adminGuard("/api/admin/x", true)).toBe("allow");
  });

  it("ignores non-admin paths", () => {
    expect(adminGuard("/drinks", false)).toBe("allow");
    expect(adminGuard("/", false)).toBe("allow");
  });
});

describe("notify CSV export shape", () => {
  it("emits a header + one row per entry, RFC-4180 quoted", () => {
    const csv = notifyListToCsv([
      {
        email: "a@kr8mx.com",
        variantId: 3,
        subscribed: true,
        createdAt: "2026-05-01T00:00:00.000Z",
      },
      {
        email: 'weird,"quote"@x.com',
        variantId: null,
        subscribed: false,
        createdAt: "2026-05-02T00:00:00.000Z",
      },
    ]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("email,variant_id,subscribed,created_at");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe("a@kr8mx.com,3,true,2026-05-01T00:00:00.000Z");
    // quoted field with embedded comma + doubled quotes
    expect(lines[2]).toContain('"weird,""quote""@x.com"');
    expect(lines[2]).toContain(",,false,"); // null variant -> empty
  });
});

describe("admin order transition guard", () => {
  it("rejects illegal transitions (server-side via the state machine)", () => {
    // the admin action calls canTransition before writing; these are the edges
    // it must refuse:
    expect(canTransition("delivered", "shipped")).toBe(false);
    expect(canTransition("cancelled", "paid")).toBe(false);
    expect(canTransition("pending", "shipped")).toBe(false);
  });

  it("permits the valid ops path processing -> shipped", () => {
    expect(canTransition("processing", "shipped")).toBe(true);
  });
});
