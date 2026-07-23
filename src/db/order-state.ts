import type { OrderStatus } from "./schema";

/**
 * Order lifecycle state machine.
 *
 * Allowed transitions are declared here as the single source of truth; the DB
 * enum guards the domain of values, this map guards the *edges*. Terminal
 * states (delivered, cancelled, refunded) have no outgoing transitions.
 */
export const ORDER_STATUSES: readonly OrderStatus[] = [
  "pending",
  "awaiting_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["paid", "cancelled"],
  paid: ["processing", "refunded", "cancelled"],
  processing: ["shipped", "refunded", "cancelled"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

/** Terminal states cannot transition further (refunded is terminal). */
export const TERMINAL_STATUSES: readonly OrderStatus[] = [
  "delivered",
  "cancelled",
  "refunded",
].filter((s) => ORDER_TRANSITIONS[s as OrderStatus].length === 0) as OrderStatus[];

/** Is a direct transition from -> to permitted? */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Throwing variant, use in write paths so illegal transitions never persist. */
export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal order transition: ${from} -> ${to}`);
  }
}

/** Does this status have any outgoing transitions? */
export function isTerminal(status: OrderStatus): boolean {
  return ORDER_TRANSITIONS[status].length === 0;
}
