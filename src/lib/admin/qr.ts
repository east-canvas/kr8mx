import "server-only";
import QRCode from "qrcode";

/**
 * Canonical site origin used to build barcode scan URLs. Hardened: we take only
 * the ORIGIN of NEXT_PUBLIC_SITE_URL (so a stray path in that env var can never
 * corrupt the QR again), and fall back to the production domain.
 */
export function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* ignore malformed env */
    }
  }
  return "https://www.kr8mx.com";
}

/**
 * Permanent scan URL a barcode encodes: {origin}/q/{code}. The code never
 * changes, so a printed QR is re-pointable — the /q resolver 302s to the link's
 * current target.
 */
export function scanUrl(code: string): string {
  return `${siteOrigin()}/q/${code}`;
}

/** Render a QR code as an inline SVG string (transparent — for the admin preview). */
export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0b0d", light: "#00000000" },
  });
}

/**
 * Print-ready SVG: opaque white background, obsidian modules, a full quiet zone,
 * and higher error correction so it scans reliably at any size / on any surface.
 */
export async function generateQrDownloadSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 4,
    errorCorrectionLevel: "Q",
    color: { dark: "#0b0b0d", light: "#ffffff" },
  });
}

/** High-resolution PNG buffer (default 1024px, clamped 256–4096). */
export async function generateQrPng(
  text: string,
  size = 1024,
): Promise<Buffer> {
  const width = Math.min(4096, Math.max(256, Math.round(size)));
  return QRCode.toBuffer(text, {
    type: "png",
    width,
    margin: 4,
    errorCorrectionLevel: "Q",
    color: { dark: "#0b0b0d", light: "#ffffff" },
  });
}

/** Short random code for a new dynamic link (URL-safe, unambiguous). */
export function generateLinkCode(seed: string): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const hash = [...seed].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  let n = hash;
  let out = "";
  for (let i = 0; i < 7; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) + (i + 1) * 7;
  }
  return out;
}
