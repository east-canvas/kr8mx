import { describe, it, expect } from "vitest";
import {
  toCents,
  sumCents,
  lineTotalCents,
  formatCents,
} from "@/db/money";

describe("money (integer cents)", () => {
  it("converts dollars to cents without float drift", () => {
    expect(toCents(12.99)).toBe(1299);
    expect(toCents(0.1)).toBe(10);
    expect(toCents(0.2)).toBe(20);
    // the classic 0.1 + 0.2 float trap, done in cent space
    expect(toCents(0.1) + toCents(0.2)).toBe(30);
  });

  it("sums cent amounts exactly", () => {
    expect(sumCents([1799, 2999, 5499])).toBe(10297);
    expect(sumCents([])).toBe(0);
  });

  it("computes line totals as unit x quantity", () => {
    expect(lineTotalCents(1499, 3)).toBe(4497);
    expect(lineTotalCents(2499, 0)).toBe(0);
  });

  it("rejects non-integer cents", () => {
    expect(() => sumCents([10.5])).toThrow();
    expect(() => lineTotalCents(9.99, 2)).toThrow();
  });

  it("rejects negative or non-integer quantities", () => {
    expect(() => lineTotalCents(100, -1)).toThrow();
    expect(() => lineTotalCents(100, 1.5)).toThrow();
  });

  it("formats cents as USD only at the display boundary", () => {
    expect(formatCents(1299)).toBe("$12.99");
    expect(formatCents(5499)).toBe("$54.99");
    expect(formatCents(0)).toBe("$0.00");
  });
});
