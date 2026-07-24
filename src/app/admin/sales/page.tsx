import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listSalesOrders, listSalesReps, salesStats } from "@/lib/admin/sales-data";
import { formatCents } from "@/db/money";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import {
  SALES_ORDER_STATUSES,
  SALES_STATUS_LABEL,
  CASE_BOTTLES,
  type SalesOrderStatus,
} from "@/lib/sales/catalog";

const STATUS_VARIANT: Record<SalesOrderStatus, "accent" | "outline" | "default"> = {
  new: "accent",
  invoiced: "default",
  paid: "outline",
  submitted: "outline",
  cancelled: "outline",
};

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function SalesDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; rep?: string; ok?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const repId = sp.rep ? Number(sp.rep) : undefined;

  const [orders, reps, stats] = await Promise.all([
    listSalesOrders({ status, repId }),
    listSalesReps(),
    salesStats(),
  ]);

  const cards = [
    { key: "new", label: "New", value: stats.byStatus.new ?? 0 },
    { key: "invoiced", label: "To collect", value: stats.byStatus.invoiced ?? 0 },
    { key: "paid", label: "Paid", value: stats.byStatus.paid ?? 0 },
    { key: "submitted", label: "Submitted", value: stats.byStatus.submitted ?? 0 },
  ];
  const openCases = Math.floor(stats.openBottles / CASE_BOTTLES);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="type-display text-primary text-xl">Sales</h2>
          <p className="mt-1 text-sm text-secondary">
            Wholesale orders to invoice, collect, and submit. No online payment
            yet, this is the internal order book.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/sales/new"
            className="rounded-sm border border-accent bg-accent px-4 py-2 text-2xs font-medium uppercase tracking-wide text-accent-contrast hover:opacity-90"
          >
            + New order
          </Link>
          <Link
            href="/admin/sales/reps"
            className="rounded-sm border border-hairline px-4 py-2 text-2xs uppercase tracking-wide text-primary hover:border-secondary"
          >
            Reps
          </Link>
          <a
            href="/admin/sales/export"
            className="rounded-sm border border-hairline px-4 py-2 text-2xs uppercase tracking-wide text-primary hover:border-secondary"
          >
            Export CSV
          </a>
        </div>
      </div>

      {sp.ok ? (
        <p className="rounded-md border border-hairline px-4 py-2 text-sm text-secondary">
          {sp.ok === "created" ? "Order created." : "Saved."}
        </p>
      ) : null}

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.key}
            href={`/admin/sales?status=${c.key}`}
            className="rounded-lg border border-hairline p-4 hover:border-secondary"
          >
            <div className="type-display text-primary text-2xl">{c.value}</div>
            <div className="mt-1 text-2xs uppercase tracking-wide text-muted">{c.label}</div>
          </Link>
        ))}
        <div className="rounded-lg border border-hairline p-4">
          <div className="type-display text-primary text-2xl">{openCases}</div>
          <div className="mt-1 text-2xs uppercase tracking-wide text-muted">
            Open cases
          </div>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/sales"
          className={cn(
            "rounded-sm border px-3 py-1.5 text-2xs uppercase tracking-wide",
            status === "all" ? "border-primary text-primary" : "border-hairline text-muted",
          )}
        >
          All
        </Link>
        {SALES_ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/sales?status=${s}`}
            className={cn(
              "rounded-sm border px-3 py-1.5 text-2xs uppercase tracking-wide",
              status === s ? "border-primary text-primary" : "border-hairline text-muted",
            )}
          >
            {SALES_STATUS_LABEL[s]}
          </Link>
        ))}
        {reps.length ? (
          <form className="ml-auto">
            <select
              name="rep"
              defaultValue={sp.rep ?? ""}
              className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-2xs text-primary"
            >
              <option value="">All reps</option>
              {reps.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </form>
        ) : null}
      </div>

      {/* orders */}
      {orders.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline px-4 py-10 text-center text-sm text-muted">
          No orders yet. Connect the database and place your first order.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/sales/${o.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-hairline p-4 hover:border-secondary"
              >
                <span className="font-mono text-2xs text-muted">{o.orderNumber}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-primary">
                  {o.company}
                </span>
                <span className="text-2xs text-muted">{o.repName ?? "Unassigned"}</span>
                <span className="text-2xs text-secondary">
                  {Math.floor(o.totalBottles / CASE_BOTTLES)} cs
                </span>
                <span className="text-2xs text-secondary">
                  {o.subtotalCents ? formatCents(o.subtotalCents) : "-"}
                </span>
                <span className="text-2xs text-muted">{fmtDate(o.createdAt)}</span>
                <Badge variant={STATUS_VARIANT[o.status as SalesOrderStatus]}>
                  {SALES_STATUS_LABEL[o.status as SalesOrderStatus]}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
