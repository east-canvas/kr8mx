/**
 * 21+ age gate — cookie contract.
 *
 * The gate is confirmation-only: the cookie is set solely by an explicit "I am
 * 21 or older" action and persists for 30 days. Reading is safe on both server
 * (via next/headers) and client (document.cookie).
 */
export const AGE_GATE_COOKIE = "kr8mx_age_confirmed";
export const AGE_GATE_VALUE = "1";
export const AGE_GATE_MAX_AGE_DAYS = 30;
export const AGE_GATE_MAX_AGE_SECONDS = AGE_GATE_MAX_AGE_DAYS * 24 * 60 * 60;

/** Is the given cookie value a valid confirmation? */
export function isAgeConfirmedValue(value: string | undefined | null): boolean {
  return value === AGE_GATE_VALUE;
}

/** Client-only: read the confirmation cookie from document.cookie. */
export function readAgeCookie(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AGE_GATE_COOKIE}=`));
  return isAgeConfirmedValue(match?.split("=")[1]);
}

/** Client-only: persist confirmation for 30 days. */
export function writeAgeCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie =
    `${AGE_GATE_COOKIE}=${AGE_GATE_VALUE}; ` +
    `path=/; max-age=${AGE_GATE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
