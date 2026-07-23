/**
 * Money is always integer cents. These helpers keep arithmetic in integer space
 * and only format to a decimal string at the display boundary, never store or
 * compute money as a float.
 */

export type Cents = number;

function assertInt(cents: Cents, label = "cents"): void {
  if (!Number.isInteger(cents)) {
    throw new Error(`${label} must be an integer, got ${cents}`);
  }
}

/** Convert a whole-dollar + cents amount to integer cents. */
export function toCents(dollars: number, cents = 0): Cents {
  assertInt(cents, "cents");
  return Math.round(dollars * 100) + cents;
}

/** Sum a list of cent amounts. */
export function sumCents(amounts: Cents[]): Cents {
  return amounts.reduce((acc, n) => {
    assertInt(n);
    return acc + n;
  }, 0);
}

/** Line total = unit price x quantity, in cents. */
export function lineTotalCents(unitPriceCents: Cents, quantity: number): Cents {
  assertInt(unitPriceCents, "unitPriceCents");
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`quantity must be a non-negative integer, got ${quantity}`);
  }
  return unitPriceCents * quantity;
}

/** Format integer cents as a USD string, e.g. 1299 -> "$12.99". */
export function formatCents(
  cents: Cents,
  { currency = "USD", locale = "en-US" }: { currency?: string; locale?: string } = {},
): string {
  assertInt(cents);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}
