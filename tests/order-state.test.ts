import { describe, it, expect } from "vitest";
import {
  ORDER_STATUSES,
  ORDER_TRANSITIONS,
  canTransition,
  assertTransition,
  isTerminal,
} from "@/db/order-state";
import type { OrderStatus } from "@/db/schema";

describe("order state machine", () => {
  it("covers all 8 statuses", () => {
    expect(ORDER_STATUSES).toHaveLength(8);
  });

  it("permits the canonical happy path", () => {
    const happy: OrderStatus[] = [
      "pending",
      "awaiting_payment",
      "paid",
      "processing",
      "shipped",
      "delivered",
    ];
    for (let i = 0; i < happy.length - 1; i++) {
      expect(canTransition(happy[i], happy[i + 1])).toBe(true);
    }
  });

  it("treats delivered, cancelled, refunded as terminal", () => {
    expect(isTerminal("delivered")).toBe(false); // delivered -> refunded is allowed
    expect(isTerminal("cancelled")).toBe(true);
    expect(isTerminal("refunded")).toBe(true);
    expect(ORDER_TRANSITIONS.cancelled).toHaveLength(0);
    expect(ORDER_TRANSITIONS.refunded).toHaveLength(0);
  });

  it("rejects illegal jumps", () => {
    expect(canTransition("pending", "shipped")).toBe(false);
    expect(canTransition("pending", "delivered")).toBe(false);
    expect(canTransition("delivered", "shipped")).toBe(false);
    expect(canTransition("cancelled", "paid")).toBe(false);
    expect(canTransition("refunded", "processing")).toBe(false);
  });

  it("allows cancellation before shipment but not after delivery", () => {
    expect(canTransition("pending", "cancelled")).toBe(true);
    expect(canTransition("awaiting_payment", "cancelled")).toBe(true);
    expect(canTransition("paid", "cancelled")).toBe(true);
    expect(canTransition("processing", "cancelled")).toBe(true);
    expect(canTransition("shipped", "cancelled")).toBe(false);
    expect(canTransition("delivered", "cancelled")).toBe(false);
  });

  it("allows refunds from paid through delivered", () => {
    expect(canTransition("paid", "refunded")).toBe(true);
    expect(canTransition("processing", "refunded")).toBe(true);
    expect(canTransition("shipped", "refunded")).toBe(true);
    expect(canTransition("delivered", "refunded")).toBe(true);
    // but not before money changes hands
    expect(canTransition("pending", "refunded")).toBe(false);
    expect(canTransition("awaiting_payment", "refunded")).toBe(false);
  });

  it("never lists a status as its own successor", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_TRANSITIONS[status]).not.toContain(status);
    }
  });

  it("only references valid statuses as targets", () => {
    const valid = new Set(ORDER_STATUSES);
    for (const targets of Object.values(ORDER_TRANSITIONS)) {
      for (const t of targets) expect(valid.has(t)).toBe(true);
    }
  });

  it("assertTransition throws on illegal edges", () => {
    expect(() => assertTransition("pending", "awaiting_payment")).not.toThrow();
    expect(() => assertTransition("pending", "delivered")).toThrow(
      /Illegal order transition/,
    );
  });
});
