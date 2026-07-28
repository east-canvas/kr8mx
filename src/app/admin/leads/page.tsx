import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { getLeadsOverview } from "@/lib/admin/data";
import { updateLeadStatusAction } from "../ops-actions";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { Badge } from "@/components/ui/Badge";
import type { LeadStatus } from "@/db/schema";

const STATUS_VARIANT: Record<LeadStatus, "accent" | "outline"> = {
  new: "accent",
  contacted: "outline",
  closed: "outline",
};
const NEXT: Record<LeadStatus, LeadStatus[]> = {
  new: ["contacted", "closed"],
  contacted: ["closed", "new"],
  closed: ["new"],
};

function fmt(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminLeadsPage() {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const { rows, total, newCount, contacted, closed, byType } =
    await getLeadsOverview();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="type-display text-primary text-xl">Leads</h2>

      <div className="flex flex-wrap gap-6 text-sm">
        <span className="text-secondary">
          Total <span className="text-primary">{total}</span>
        </span>
        <span className="text-secondary">
          New <span className="text-primary">{newCount}</span>
        </span>
        <span className="text-secondary">
          Contacted <span className="text-primary">{contacted}</span>
        </span>
        <span className="text-secondary">
          Closed <span className="text-primary">{closed}</span>
        </span>
        <a
          href="/admin/leads/export"
          className="text-2xs uppercase tracking-wide text-primary underline-offset-4 hover:underline"
        >
          Export CSV
        </a>
      </div>

      {byType.length > 0 ? (
        <div>
          <span className="type-kicker text-muted">By type</span>
          <ul className="mt-2 flex flex-wrap gap-3 text-2xs text-secondary">
            {byType.map((v) => (
              <li key={String(v.type)}>
                {v.type}: <span className="text-primary">{v.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <HairlineRule />

      {rows.length === 0 ? (
        <p className="text-sm text-muted">No leads yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-2xs uppercase tracking-wide text-muted">
              <tr className="border-b border-hairline">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Contact</th>
                <th className="py-2 pr-4">Message</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Update</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-hairline align-top">
                  <td className="whitespace-nowrap py-3 pr-4 text-2xs text-muted">
                    {fmt(r.createdAt)}
                  </td>
                  <td className="py-3 pr-4 text-secondary">{r.type}</td>
                  <td className="py-3 pr-4 text-secondary">
                    {r.name}
                    {r.company ? (
                      <span className="block text-2xs text-muted">
                        {r.company}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-secondary">
                    <a
                      href={`mailto:${r.email}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {r.email}
                    </a>
                    {r.phone ? (
                      <span className="block text-2xs text-muted">{r.phone}</span>
                    ) : null}
                  </td>
                  <td className="max-w-xs py-3 pr-4 text-2xs text-secondary">
                    {r.message ?? "-"}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {NEXT[r.status].map((s) => (
                        <form key={s} action={updateLeadStatusAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={s} />
                          <button className="rounded-sm border border-hairline px-2.5 py-1 text-2xs uppercase tracking-wide text-secondary transition-colors hover:border-primary hover:text-primary">
                            {s}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
