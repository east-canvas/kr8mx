import { cookies } from "next/headers";
import { getAllCoas, getAllDynamicLinks } from "@/db/queries";
import {
  createLinkAction,
  updateLinkTargetAction,
  toggleLinkAction,
} from "./actions";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { generateQrSvg, scanUrl, siteBaseUrl } from "@/lib/admin/qr";
import { Badge } from "@/components/ui/Badge";
import { HairlineRule } from "@/components/ui/HairlineRule";
import { CoaUpload } from "@/components/admin/CoaUpload";

const inputCls =
  "rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-primary outline-none focus-visible:border-accent";
const labelCls = "type-kicker text-muted";

function Flash({ ok, error }: { ok?: string; error?: string }) {
  if (!ok && !error) return null;
  const msg = error
    ? error === "db"
      ? "Database unavailable — set DATABASE_URL to persist changes."
      : "Please complete all required fields."
    : "Saved.";
  return (
    <div
      className={`mb-6 rounded-md border px-4 py-3 text-sm ${
        error
          ? "border-strawberry/40 text-strawberry"
          : "border-hairline text-secondary"
      }`}
    >
      {msg}
    </div>
  );
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  // Guard: never fetch admin data for an unauthed request.
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;

  const { ok, error } = await searchParams;
  const [coas, links] = await Promise.all([getAllCoas(), getAllDynamicLinks()]);
  const linkQrs = await Promise.all(
    links.map((l) => generateQrSvg(scanUrl(l.code))),
  );

  return (
    <div className="flex flex-col gap-14">
      <Flash ok={ok} error={error} />

      {/* ---- Dynamic barcodes ---- */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="type-display text-primary text-xl">Dynamic Barcodes</h2>
          <p className="mt-1 text-sm text-secondary">
            QR codes for packaging. The code is permanent; edit the target
            anytime to re-point printed packaging — no reprint needed. Base:{" "}
            <span className="text-primary">{siteBaseUrl()}/q/&hellip;</span>
          </p>
        </div>

        <form
          action={createLinkAction}
          className="grid gap-3 rounded-lg border border-hairline p-5 sm:grid-cols-2"
        >
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Label</span>
            <input name="label" required className={inputCls} placeholder="Drinks pack QR" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Target URL</span>
            <input
              name="targetUrl"
              required
              className={inputCls}
              placeholder="https://kr8mx.com/coa/drinks"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Category (optional)</span>
            <select name="category" className={inputCls} defaultValue="">
              <option value="">—</option>
              <option value="drinks">drinks</option>
              <option value="tablets">tablets</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Custom code (optional)</span>
            <input name="code" className={inputCls} placeholder="auto-generated" />
          </label>
          <div className="sm:col-span-2">
            <button className="rounded-sm border border-accent bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-accent-contrast transition-opacity hover:opacity-90">
              Create barcode
            </button>
          </div>
        </form>

        {links.length === 0 ? (
          <p className="text-sm text-muted">No barcodes yet.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {links.map((l, i) => (
              <li
                key={l.id}
                className="flex gap-4 rounded-lg border border-hairline p-4"
              >
                <div
                  className="h-28 w-28 shrink-0 rounded-md border border-hairline p-2"
                  dangerouslySetInnerHTML={{ __html: linkQrs[i] }}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-primary">{l.label}</span>
                    <Badge variant={l.active ? "accent" : "outline"}>
                      {l.active ? "Active" : "Off"}
                    </Badge>
                  </div>
                  <a
                    href={scanUrl(l.code)}
                    className="truncate text-2xs text-muted hover:text-primary"
                  >
                    {scanUrl(l.code)}
                  </a>
                  <p className="truncate text-2xs text-secondary">
                    &rarr; {l.targetUrl}
                  </p>
                  <span className="text-2xs text-muted">{l.scanCount} scans</span>

                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-2xs uppercase tracking-wide text-muted">
                      Download
                    </span>
                    <a
                      href={`/admin/qr/${l.code}?fmt=svg`}
                      download
                      className="rounded-sm border border-hairline px-2 py-0.5 text-2xs uppercase tracking-wide text-primary hover:border-secondary"
                    >
                      SVG
                    </a>
                    <a
                      href={`/admin/qr/${l.code}?fmt=png&size=1024`}
                      download
                      className="rounded-sm border border-hairline px-2 py-0.5 text-2xs uppercase tracking-wide text-primary hover:border-secondary"
                    >
                      PNG 1K
                    </a>
                    <a
                      href={`/admin/qr/${l.code}?fmt=png&size=2048`}
                      download
                      className="rounded-sm border border-hairline px-2 py-0.5 text-2xs uppercase tracking-wide text-primary hover:border-secondary"
                    >
                      PNG 2K
                    </a>
                  </div>

                  <form action={updateLinkTargetAction} className="mt-1 flex gap-2">
                    <input type="hidden" name="id" value={l.id} />
                    <input
                      name="targetUrl"
                      defaultValue={l.targetUrl}
                      className={`${inputCls} min-w-0 flex-1 py-1.5 text-2xs`}
                    />
                    <button className="rounded-sm border border-hairline px-2.5 py-1 text-2xs uppercase tracking-wide text-primary hover:border-secondary">
                      Save
                    </button>
                  </form>
                  <form action={toggleLinkAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="active" value={String(l.active)} />
                    <button className="text-2xs uppercase tracking-wide text-muted hover:text-primary">
                      {l.active ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <HairlineRule />

      {/* ---- COA documents ---- */}
      <section className="flex flex-col gap-6">
        <div>
          <h2 className="type-display text-primary text-xl">
            Certificates of Analysis
          </h2>
          <p className="mt-1 text-sm text-secondary">
            Publish per-category lab results to{" "}
            <span className="text-primary">/coa/drinks</span> and{" "}
            <span className="text-primary">/coa/tablets</span>.
          </p>
        </div>

        <CoaUpload />

        {coas.length === 0 ? (
          <p className="text-sm text-muted">No COAs yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
            {coas.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-primary">{c.title}</span>
                  <span className="text-2xs text-muted">
                    {c.category}
                    {c.flavor ? ` · ${c.flavor}` : ""}
                    {c.lotNumber ? ` · Lot ${c.lotNumber}` : ""}
                  </span>
                </div>
                <Badge variant={c.status === "published" ? "accent" : "outline"}>
                  {c.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
