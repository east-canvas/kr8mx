import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listSalesReps } from "@/lib/admin/sales-data";
import { createRepAction, updateRepAction, toggleRepAction } from "../../sales-actions";
import { Badge } from "@/components/ui/Badge";
import { ChevronDownIcon } from "@/components/icons/Icons";

const inputCls =
  "w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-primary outline-none focus-visible:border-accent";
const labelCls = "text-2xs uppercase tracking-wide text-muted";

export default async function SalesRepsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const reps = await listSalesReps();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/sales" className="text-2xs uppercase tracking-wide text-muted hover:text-primary">
          &larr; Sales
        </Link>
        <h2 className="type-display mt-2 text-primary text-xl">Sales reps</h2>
        <p className="mt-1 text-sm text-secondary">
          Add reps so orders can be allocated and attributed. Inactive reps stay
          on past orders but drop off the order form.
        </p>
      </div>

      {sp.ok ? (
        <p className="rounded-md border border-hairline px-4 py-2 text-sm text-secondary">Saved.</p>
      ) : null}
      {sp.error ? (
        <p className="rounded-md border border-strawberry/40 px-4 py-2 text-sm text-strawberry">
          {sp.error === "db" ? "Database unavailable, or the code is already taken." : "Name is required."}
        </p>
      ) : null}

      {/* add */}
      <form action={createRepAction} className="grid gap-3 rounded-lg border border-hairline p-5 sm:grid-cols-4">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Name *</span>
          <input name="name" required className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Email</span>
          <input name="email" type="email" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Phone</span>
          <input name="phone" className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Code</span>
          <input name="code" placeholder="auto" className={inputCls} />
        </label>
        <div className="sm:col-span-4">
          <button className="rounded-sm border border-accent bg-accent px-5 py-2 text-2xs font-medium uppercase tracking-wide text-accent-contrast hover:opacity-90">
            Add rep
          </button>
        </div>
      </form>

      {/* list */}
      {reps.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline px-4 py-10 text-center text-sm text-muted">
          No reps yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reps.map((r) => (
            <li key={r.id} className="rounded-lg border border-hairline p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-primary">{r.name}</span>
                {r.code ? <Badge variant="outline">{r.code}</Badge> : null}
                <Badge variant={r.active ? "accent" : "outline"}>
                  {r.active ? "Active" : "Inactive"}
                </Badge>
                <span className="text-2xs text-muted">
                  {[r.email, r.phone].filter(Boolean).join(" · ")}
                </span>
                <form action={toggleRepAction} className="ml-auto">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="active" value={String(r.active)} />
                  <button className="text-2xs uppercase tracking-wide text-muted hover:text-primary">
                    {r.active ? "Deactivate" : "Reactivate"}
                  </button>
                </form>
              </div>

              <details className="group mt-3">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-2xs uppercase tracking-wide text-muted [&::-webkit-details-marker]:hidden">
                  Edit
                  <ChevronDownIcon width={14} height={14} className="transition-transform group-open:rotate-180" />
                </summary>
                <form action={updateRepAction} className="mt-3 grid gap-2 border-t border-hairline pt-3 sm:grid-cols-4">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="active" value={String(r.active)} />
                  <input name="name" defaultValue={r.name} className={inputCls} placeholder="Name" />
                  <input name="email" defaultValue={r.email ?? ""} className={inputCls} placeholder="Email" />
                  <input name="phone" defaultValue={r.phone ?? ""} className={inputCls} placeholder="Phone" />
                  <input name="code" defaultValue={r.code ?? ""} className={inputCls} placeholder="Code" />
                  <div className="sm:col-span-4">
                    <button className="rounded-sm border border-primary px-4 py-2 text-2xs uppercase tracking-wide text-primary hover:bg-primary hover:text-bg">
                      Save
                    </button>
                  </div>
                </form>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
