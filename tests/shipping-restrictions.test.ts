import { describe, it, expect } from "vitest";
import {
  checkShipping,
  restrictedStatesFor,
  allRestrictedStates,
  buildShippingRestrictionRows,
  RESTRICTED_STATES,
} from "@/lib/compliance/shipping-restrictions";

describe("shipping restrictions lookup", () => {
  it("blocks a restricted state and returns a reason", () => {
    const res = checkShipping("tablets", "AL");
    expect(res.allowed).toBe(false);
    expect(res.reason).toBeTruthy();
  });

  it("allows an unrestricted state with no reason", () => {
    const res = checkShipping("drinks", "CA");
    expect(res.allowed).toBe(true);
    expect(res.reason).toBeNull();
  });

  it("normalizes state input (case / whitespace)", () => {
    expect(checkShipping("drinks", "al").allowed).toBe(false);
    expect(checkShipping("drinks", " AL ").allowed).toBe(false);
  });

  it("is category-aware", () => {
    // both categories currently restrict the same placeholder set
    for (const state of restrictedStatesFor("drinks")) {
      expect(checkShipping("drinks", state).allowed).toBe(false);
    }
  });

  it("exposes a sorted union of restricted states", () => {
    const all = allRestrictedStates();
    expect(all).toEqual([...all].sort());
    expect(all).toContain("AL");
    expect(new Set(all).size).toBe(all.length);
  });

  it("builds one seed row per (category, state) all blocked", () => {
    const rows = buildShippingRestrictionRows();
    const expected =
      RESTRICTED_STATES.drinks.length + RESTRICTED_STATES.tablets.length;
    expect(rows).toHaveLength(expected);
    expect(rows.every((r) => r.allowed === false && r.reason)).toBe(true);
  });
});
