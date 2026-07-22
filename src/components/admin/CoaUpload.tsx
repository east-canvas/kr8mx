"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { recordCoaUploadAction } from "@/app/admin/actions";
import { FLAVORS } from "@/db/seed-data";
import { cn } from "@/lib/cn";

const inputCls =
  "rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-primary outline-none focus-visible:border-accent";
const labelCls = "type-kicker text-muted";

type Status = "idle" | "uploading" | "saving" | "done" | "error";

/**
 * Drag-and-drop COA uploader. The file goes straight to Vercel Blob under
 * coa/{category}/…; on success a published COA row is recorded and the page
 * refreshes, so the document is immediately live on /coa/{category}.
 */
export function CoaUpload({ folder }: { folder?: "drinks" | "tablets" }) {
  const [category, setCategory] = useState<"drinks" | "tablets">(
    folder ?? "drinks",
  );
  const [flavor, setFlavor] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const accept = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

  function pick(f: File | null) {
    if (!f) return;
    const ok = /\.(pdf|jpe?g|png)$/i.test(f.name);
    if (!ok) {
      setStatus("error");
      setMessage("Only PDF, JPG, or PNG files are allowed.");
      return;
    }
    setFile(f);
    setStatus("idle");
    setMessage("");
  }

  async function handleUploadSubmit() {
    if (!file) return;
    try {
      setStatus("uploading");
      setMessage("Uploading…");
      const blob = await upload(`coa/${category}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/coa/upload",
      });

      setStatus("saving");
      setMessage("Publishing…");
      const fd = new FormData();
      fd.set("category", category);
      fd.set("fileUrl", blob.url);
      if (flavor) fd.set("flavor", flavor);
      if (lotNumber) fd.set("lotNumber", lotNumber);
      await recordCoaUploadAction(fd);

      setStatus("done");
      setMessage("Published.");
      setFile(null);
      setLotNumber("");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(
        (err as Error).message ||
          "Upload failed. Connect a Vercel Blob store (BLOB_READ_WRITE_TOKEN).",
      );
    }
  }

  const busy = status === "uploading" || status === "saving";

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-hairline p-5">
      <div
        className={cn(
          "grid gap-3",
          folder ? "sm:grid-cols-2" : "sm:grid-cols-3",
        )}
      >
        {folder ? null : (
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>Folder</span>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as "drinks" | "tablets")
              }
              className={inputCls}
            >
              <option value="drinks">drinks</option>
              <option value="tablets">tablets</option>
            </select>
          </label>
        )}
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Flavor (optional)</span>
          <select
            value={flavor}
            onChange={(e) => setFlavor(e.target.value)}
            className={inputCls}
          >
            <option value="">—</option>
            {FLAVORS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Lot # (optional)</span>
          <input
            value={lotNumber}
            onChange={(e) => setLotNumber(e.target.value)}
            className={inputCls}
            placeholder="24-0142"
          />
        </label>
      </div>

      {/* drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0] ?? null);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors duration-base ease-out-brand ${
          dragging ? "border-accent bg-accent/5" : "border-hairline"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <span className="text-sm text-primary">{file.name}</span>
        ) : (
          <>
            <span className="text-sm text-primary">
              Drag &amp; drop a COA here
            </span>
            <span className="text-2xs text-muted">
              or click to browse · PDF, JPG, PNG
            </span>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <span
          className={`text-2xs ${
            status === "error" ? "text-strawberry" : "text-muted"
          }`}
        >
          {message || "Uploads publish live to the selected folder."}
        </span>
        <button
          type="button"
          disabled={!file || busy}
          onClick={handleUploadSubmit}
          className="rounded-sm border border-accent bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-accent-contrast transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Working…" : "Upload & publish"}
        </button>
      </div>
    </div>
  );
}
