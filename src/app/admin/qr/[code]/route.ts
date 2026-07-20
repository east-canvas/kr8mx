import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { getDynamicLink } from "@/db/queries";
import { generateQrDownloadSvg, generateQrPng } from "@/lib/admin/qr";

/**
 * Downloadable QR for a barcode. Admin-only. The QR encodes the link's
 * destination URL directly (exactly what was entered), so a scan goes straight
 * there — no redirect hop.
 *   /admin/qr/{code}?fmt=svg           → vector SVG (scales to any print size)
 *   /admin/qr/{code}?fmt=png&size=2048 → high-resolution PNG
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) {
    return new Response("Not authorized", { status: 401 });
  }

  const { code } = await params;
  const link = await getDynamicLink(code);
  if (!link) {
    return new Response("Not found", { status: 404 });
  }
  const target = link.targetUrl;

  const { searchParams } = new URL(req.url);
  const fmt = (searchParams.get("fmt") ?? "png").toLowerCase();

  if (fmt === "svg") {
    const svg = await generateQrDownloadSvg(target);
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="kr8mx-qr-${code}.svg"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const parsed = Number(searchParams.get("size") ?? "1024");
  const size = Number.isFinite(parsed) ? Math.round(parsed) : 1024;
  const png = await generateQrPng(target, size);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="kr8mx-qr-${code}-${size}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
