// Edge-safe admin constants (no node:crypto / server-only), so middleware can
// import them without pulling in the server-only auth module.
export const ADMIN_COOKIE = "nbg_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours
