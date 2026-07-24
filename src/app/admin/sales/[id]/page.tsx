import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { getSalesOrder } from "@/lib/admin/sales-data";
import { updateSalesOrderStatusAction } from "../../sales-actions";
import { orderToPlainText } from "@/lib/sales/format";
import { CopyButton } from "@/components/admin/CopyButton";
import { Badge } from "@/components/ui/Badge";
import { formatCents } from "@/db/money";
import {
  SALES_ORDER_STATUSES,
  SALES_STATUS_LABEL,
  CASE_BOTTLES,
  type SalesOrderStatus,
} from "@/lib/sales/catalog";

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleString("en-US");
}

export default async function SalesOrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const { id } = await params;
  const sp = await searchParams;
  const data = await getSalesOrder(Number(id));
  if (!data) notFound();
  const { order, rep, items } = data;
  const status = order.status as SalesOrderStatus;
  const cases = Math.floor(order.totalBottles / CASE_BOTTLES);
  const loose = order.totalBottles % CASE_BOTTLES;
  const summary = orderToPlainText(order, rep, items);

  const ship = [
    order.shipAddress,
    [order.shipCity, order.shipState].filter(Boolean).join(", "),
    order.shipZip,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/sales" className="text-2xs uppercase tracking-wide text-muted hover:text-primary">
          &larr; Sales
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="type-display text-primary text-xl">{order.company}</h2>
          <Badge variant={status === "cancelled" ? "outline" : "accent"}>
            {SALES_STATUS_LABEL[status]}
          </Badge>
        </div>
        <p className="mt-1 font-mono text-2xs text-muted">
          {order.orderNumber} · {fmtDate(order.createdAt)}
        </p>
      </div>

      {sp.ok ? (
        <p className="rounded-md border border-hairline px-4 py-2 text-sm text-secondary">
          {sp.ok === "created" ? "Order created." : "Status updated."}
        </p>
      ) : null}

      {/* status + export actions */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline p-4">
        <span className="text-2xs uppercase tracking-wide text-muted">Set status</span>
        {SALES_ORDER_STATUSES.map((s) => (
          <form key={s} action={updateSalesOrderStatusAction}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value={s} />
            <button
              disabled={s === status}
              className="rounded-sm border border-hairline px-3 py-1.5 text-2xs uppercase tracking-wide text-primary hover:border-secondary disabled:border-accent disabled:text-accent disabled:opacity-100"
            >
              {SALES_STATUS_LABEL[s]}
            </button>
          </form>
        ))}
        <div className="ml-auto flex gap-2">
          <CopyButton text={summary} label="Copy for submission" />
          <a
            href={`/admin/sales/export?id=${order.id}`}
            className="rounded-sm border border-hairline px-4 py-2 text-2xs uppercase tracking-wide text-primary hover:border-secondary"
          >
            Download CSV
          </a>
        </div>
      </div>

      {/* customer */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline p-4">
          <span className="text-2xs uppercase tracking-wide text-muted">Account</span>
          <dl className="mt-2 flex flex-col gap-1 text-sm">
            <div className="flex gap-2"><dt className="w-20 text-muted">Rep</dt><dd className="text-primary">{rep?.name ?? "Unassigned"}</dd></div>
            <div className="flex gap-2"><dt className="w-20 text-muted">Contact</dt><dd className="text-primary">{order.contactName ?? "-"}</dd></div>
            <div className="flex gap-2"><dt className="w-20 text-muted">Email</dt><dd className="text-primary">{order.email ?? "-"}</dd></div>
            <div className="flex gap-2"><dt className="w-20 text-muted">Phone</dt><dd className="text-primary">{order.phone ?? "-"}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-hairline p-4">
          <span className="text-2xs uppercase tracking-wide text-muted">Ship to</span>
          <p className="mt-2 text-sm text-primary">{ship || "-"}</p>
          {order.notes ? (
            <>
              <span className="mt-3 block text-2xs uppercase tracking-wide text-muted">Notes</span>
              <p className="mt-1 text-sm text-secondary">{order.notes}</p>
            </>
          ) : null}
        </div>
      </div>

      {/* items */}
      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full text-left text-sm">
          <thead className="text-2xs uppercase tracking-wide text-muted">
            <tr className="border-b border-hairline">
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Flavor</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Bottles</th>
              <th className="px-4 py-2">Unit price</th>
              <th className="px-4 py-2">Line total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-hairline">
                <td className="px-4 py-2 text-primary">{it.brand}</td>
                <td className="px-4 py-2 text-primary">{it.flavor}</td>
                <td className="px-4 py-2 text-secondary">
                  {it.quantity} {it.unit}
                  {it.quantity === 1 ? "" : "s"}
                </td>
                <td className="px-4 py-2 text-secondary">{it.bottles}</td>
                <td className="px-4 py-2 text-secondary">
                  {it.unitPriceCents ? formatCents(it.unitPriceCents) : "-"}
                </td>
                <td className="px-4 py-2 text-secondary">
                  {it.lineTotalCents ? formatCents(it.lineTotalCents) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="px-4 py-2 text-primary" colSpan={3}>
                Total
              </td>
              <td className="px-4 py-2 text-primary">
                {order.totalBottles} ({cases} cs{loose ? ` +${loose}` : ""})
              </td>
              <td className="px-4 py-2" />
              <td className="px-4 py-2 text-primary">
                {order.subtotalCents ? formatCents(order.subtotalCents) : "-"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
