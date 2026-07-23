import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { getAllCoas } from "@/db/queries";
import { updateCoaAction, deleteCoaAction } from "../coa-actions";
import { CoaUpload } from "@/components/admin/CoaUpload";
import { Badge } from "@/components/ui/Badge";
import { ExternalIcon, ChevronDownIcon } from "@/components/icons/Icons";
import { cn } from "@/lib/cn";

type Folder = "drinks" | "tablets";
const FOLDERS: Folder[] = ["drinks", "tablets"];

const inputCls =
  "w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-primary outline-none focus-visible:border-accent";

function fileKind(url: string): "PDF" | "Image" {
  return /\.pdf($|\?)/i.test(url) ? "PDF" : "Image";
}
function fmtDate(d: Date | string | null) {
  return d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "-";
}

export default async function AdminCoaPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; ok?: string; error?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const folder: Folder = sp.folder === "tablets" ? "tablets" : "drinks";

  const all = await getAllCoas();
  const coas = all.filter((c) => c.category === folder);
  const counts = {
    drinks: all.filter((c) => c.category === "drinks").length,
    tablets: all.filter((c) => c.category === "tablets").length,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display text-primary text-xl">Certificates of Analysis</h2>
        <p className="mt-1 text-sm text-secondary">
          Manage COAs by folder. Uploads publish live to{" "}
          <span className="text-primary">/coa/{folder}</span>.
        </p>
      </div>

      {sp.ok ? (
        <p className="rounded-md border border-hairline px-4 py-2 text-sm text-secondary">
          {sp.ok === "deleted" ? "COA deleted." : "Saved."}
        </p>
      ) : null}

      {/* folder tabs */}
      <div className="flex gap-2">
        {FOLDERS.map((f) => (
          <a
            key={f}
            href={`/admin/coa?folder=${f}`}
            className={cn(
              "flex items-center gap-2 rounded-md border px-4 py-2 text-sm capitalize transition-colors",
              f === folder
                ? "border-primary bg-primary text-bg"
                : "border-hairline text-secondary hover:border-secondary",
            )}
          >
            {f}
            <span
              className={cn(
                "rounded-full px-1.5 text-2xs",
                f === folder ? "bg-bg/20" : "bg-surface-raised",
              )}
            >
              {counts[f]}
            </span>
          </a>
        ))}
      </div>

      {/* upload into the current folder */}
      <div>
        <span className="type-kicker mb-2 block text-muted">
          Add to {folder}
        </span>
        <CoaUpload folder={folder} />
      </div>

      {/* list */}
      {coas.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline px-4 py-10 text-center text-sm text-muted">
          No COAs in this folder yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {coas.map((c) => (
            <li key={c.id} className="rounded-lg border border-hairline p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-primary">{c.title}</span>
                    <Badge variant={c.status === "published" ? "accent" : "outline"}>
                      {c.status}
                    </Badge>
                    <Badge variant="outline">{fileKind(c.fileUrl)}</Badge>
                  </div>
                  <p className="mt-1 text-2xs text-muted">
                    {c.flavor ? `${c.flavor} · ` : ""}
                    {c.lotNumber ? `Lot ${c.lotNumber} · ` : ""}
                    Issued {fmtDate(c.issuedDate)}
                  </p>
                </div>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-hairline px-3 py-1.5 text-2xs uppercase tracking-wide text-primary hover:border-secondary"
                >
                  View <ExternalIcon width={13} height={13} className="text-muted" />
                </a>
              </div>

              {/* edit / delete */}
              <details className="group mt-3">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-2xs uppercase tracking-wide text-muted [&::-webkit-details-marker]:hidden">
                  Edit
                  <ChevronDownIcon
                    width={14}
                    height={14}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="mt-3 flex flex-col gap-3 border-t border-hairline pt-3">
                  <form action={updateCoaAction} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="category" value={folder} />
                    <label className="flex flex-1 flex-col gap-1">
                      <span className="text-2xs uppercase tracking-wide text-muted">Title</span>
                      <input name="title" defaultValue={c.title} className={inputCls} />
                    </label>
                    <label className="flex flex-col gap-1 sm:w-32">
                      <span className="text-2xs uppercase tracking-wide text-muted">Lot</span>
                      <input name="lotNumber" defaultValue={c.lotNumber ?? ""} className={inputCls} />
                    </label>
                    <label className="flex flex-col gap-1 sm:w-32">
                      <span className="text-2xs uppercase tracking-wide text-muted">Status</span>
                      <select name="status" defaultValue={c.status} className={inputCls}>
                        <option value="published">published</option>
                        <option value="draft">draft</option>
                      </select>
                    </label>
                    <button className="rounded-sm border border-primary px-4 py-2 text-2xs uppercase tracking-wide text-primary hover:bg-primary hover:text-bg">
                      Save
                    </button>
                  </form>
                  <form action={deleteCoaAction}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="category" value={folder} />
                    <button className="text-2xs uppercase tracking-wide text-strawberry transition-opacity hover:opacity-70">
                      Delete COA
                    </button>
                  </form>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
