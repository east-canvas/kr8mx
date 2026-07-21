import { NextResponse, type NextRequest } from "next/server";

/**
 * Barcode compatibility net.
 *
 * A batch of labels may have been printed while a misconfigured
 * NEXT_PUBLIC_SITE_URL produced a malformed scan URL like
 *   https://www.kr8mx.com/coa/tablets/q/tabletscoa
 * instead of the canonical /q/tabletscoa. Any path that ends in `/q/{code}` but
 * has an extra prefix is normalized here to `/q/{code}`, where the dynamic
 * resolver looks up the code and 302s to its current target. This guarantees
 * every already-printed variant resolves, and keeps future codes re-pointable.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // prefix + /q/{code}, e.g. /coa/tablets/q/tabletscoa  (NOT the bare /q/{code})
  const match = pathname.match(/^\/.+\/q\/([^/]+)\/?$/);
  if (match) {
    const url = req.nextUrl.clone();
    url.pathname = `/q/${match[1]}`;
    url.search = search;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  // Only run where a stray /q/{code} could appear; skip assets, api, admin.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|admin/).*)"],
};
