import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { getLeadsOverview } from "@/lib/admin/data";
import { updateLeadStatusAction, sendLeadReplyAction } from "../ops-actions";
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

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const { rows, replies, total, newCount, contacted, closed, byType } =
    await getLeadsOverview();

  return (
    <div className="flex flex-col gap-8">
      <h2 className="type-display text-primary text-xl">Leads</h2>

      {sp.ok === "reply" ? (
        <p className="rounded-md border border-hairline bg-surface px-4 py-2 text-sm text-primary">
          Reply sent from info@kr8mx.com.
        </p>
      ) : null}
      {sp.error === "reply_send" ? (
        <p className="rounded-md border border-hairline bg-surface px-4 py-2 text-sm" style={{ color: "#b4232a" }}>
          Reply failed to send. Check the email provider / sending domain.
        </p>
      ) : null}
      {sp.error === "reply_fields" ? (
        <p className="rounded-md border border-hairline bg-surface px-4 py-2 text-sm" style={{ color: "#b4232a" }}>
          Enter a subject and a message before sending.
        </p>
      ) : null}

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
                <th className="py-2 pr-4">Details</th>
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
                    {r.businessType || r.volume || r.location ? (
                      <div className="mb-1 flex flex-wrap gap-x-1.5 text-muted">
                        {[r.businessType, r.volume, r.location]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    ) : null}
                    {r.message ??
                      (r.businessType || r.volume || r.location ? "" : "-")}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-col items-start gap-2">
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
                      <Link
                        href={`/admin/sales/new?${new URLSearchParams({
                          company: r.company ?? "",
                          contact: r.name,
                          email: r.email,
                          phone: r.phone ?? "",
                          location: r.location ?? "",
                        }).toString()}`}
                        className="text-2xs font-semibold uppercase tracking-wide text-primary underline-offset-4 hover:underline"
                      >
                        Create order &rarr;
                      </Link>

                      <details className="w-64 max-w-full">
                        <summary className="cursor-pointer text-2xs font-semibold uppercase tracking-wide text-primary">
                          Reply
                          {replies[r.id]?.length
                            ? ` · ${replies[r.id].length} sent`
                            : ""}
                        </summary>
                        <div className="mt-2 flex flex-col gap-2">
                          {replies[r.id]?.length ? (
                            <ul className="flex flex-col gap-1.5">
                              {replies[r.id].map((rep) => (
                                <li
                                  key={rep.id}
                                  className="rounded-sm border border-hairline p-2 text-2xs text-secondary"
                                >
                                  <div className="text-muted">
                                    {fmt(rep.createdAt)} · {rep.status}
                                  </div>
                                  <div className="text-primary">{rep.subject}</div>
                                  <div className="mt-0.5 whitespace-pre-wrap text-muted">
                                    {rep.body}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          <form
                            action={sendLeadReplyAction}
                            className="flex flex-col gap-1.5"
                          >
                            <input type="hidden" name="id" value={r.id} />
                            <input
                              name="subject"
                              defaultValue="Re: your KR8MX inquiry"
                              className="rounded-sm border border-hairline bg-transparent px-2 py-1 text-2xs text-primary"
                            />
                            <textarea
                              name="body"
                              rows={4}
                              required
                              placeholder={`Hi ${r.name.split(/\s+/)[0]}, thanks for reaching out…`}
                              className="rounded-sm border border-hairline bg-transparent px-2 py-1 text-2xs text-primary"
                            />
                            <button className="self-start rounded-sm border border-primary px-3 py-1 text-2xs font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-surface-raised">
                              Send reply
                            </button>
                            <span className="text-2xs text-muted">
                              Sends from info@kr8mx.com
                            </span>
                          </form>
                        </div>
                      </details>
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
