import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listRestrictions } from "@/lib/admin/data";
import { updateRestrictionAction } from "../ops-actions";

const inputCls =
  "rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-primary outline-none focus-visible:border-accent";

function fmt(d: Date | string | null) {
  return d ? new Date(d).toLocaleDateString("en-US") : "never";
}

export default async function AdminRestrictionsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const rows = await listRestrictions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display text-primary text-xl">Shipping restrictions</h2>
        <p className="mt-1 text-sm text-secondary">
          Availability is data, not deploys. Edits are audit-logged. Confirm with
          counsel and set the verified date.
        </p>
        {sp.ok ? <p className="mt-1 text-2xs text-secondary">Saved.</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-2xs uppercase tracking-wide text-muted">
            <tr className="border-b border-hairline">
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">State</th>
              <th className="py-2 pr-4">Allowed</th>
              <th className="py-2 pr-4">Reason</th>
              <th className="py-2 pr-4">Last verified</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-hairline align-middle">
                <td className="py-2 pr-4 text-secondary">{r.category}</td>
                <td className="py-2 pr-4 text-primary">{r.state}</td>
                <td colSpan={4} className="py-2">
                  <form action={updateRestrictionAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select name="allowed" defaultValue={String(r.allowed)} className={inputCls}>
                      <option value="true">allowed</option>
                      <option value="false">blocked</option>
                    </select>
                    <input
                      name="reason"
                      defaultValue={r.reason ?? ""}
                      placeholder="reason"
                      className={`${inputCls} min-w-[220px] flex-1`}
                    />
                    <span className="text-2xs text-muted">
                      verified {fmt(r.lastVerified)}
                    </span>
                    <button className="rounded-sm border border-hairline px-2.5 py-1 text-2xs uppercase tracking-wide text-primary hover:border-secondary">
                      Save
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
