"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { getDb } from "@/db/client";
import { coaDocuments } from "@/db/schema";
import type { ProductCategory } from "@/db/schema";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

async function assertAuthed() {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) redirect("/admin");
}
const str = (v: FormDataEntryValue | null) => (v ?? "").toString().trim();

/** Edit a COA's title / lot / published state. Audit-logged. */
export async function updateCoaAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const title = str(formData.get("title"));
  const lotNumber = str(formData.get("lotNumber")) || null;
  const status = str(formData.get("status")) === "published" ? "published" : "draft";
  const category = str(formData.get("category"));
  if (!id || !title) redirect(`/admin/coa?folder=${category}&error=fields`);

  try {
    const db = getDb();
    const [before] = await db
      .select()
      .from(coaDocuments)
      .where(eq(coaDocuments.id, id))
      .limit(1);
    const [after] = await db
      .update(coaDocuments)
      .set({ title, lotNumber, status, updatedAt: new Date() })
      .where(eq(coaDocuments.id, id))
      .returning();
    await logAudit({
      entity: "coa",
      entityId: id,
      action: "update",
      before,
      after,
    });
  } catch {
    redirect(`/admin/coa?folder=${category}&error=db`);
  }
  revalidatePath("/admin/coa");
  revalidatePath(`/coa/${category}`);
  redirect(`/admin/coa?folder=${category}&ok=updated`);
}

/** Delete a COA — removes the Blob file (best-effort) + the row. Audit-logged. */
export async function deleteCoaAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const category = str(formData.get("category"));
  if (!id) redirect(`/admin/coa?folder=${category}&error=fields`);

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(coaDocuments)
      .where(eq(coaDocuments.id, id))
      .limit(1);
    if (!row) redirect(`/admin/coa?folder=${category}&error=notfound`);

    // Best-effort blob cleanup (only our Vercel Blob URLs).
    if (row.fileUrl.includes(".public.blob.vercel-storage.com")) {
      try {
        await del(row.fileUrl);
      } catch {
        /* ignore — the row delete is what matters for the storefront */
      }
    }

    await db.delete(coaDocuments).where(eq(coaDocuments.id, id));
    await logAudit({
      entity: "coa",
      entityId: id,
      action: "delete",
      before: row,
    });
  } catch {
    redirect(`/admin/coa?folder=${category}&error=db`);
  }
  revalidatePath("/admin/coa");
  revalidatePath(`/coa/${category}`);
  redirect(`/admin/coa?folder=${category}&ok=deleted`);
}
