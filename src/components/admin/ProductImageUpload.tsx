"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { setProductImageAction } from "@/app/admin/product-actions";
import { cn } from "@/lib/cn";

type Status = "idle" | "uploading" | "saving" | "error";

/**
 * Compact per-flavor image uploader. Sends the file straight to Vercel Blob
 * under products/{category}/{flavor}/…, then persists the URL via a server
 * action so the storefront picks it up immediately.
 */
export function ProductImageUpload({
  category,
  flavor,
  hasImage,
}: {
  category: "drinks" | "tablets";
  flavor: string;
  hasImage: boolean;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const accept = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";

  async function handle(file: File | null) {
    if (!file) return;
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setStatus("error");
      setMessage("JPG, PNG, or WEBP only.");
      return;
    }
    try {
      setStatus("uploading");
      setMessage("Uploading…");
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await upload(`products/${category}/${flavor}/${safe}`, file, {
        access: "public",
        handleUploadUrl: "/api/products/upload",
      });

      setStatus("saving");
      setMessage("Saving…");
      const fd = new FormData();
      fd.set("category", category);
      fd.set("flavor", flavor);
      fd.set("imageUrl", blob.url);
      await setProductImageAction(fd);
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
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !busy && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !busy) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0] ?? null);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed px-3 py-4 text-center text-2xs transition-colors",
          dragging ? "border-accent bg-accent/5" : "border-hairline",
          busy && "opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handle(e.target.files?.[0] ?? null)}
        />
        <span className="text-primary">
          {busy ? "Working…" : hasImage ? "Replace image" : "Upload image"}
        </span>
        <span className="text-muted">drop or click · JPG/PNG/WEBP</span>
      </div>
      {message ? (
        <span
          className={cn(
            "text-2xs",
            status === "error" ? "text-strawberry" : "text-muted",
          )}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
