/**
 * Pure admin route guard used by middleware. Presence-only (edge middleware
 * can't run the node-crypto hash check) — the AUTHORITATIVE validation is
 * server-side in the admin layout / server actions / route handlers via
 * isAuthed(). This is defense-in-depth + UX bounce.
 */
export type GuardDecision = "allow" | "redirect" | "unauthorized";

export function adminGuard(
  pathname: string,
  hasAdminCookie: boolean,
): GuardDecision {
  const isApiAdmin =
    pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  // deeper than the /admin login page itself
  const isAdminDeep = pathname.startsWith("/admin/");

  if (isApiAdmin && !hasAdminCookie) return "unauthorized";
  if (isAdminDeep && !hasAdminCookie) return "redirect";
  return "allow";
}
