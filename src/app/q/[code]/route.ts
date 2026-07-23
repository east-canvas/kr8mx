import { NextResponse, type NextRequest } from "next/server";
import { getDynamicLink, incrementScanCount } from "@/db/queries";

/**
 * Dynamic barcode resolver. A QR on packaging encodes /q/{code}; this looks up
 * the link's current target and 302-redirects. The code is permanent, the
 * target is editable in the admin, so a printed barcode is re-pointable without
 * a reprint. Unknown/inactive codes fall back to the COA index.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const link = await getDynamicLink(code);

  if (!link || !link.active) {
    return NextResponse.redirect(new URL("/coa", req.url), 302);
  }

  await incrementScanCount(code);

  const dest = /^https?:\/\//i.test(link.targetUrl)
    ? link.targetUrl
    : new URL(link.targetUrl, req.url).toString();

  return NextResponse.redirect(dest, 302);
}
