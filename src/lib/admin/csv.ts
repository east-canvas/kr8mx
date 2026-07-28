/** CSV export for the notify list (pure, unit tested for shape). */
export type NotifyCsvRow = {
  email: string;
  variantId: number | null;
  subscribed: boolean;
  createdAt: Date | string;
};

const HEADER = ["email", "variant_id", "subscribed", "created_at"];

function cell(v: string): string {
  // RFC-4180 quoting
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function notifyListToCsv(rows: NotifyCsvRow[]): string {
  const lines = [HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      [
        cell(r.email),
        r.variantId == null ? "" : String(r.variantId),
        r.subscribed ? "true" : "false",
        cell(new Date(r.createdAt).toISOString()),
      ].join(","),
    );
  }
  return lines.join("\n");
}

/** CSV export for the sales leads pipeline. */
export type LeadCsvRow = {
  createdAt: Date | string;
  type: string;
  status: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
};

const LEAD_HEADER = [
  "created_at",
  "type",
  "status",
  "name",
  "email",
  "company",
  "phone",
  "message",
];

export function leadsToCsv(rows: LeadCsvRow[]): string {
  const lines = [LEAD_HEADER.join(",")];
  for (const r of rows) {
    lines.push(
      [
        cell(new Date(r.createdAt).toISOString()),
        cell(r.type),
        cell(r.status),
        cell(r.name),
        cell(r.email),
        cell(r.company ?? ""),
        cell(r.phone ?? ""),
        cell(r.message ?? ""),
      ].join(","),
    );
  }
  return lines.join("\n");
}
