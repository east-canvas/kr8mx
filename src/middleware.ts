import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin/constants";
import { adminGuard } from "@/lib/admin/middleware-guard";

/**
 * Edge middleware:
 *  1. Barcode compatibility, normalize any `…/q/{code}` (incl. a malformed
 *     prefixed variant that may have been printed) to the canonical /q/{code}.
 *  2. Admin gate, presence-check bounce for /admin and /api/admin. The
 *     authoritative auth check runs server-side (node crypto isn't available
 *     in edge middleware).
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) barcode URL normalization (prefix + /q/{code} -> /q/{code})
  const match = pathname.match(/^\/.+\/q\/([^/]+)\/?$/);
  if (match) {
    const url = req.nextUrl.clone();
    url.pathname = `/q/${match[1]}`;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  // 2) admin gate
  const hasAdminCookie = !!req.cookies.get(ADMIN_COOKIE);
  const decision = adminGuard(pathname, hasAdminCookie);
  if (decision === "unauthorized") {
    return new NextResponse("Not authorized", { status: 401 });
  }
  if (decision === "redirect") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
