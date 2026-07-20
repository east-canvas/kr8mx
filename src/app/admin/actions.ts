"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { coaDocuments, dynamicLinks } from "@/db/schema";
import type { Flavor, ProductCategory } from "@/db/schema";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  isAuthed,
  sessionToken,
  verifyPassword,
} from "@/lib/admin/auth";
import { generateLinkCode } from "@/lib/admin/qr";

async function assertAuthed(): Promise<void> {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) {
    redirect("/admin");
  }
}

function str(v: FormDataEntryValue | null): string {
  return (v ?? "").toString().trim();
}

export async function loginAction(formData: FormData) {
  const password = str(formData.get("password"));
  if (!verifyPassword(password)) {
    redirect("/admin?error=auth");
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function createCoaAction(formData: FormData) {
  await assertAuthed();
  const category = str(formData.get("category")) as ProductCategory;
  const flavorRaw = str(formData.get("flavor"));
  const title = str(formData.get("title"));
  const fileUrl = str(formData.get("fileUrl"));
  const lotNumber = str(formData.get("lotNumber")) || null;
  const resultLine = str(formData.get("resultLine")) || undefined;
  const status = str(formData.get("status")) === "published" ? "published" : "draft";

  if (!title || !fileUrl || !category) {
    redirect("/admin?error=coa_fields");
  }

  try {
    const db = getDb();
    await db.insert(coaDocuments).values({
      category,
      flavor: flavorRaw ? (flavorRaw as Flavor) : null,
      title,
      fileUrl,
      lotNumber,
      ...(resultLine ? { resultLine } : {}),
      issuedDate: new Date(),
      status,
    });
  } catch {
    redirect("/admin?error=db");
  }
  revalidatePath("/admin");
  revalidatePath(`/coa/${category}`);
  redirect("/admin?ok=coa");
}

/**
 * Records a COA row after the file has been uploaded to Blob (drag-and-drop
 * flow). Publishes immediately so it goes live on /coa/{category}. Title
 * defaults to the file name when not provided.
 */
export async function recordCoaUploadAction(formData: FormData) {
  await assertAuthed();
  const category = str(formData.get("category")) as ProductCategory;
  const fileUrl = str(formData.get("fileUrl"));
  const flavorRaw = str(formData.get("flavor"));
  const lotNumber = str(formData.get("lotNumber")) || null;
  let title = str(formData.get("title"));

  if (!fileUrl || !category) {
    redirect("/admin?error=coa_fields");
  }
  if (!title) {
    const base = fileUrl.split("/").pop() ?? "COA";
    title = decodeURIComponent(base.replace(/\.[a-z0-9]+$/i, "")).slice(0, 120);
  }

  try {
    const db = getDb();
    await db.insert(coaDocuments).values({
      category,
      flavor: flavorRaw ? (flavorRaw as Flavor) : null,
      title,
      fileUrl,
      lotNumber,
      issuedDate: new Date(),
      status: "published",
    });
  } catch {
    redirect("/admin?error=db");
  }
  revalidatePath("/admin");
  revalidatePath(`/coa/${category}`);
  redirect("/admin?ok=coa");
}

export async function createLinkAction(formData: FormData) {
  await assertAuthed();
  const label = str(formData.get("label"));
  const targetUrl = str(formData.get("targetUrl"));
  const categoryRaw = str(formData.get("category"));
  const customCode = str(formData.get("code"));

  if (!label || !targetUrl) {
    redirect("/admin?error=link_fields");
  }

  const code = customCode || generateLinkCode(`${label}:${Date.now()}`);

  try {
    const db = getDb();
    await db.insert(dynamicLinks).values({
      code,
      label,
      targetUrl,
      category: categoryRaw ? (categoryRaw as ProductCategory) : null,
      active: true,
    });
  } catch {
    redirect("/admin?error=db");
  }
  revalidatePath("/admin");
  redirect("/admin?ok=link");
}

export async function updateLinkTargetAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const targetUrl = str(formData.get("targetUrl"));
  if (!id || !targetUrl) redirect("/admin?error=link_fields");
  try {
    const db = getDb();
    await db
      .update(dynamicLinks)
      .set({ targetUrl, updatedAt: new Date() })
      .where(eq(dynamicLinks.id, id));
  } catch {
    redirect("/admin?error=db");
  }
  revalidatePath("/admin");
  redirect("/admin?ok=link_updated");
}

export async function toggleLinkAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const active = str(formData.get("active")) === "true";
  if (!id) redirect("/admin?error=link_fields");
  try {
    const db = getDb();
    await db
      .update(dynamicLinks)
      .set({ active: !active, updatedAt: new Date() })
      .where(eq(dynamicLinks.id, id));
  } catch {
    redirect("/admin?error=db");
  }
  revalidatePath("/admin");
  redirect("/admin?ok=link_toggled");
}
