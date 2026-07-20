import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import {
  scanUrl,
  generateQrDownloadSvg,
  generateQrPng,
} from "@/lib/admin/qr";

/**
 * Downloadable QR for a dynamic-link code. Admin-only.
 *   /admin/qr/{code}?fmt=svg           → vector SVG (scales to any print size)
 *   /admin/qr/{code}?fmt=png&size=2048 → high-resolution PNG
 * The QR encodes the permanent /q/{code} scan URL, so downloaded art keeps
 * working even after the link's target is re-pointed.
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
  const { searchParams } = new URL(req.url);
  const fmt = (searchParams.get("fmt") ?? "png").toLowerCase();
  const target = scanUrl(code);

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
