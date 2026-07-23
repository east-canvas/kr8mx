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
