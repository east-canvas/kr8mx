import "server-only";
import type { RenderedEmail } from "./types";
import type { Order, OrderItem } from "@/db/schema";
import { formatCents } from "@/db/money";
import { resolveBaseUrl } from "@/lib/seo";
import {
  FDA_DISCLAIMER,
  AGE_NOTICE,
  OPERATOR_LINE,
  MAILING_ADDRESS,
} from "@/lib/compliance/disclaimers";

/* HTML-string email templates (email clients strip <style>/classes, so styling
   is inline). Two brand themes from the token palette. Compliance strings are
   imported (never inline literals) so the claim-denylist guard passes. */

type Theme = "precision" | "performance";
const THEME = {
  precision: {
    bg: "#fafbfc",
    text: "#1e2528",
    muted: "#8b969d",
    hairline: "#dde3e8",
    accent: "#1e2528",
    accentText: "#ffffff",
    wordmark: "kr8mx-wordmark-black.png",
  },
  performance: {
    bg: "#0b0b0d",
    text: "#e5e7ea",
    muted: "#6c6f73",
    hairline: "#2a2a2e",
    accent: "#c6ff00",
    accentText: "#0b0b0d",
    wordmark: "kr8mx-wordmark-white.png",
  },
} as const;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function layout(theme: Theme, inner: string, unsubscribeUrl?: string): string {
  const t = THEME[theme];
  const base = resolveBaseUrl();
  const unsub = unsubscribeUrl
    ? `<br/><a href="${unsubscribeUrl}" style="color:${t.muted}">Unsubscribe</a>`
    : "";
  return (
    `<!doctype html><html><body style="margin:0">` +
    `<div style="background:${t.bg};color:${t.text};font-family:Arial,Helvetica,sans-serif;padding:32px 0;margin:0">` +
    `<div style="max-width:560px;margin:0 auto;padding:0 24px">` +
    `<img src="${base}/brand/${t.wordmark}" alt="KR8MX" height="22" style="height:22px;display:block"/>` +
    `<div style="border-top:1px solid ${t.hairline};margin:20px 0 24px"></div>` +
    inner +
    `<div style="border-top:1px solid ${t.hairline};margin:28px 0 16px"></div>` +
    `<p style="font-size:11px;line-height:1.6;color:${t.muted};margin:0">` +
    `${AGE_NOTICE}<br/>${FDA_DISCLAIMER}<br/>${OPERATOR_LINE}<br/>${MAILING_ADDRESS}${unsub}</p>` +
    `</div></div></body></html>`
  );
}

function kicker(theme: Theme, s: string): string {
  return `<p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${THEME[theme].muted};margin:0 0 8px">${esc(s)}</p>`;
}
function h1(theme: Theme, s: string): string {
  return `<h1 style="font-size:26px;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;color:${THEME[theme].text};margin:0 0 12px">${esc(s)}</h1>`;
}
function cta(theme: Theme, label: string, url: string): string {
  const t = THEME[theme];
  return `<a href="${url}" style="display:inline-block;background:${t.accent};color:${t.accentText};font-size:12px;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;padding:12px 22px;border-radius:3px">${esc(label)}</a>`;
}

function itemsTable(theme: Theme, items: OrderItem[]): string {
  const t = THEME[theme];
  const rows = items
    .map(
      (i) =>
        `<tr style="border-bottom:1px solid ${t.hairline}">` +
        `<td style="padding:10px 0;font-size:14px;color:${t.text}">${esc(i.nameSnapshot)} <span style="color:${t.muted}">&times; ${i.quantity}</span></td>` +
        `<td style="padding:10px 0;font-size:14px;color:${t.text};text-align:right">${formatCents(i.lineTotalCents)}</td>` +
        `</tr>`,
    )
    .join("");
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0"><tbody>${rows}</tbody></table>`;
}

function totals(theme: Theme, order: Order): string {
  const t = THEME[theme];
  const row = (label: string, value: string, bold = false) =>
    `<tr><td style="font-size:13px;color:${t.muted};padding:3px 0">${label}</td>` +
    `<td style="font-size:${bold ? "16px" : "13px"};font-weight:${bold ? 700 : 400};color:${t.text};text-align:right;padding:3px 0">${value}</td></tr>`;
  return (
    `<table style="width:100%;margin-top:8px"><tbody>` +
    row("Subtotal", formatCents(order.subtotalCents)) +
    row("Shipping", formatCents(order.shippingCents)) +
    row("Tax", formatCents(order.taxCents)) +
    row("Total", formatCents(order.totalCents), true) +
    `</tbody></table>`
  );
}

/* ------------------------------------------------------------ templates --- */

export function orderConfirmationEmail(
  order: Order,
  items: OrderItem[],
): RenderedEmail {
  const th: Theme = "precision";
  const inner =
    kicker(th, "Order Confirmed") +
    h1(th, "Thank you.") +
    `<p style="font-size:14px;color:${THEME[th].muted};margin:0 0 16px">Order ${esc(order.orderNumber)} &middot; ships to ${esc(order.shipState ?? "")}</p>` +
    itemsTable(th, items) +
    totals(th, order);
  return { subject: `Order ${order.orderNumber} confirmed`, html: layout(th, inner) };
}

export function shippingNotificationEmail(
  order: Order,
  items: OrderItem[],
  tracking: { number?: string; carrier?: string; url?: string },
): RenderedEmail {
  const th: Theme = "precision";
  const trackLine = tracking.number
    ? `<p style="font-size:14px;color:${THEME[th].text};margin:0 0 16px">${tracking.carrier ? esc(tracking.carrier) + " &middot; " : ""}Tracking: ${tracking.url ? `<a href="${tracking.url}" style="color:${THEME[th].text}">${esc(tracking.number)}</a>` : esc(tracking.number)}</p>`
    : "";
  const inner =
    kicker(th, "Shipped") +
    h1(th, "On its way.") +
    `<p style="font-size:14px;color:${THEME[th].muted};margin:0 0 12px">Order ${esc(order.orderNumber)} has shipped to ${esc(order.shipState ?? "")}.</p>` +
    trackLine +
    itemsTable(th, items);
  return {
    subject: `Order ${order.orderNumber} is on its way`,
    html: layout(th, inner),
  };
}

export function tabletsLaunchEmail(unsubscribeUrl: string): RenderedEmail {
  const th: Theme = "precision";
  const base = resolveBaseUrl();
  const inner =
    kicker(th, "The Precision Line") +
    h1(th, "Tablets are here.") +
    `<p style="font-size:14px;color:${THEME[th].muted};margin:0 0 20px">Lighter format. Higher standards. The KR8MX tablet line is now available. 21+ adult use only.</p>` +
    cta(th, "Shop Tablets", `${base}/tablets`);
  return {
    subject: "KR8MX Tablets — now available",
    html: layout(th, inner, unsubscribeUrl),
  };
}

export function drinksCampaignEmail(args: {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  unsubscribeUrl: string;
}): RenderedEmail {
  const th: Theme = "performance";
  const inner =
    kicker(th, "The Performance Line") +
    h1(th, args.heading) +
    `<p style="font-size:14px;color:${THEME[th].muted};margin:0 0 20px">${esc(args.body)}</p>` +
    cta(th, args.ctaLabel, args.ctaUrl);
  return { subject: args.heading, html: layout(th, inner, args.unsubscribeUrl) };
}
