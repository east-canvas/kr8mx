import type { SalesOrder, SalesOrderItem, SalesRep } from "@/db/schema";
import { CASE_BOTTLES, SALES_STATUS_LABEL } from "./catalog";
import type { SalesOrderStatus } from "./catalog";

/* Pure formatting for export. CSV (RFC-4180) for spreadsheets/other platforms,
   and a plain-text summary for pasting into an ordering tool. Unit-tested. */

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

const ITEM_HEADER = [
  "sku",
  "brand",
  "flavor",
  "unit",
  "quantity",
  "bottles",
  "unit_price",
  "line_total",
];

/** One order's line items as CSV, for importing into another platform. */
export function orderItemsToCsv(items: SalesOrderItem[]): string {
  const lines = [ITEM_HEADER.join(",")];
  for (const it of items) {
    lines.push(
      [
        csvCell(it.sku),
        csvCell(it.brand),
        csvCell(it.flavor),
        it.unit,
        String(it.quantity),
        String(it.bottles),
        dollars(it.unitPriceCents),
        dollars(it.lineTotalCents),
      ].join(","),
    );
  }
  return lines.join("\n");
}

const ORDER_HEADER = [
  "order_number",
  "status",
  "rep",
  "company",
  "contact",
  "email",
  "phone",
  "ship_state",
  "total_bottles",
  "subtotal",
  "created_at",
];

/** All orders as a summary CSV for the dashboard export. */
export function ordersToCsv(
  rows: Array<SalesOrder & { repName: string | null }>,
): string {
  const lines = [ORDER_HEADER.join(",")];
  for (const o of rows) {
    lines.push(
      [
        csvCell(o.orderNumber),
        SALES_STATUS_LABEL[o.status as SalesOrderStatus] ?? o.status,
        csvCell(o.repName ?? ""),
        csvCell(o.company),
        csvCell(o.contactName ?? ""),
        csvCell(o.email ?? ""),
        csvCell(o.phone ?? ""),
        o.shipState ?? "",
        String(o.totalBottles),
        dollars(o.subtotalCents),
        csvCell(new Date(o.createdAt).toISOString()),
      ].join(","),
    );
  }
  return lines.join("\n");
}

/** Human-readable summary to copy into another ordering platform. */
export function orderToPlainText(
  order: SalesOrder,
  rep: SalesRep | null,
  items: SalesOrderItem[],
): string {
  const L: string[] = [];
  L.push(`ORDER ${order.orderNumber}`);
  L.push(`Status: ${SALES_STATUS_LABEL[order.status as SalesOrderStatus] ?? order.status}`);
  if (rep) L.push(`Sales rep: ${rep.name}${rep.code ? ` (${rep.code})` : ""}`);
  L.push("");
  L.push("CUSTOMER");
  L.push(`Company: ${order.company}`);
  if (order.contactName) L.push(`Contact: ${order.contactName}`);
  if (order.email) L.push(`Email: ${order.email}`);
  if (order.phone) L.push(`Phone: ${order.phone}`);
  const ship = [
    order.shipAddress,
    [order.shipCity, order.shipState].filter(Boolean).join(", "),
    order.shipZip,
  ]
    .filter(Boolean)
    .join(" ");
  if (ship) L.push(`Ship to: ${ship}`);
  L.push("");
  L.push("ITEMS");
  for (const it of items) {
    const price = it.unitPriceCents ? ` @ $${dollars(it.unitPriceCents)}/${it.unit}` : "";
    const total = it.lineTotalCents ? ` = $${dollars(it.lineTotalCents)}` : "";
    L.push(
      `- ${it.brand} ${it.flavor}: ${it.quantity} ${it.unit}${it.quantity === 1 ? "" : "s"} (${it.bottles} bottles)${price}${total}`,
    );
  }
  const cases = Math.floor(order.totalBottles / CASE_BOTTLES);
  const loose = order.totalBottles % CASE_BOTTLES;
  L.push("");
  L.push(
    `TOTAL: ${order.totalBottles} bottles` +
      (cases ? ` (${cases} case${cases === 1 ? "" : "s"}${loose ? ` + ${loose}` : ""})` : "") +
      (order.subtotalCents ? ` | $${dollars(order.subtotalCents)}` : ""),
  );
  if (order.notes) {
    L.push("");
    L.push(`NOTES: ${order.notes}`);
  }
  return L.join("\n");
}
