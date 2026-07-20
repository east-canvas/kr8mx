import type { ProductCategory } from "@/db/schema";

/* =============================================================================
   Shipping restrictions — category x destination-state gating.

   ⚠️  TODO-VERIFY — LEGAL:
   The state map below is a PLACEHOLDER and MUST be confirmed with counsel before
   launch. KR8MX products contain a kratom-derived proprietary ingredient
   (MitraGen+); the set of states/localities restricting sale or shipment changes
   over time and by product form. Treat this as DATA that is edited to change
   availability — NOT something that requires a code deploy. At runtime the
   authoritative source is the `shipping_restrictions` table (category x state),
   which is seeded from this map and can be updated live. Keep this map and the
   table in sync, and update BOTH from a verified, counsel-approved source.
   ============================================================================= */

export type RestrictionResult = {
  allowed: boolean;
  reason: string | null;
};

type RestrictionRow = {
  state: string; // USPS 2-letter code
  reason: string;
};

/**
 * States where shipment is currently blocked, per category. PLACEHOLDER data —
 * see the TODO-VERIFY note above. Any state not listed defaults to allowed.
 */
export const RESTRICTED_STATES: Record<ProductCategory, RestrictionRow[]> = {
  // TODO-VERIFY: confirm each entry with counsel; add/remove as law changes.
  drinks: [
    { state: "AL", reason: "Not available for shipment to this state." },
    { state: "AR", reason: "Not available for shipment to this state." },
    { state: "IN", reason: "Not available for shipment to this state." },
    { state: "RI", reason: "Not available for shipment to this state." },
    { state: "VT", reason: "Not available for shipment to this state." },
    { state: "WI", reason: "Not available for shipment to this state." },
  ],
  tablets: [
    { state: "AL", reason: "Not available for shipment to this state." },
    { state: "AR", reason: "Not available for shipment to this state." },
    { state: "IN", reason: "Not available for shipment to this state." },
    { state: "RI", reason: "Not available for shipment to this state." },
    { state: "VT", reason: "Not available for shipment to this state." },
    { state: "WI", reason: "Not available for shipment to this state." },
  ],
};

function normalizeState(state: string): string {
  return state.trim().toUpperCase();
}

/**
 * Given a product category and destination state, return whether shipment is
 * allowed and, if not, a customer-facing reason.
 *
 * NOTE: this consults the static placeholder map. The runtime storefront should
 * prefer the `shipping_restrictions` DB table (same shape) so availability can
 * be changed as data without a deploy; this function is the fallback + seed
 * source and the unit under test.
 */
export function checkShipping(
  category: ProductCategory,
  state: string,
): RestrictionResult {
  const code = normalizeState(state);
  const restricted = RESTRICTED_STATES[category]?.find((r) => r.state === code);
  if (restricted) {
    return { allowed: false, reason: restricted.reason };
  }
  return { allowed: true, reason: null };
}

/** Sorted list of restricted state codes for a category (footer availability). */
export function restrictedStatesFor(category: ProductCategory): string[] {
  return RESTRICTED_STATES[category].map((r) => r.state).sort();
}

/** Union of restricted states across all categories (site-wide availability). */
export function allRestrictedStates(): string[] {
  const set = new Set<string>();
  for (const rows of Object.values(RESTRICTED_STATES)) {
    for (const r of rows) set.add(r.state);
  }
  return [...set].sort();
}

/** Seed rows for the shipping_restrictions table (category x state, blocked). */
export function buildShippingRestrictionRows(): Array<{
  category: ProductCategory;
  state: string;
  allowed: boolean;
  reason: string;
}> {
  const rows: Array<{
    category: ProductCategory;
    state: string;
    allowed: boolean;
    reason: string;
  }> = [];
  for (const category of Object.keys(RESTRICTED_STATES) as ProductCategory[]) {
    for (const r of RESTRICTED_STATES[category]) {
      rows.push({ category, state: r.state, allowed: false, reason: r.reason });
    }
  }
  return rows;
}
