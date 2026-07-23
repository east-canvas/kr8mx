import "server-only";
import { createHash } from "node:crypto";

/**
 * Minimal admin auth for the KR8MX admin console. A single shared password
 * is provided via the ADMIN_PASSWORD env var (the only extra secret this app
 * needs beyond DATABASE_URL). The session cookie stores a hash of the password,
 * never the password itself, a valid cookie requires having known it.
 *
 * If ADMIN_PASSWORD is unset the admin is locked (secure by default).
 */
export { ADMIN_COOKIE, ADMIN_SESSION_MAX_AGE } from "./constants";

function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}

export function adminConfigured(): boolean {
  return !!adminPassword();
}

/** Opaque session token derived from the configured password. */
export function sessionToken(): string {
  const pw = adminPassword() ?? "";
  return createHash("sha256").update(`nbg:${pw}`).digest("hex");
}

export function verifyPassword(input: string): boolean {
  const pw = adminPassword();
  if (!pw) return false;
  // length-guarded equality
  return input.length === pw.length && input === pw;
}

export function isAuthed(cookieValue: string | undefined): boolean {
  if (!adminConfigured()) return false;
  return cookieValue === sessionToken();
}
