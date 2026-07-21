/**
 * Human-friendly order number: K8-{YYMMDD}-{6 base32 chars}.
 * The random suffix keeps it unguessable enough for order-lookup URLs.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford-ish, no I/L/O/U

export function generateOrderNumber(now: Date = new Date()): string {
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `K8-${yy}${mm}${dd}-${suffix}`;
}

export const ORDER_NUMBER_RE = /^K8-\d{6}-[0-9A-HJKMNP-TV-Z]{6}$/;
