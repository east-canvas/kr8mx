import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listOrders, getOrderDetail } from "@/lib/admin/data";
import { transitionOrderAction } from "../ops-actions";
import { ORDER_STATUSES, ORDER_TRANSITIONS } from "@/db/order-state";
import { formatCents } from "@/db/money";
import { Badge } from "@/components/ui/Badge";
import { HairlineRule } from "@/components/ui/HairlineRule";

const inputCls =
  "rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-primary outline-none focus-visible:border-accent";

function fmt(d: Date | string | null) {
  return d ? new Date(d).toLocaleString("en-US") : "—";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    order?: string;
    ok?: string;
    error?: string;
  }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;

  const orders = await listOrders({ status: sp.status, q: sp.q });
  const detail = sp.order ? await getOrderDetail(Number(sp.order)) : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="type-display text-primary text-xl">Orders</h2>
        {sp.error === "illegal" ? (
          <p className="mt-1 text-2xs text-strawberry">
            Illegal state transition rejected.
          </p>
        ) : null}
      </div>

      {/* filters */}
      <form className="flex flex-wrap items-center gap-2">
        <select name="status" defaultValue={sp.status ?? "all"} className={inputCls}>
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="order # or email"
          className={inputCls}
        />
        <button className="rounded-sm border border-hairline px-3 py-1.5 text-2xs uppercase tracking-wide text-primary hover:border-secondary">
          Filter
        </button>
      </form>

      {/* table */}
      {orders.length === 0 ? (
        <p className="text-sm text-muted">No orders.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-2xs uppercase tracking-wide text-muted">
              <tr className="border-b border-hairline">
                <th className="py-2 pr-4">Order</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">State</th>
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-hairline">
                  <td className="py-2 pr-4">
                    <a
                      href={`/admin/orders?order=${o.id}`}
                      className="text-primary hover:underline"
                    >
                      {o.orderNumber}
                    </a>
                  </td>
                  <td className="py-2 pr-4 text-secondary">{o.email}</td>
                  <td className="py-2 pr-4 text-secondary">{o.shipState}</td>
                  <td className="py-2 pr-4 text-primary">
                    {formatCents(o.totalCents)}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline">{o.status}</Badge>
                  </td>
                  <td className="py-2 text-2xs text-muted">{fmt(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* detail */}
      {detail ? (
        <div className="rounded-lg border border-hairline p-6">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-primary">
              {detail.order.orderNumber}
            </h3>
            <Badge variant="accent">{detail.order.status}</Badge>
          </div>
          <p className="mt-1 text-2xs text-muted">
            {detail.order.email} · ships to {detail.order.shipState}
          </p>

          <HairlineRule className="my-4" />
          <ul className="flex flex-col gap-1 text-sm">
            {detail.items.map((i) => (
              <li key={i.id} className="flex justify-between">
                <span className="text-secondary">
                  {i.nameSnapshot} × {i.quantity} · {i.sku}
                </span>
                <span className="text-primary">{formatCents(i.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between text-sm">
            <span className="type-kicker text-muted">Total</span>
            <span className="text-primary">{formatCents(detail.order.totalCents)}</span>
          </div>

          {/* transitions */}
          <HairlineRule className="my-4" />
          <span className="type-kicker text-muted">Advance status</span>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            {ORDER_TRANSITIONS[detail.order.status].length === 0 ? (
              <span className="text-2xs text-muted">Terminal state.</span>
            ) : (
              ORDER_TRANSITIONS[detail.order.status].map((next) => (
                <form key={next} action={transitionOrderAction} className="flex items-end gap-1">
                  <input type="hidden" name="orderId" value={detail.order.id} />
                  <input type="hidden" name="toStatus" value={next} />
                  {next === "shipped" ? (
                    <input
                      name="trackingNumber"
                      placeholder="tracking #"
                      className={`${inputCls} w-32 py-1 text-2xs`}
                    />
                  ) : null}
                  <button className="rounded-sm border border-primary px-3 py-1.5 text-2xs uppercase tracking-wide text-primary hover:bg-primary hover:text-bg">
                    → {next}
                  </button>
                </form>
              ))
            )}
          </div>

          {/* events + emails */}
          <HairlineRule className="my-4" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <span className="type-kicker text-muted">Event timeline</span>
              <ul className="mt-2 flex flex-col gap-1 text-2xs text-secondary">
                {detail.events.map((e) => (
                  <li key={e.id}>
                    <span className="text-primary">{e.type}</span>
                    {e.fromStatus ? ` ${e.fromStatus}→${e.toStatus}` : ""} ·{" "}
                    {fmt(e.createdAt)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <span className="type-kicker text-muted">Emails sent</span>
              <ul className="mt-2 flex flex-col gap-1 text-2xs text-secondary">
                {detail.emails.length === 0 ? (
                  <li className="text-muted">None</li>
                ) : (
                  detail.emails.map((e) => (
                    <li key={e.id}>
                      {e.template} · {e.status} · {fmt(e.createdAt)}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
