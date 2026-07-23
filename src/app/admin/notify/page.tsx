import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { getNotifyOverview } from "@/lib/admin/data";
import { sendAnnouncementAction } from "../ops-actions";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Badge } from "@/components/ui/Badge";

const inputCls =
  "rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-primary outline-none focus-visible:border-accent";

export default async function AdminNotifyPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; sent?: string; skipped?: string; failed?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const { rows, subscribed, unsubscribed, byVariant } = await getNotifyOverview();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="type-display text-primary text-xl">Notify list</h2>

      {sp.ok ? (
        <p className="rounded-md border border-hairline px-4 py-2 text-sm text-secondary">
          Announcement queued, sent {sp.sent}, skipped {sp.skipped} (already
          sent / unsubscribed), failed {sp.failed}.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-6 text-sm">
        <span className="text-secondary">
          Subscribed <span className="text-primary">{subscribed}</span>
        </span>
        <span className="text-secondary">
          Unsubscribed <span className="text-primary">{unsubscribed}</span>
        </span>
        <a
          href="/admin/notify/export"
          className="text-2xs uppercase tracking-wide text-primary underline-offset-4 hover:underline"
        >
          Export CSV
        </a>
      </div>

      <div>
        <span className="type-kicker text-muted">Subscribed by variant interest</span>
        <ul className="mt-2 flex flex-wrap gap-3 text-2xs text-secondary">
          {byVariant.map((v) => (
            <li key={String(v.variantId)}>
              {v.variantId ?? "general"}: <span className="text-primary">{v.count}</span>
            </li>
          ))}
        </ul>
      </div>

      <HairlineRule />

      {/* announcement, confirm step shows recipient count */}
      <form action={sendAnnouncementAction} className="flex flex-col gap-3 rounded-lg border border-hairline p-5">
        <span className="type-kicker text-muted">Send launch announcement</span>
        <p className="text-2xs text-muted">
          Sends the tablets-launch template to <strong>{subscribed}</strong>{" "}
          subscribed recipients (unsubscribed excluded). Idempotent per campaign -
          re-sending the same campaign name skips prior recipients.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <input name="campaign" required placeholder="campaign name (e.g. launch-2026)" className={inputCls} />
          <input name="variantId" placeholder="variant id (blank = general)" className={`${inputCls} w-40`} />
          <button className="rounded-sm border border-accent bg-accent px-4 py-1.5 text-2xs font-medium uppercase tracking-wide text-accent-contrast hover:opacity-90">
            Send to {subscribed}
          </button>
        </div>
      </form>

      {/* list */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-2xs uppercase tracking-wide text-muted">
            <tr className="border-b border-hairline">
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Variant</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-hairline">
                <td className="py-2 pr-4 text-secondary">{r.email}</td>
                <td className="py-2 pr-4 text-secondary">{r.variantId ?? "-"}</td>
                <td className="py-2">
                  <Badge variant={r.subscribed ? "accent" : "outline"}>
                    {r.subscribed ? "subscribed" : "unsubscribed"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
