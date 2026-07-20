import "server-only";
import QRCode from "qrcode";

/** Base URL for encoded barcodes — override per-env if needed. */
export function siteBaseUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://kr8mx.com";
}

/** Full scan URL for a dynamic-link code. */
export function scanUrl(code: string): string {
  return `${siteBaseUrl()}/q/${code}`;
}

/** Render a QR code as an inline SVG string (crisp at any print size). */
export async function generateQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#0b0b0d", light: "#00000000" },
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
