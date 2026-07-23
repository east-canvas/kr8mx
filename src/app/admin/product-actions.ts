"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { getDb } from "@/db/client";
import { productContent, productVariants } from "@/db/schema";
import type { Flavor, ProductCategory } from "@/db/schema";
import { FLAVORS } from "@/db/seed-data";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";

async function assertAuthed() {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) redirect("/admin");
}

const str = (v: FormDataEntryValue | null) => (v ?? "").toString().trim();
const nullable = (v: string) => (v.length ? v : null);

function normCategory(v: string): ProductCategory {
  return v === "tablets" ? "tablets" : "drinks";
}
function isFlavor(v: string): v is Flavor {
  return (FLAVORS as readonly string[]).includes(v);
}

/** Upsert a (category, flavor) content row and revalidate the storefront. */
async function upsertContent(
  category: ProductCategory,
  flavor: Flavor,
  set: Partial<{
    name: string | null;
    tagline: string | null;
    description: string | null;
    accentHex: string | null;
    imageUrl: string | null;
  }>,
) {
  const db = getDb();
  const [before] = await db
    .select()
    .from(productContent)
    .where(
      and(
        eq(productContent.category, category),
        eq(productContent.flavor, flavor),
      ),
    )
    .limit(1);

  const [after] = await db
    .insert(productContent)
    .values({ category, flavor, ...set, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [productContent.category, productContent.flavor],
      set: { ...set, updatedAt: new Date() },
    })
    .returning();

  await logAudit({
    entity: "product_content",
    entityId: after?.id,
    action: before ? "update" : "create",
    before,
    after,
  });
}

function revalidateStorefront(category: ProductCategory, flavorSlug: string) {
  revalidatePath("/admin/products");
  const base = category === "drinks" ? "/drinks" : "/tablets";
  revalidatePath(base);
  revalidatePath(`${base}/${flavorSlug}`);
}

/** Save the marketing fields (name / tagline / description / accent) for a flavor. */
export async function saveProductContentAction(formData: FormData) {
  await assertAuthed();
  const category = normCategory(str(formData.get("category")));
  const flavorRaw = str(formData.get("flavor"));
  if (!isFlavor(flavorRaw)) redirect(`/admin/products?folder=${category}&error=fields`);
  const flavor = flavorRaw;

  const accentRaw = str(formData.get("accentHex"));
  // Accept only a hex color; ignore anything else so bad input can't break the page style.
  const accentHex = /^#([0-9a-fA-F]{3,8})$/.test(accentRaw) ? accentRaw : null;

  try {
    await upsertContent(category, flavor, {
      name: nullable(str(formData.get("name"))),
      tagline: nullable(str(formData.get("tagline"))),
      description: nullable(str(formData.get("description"))),
      accentHex,
    });
  } catch {
    redirect(`/admin/products?folder=${category}&error=db`);
  }
  revalidateStorefront(category, flavor.replace("_", "-"));
  redirect(`/admin/products?folder=${category}&ok=saved#${flavor}`);
}

/**
 * Persist an uploaded image URL for a flavor. Called from the client uploader
 * after the file lands in Vercel Blob. Removes the previously stored image.
 */
export async function setProductImageAction(formData: FormData) {
  await assertAuthed();
  const category = normCategory(str(formData.get("category")));
  const flavorRaw = str(formData.get("flavor"));
  const imageUrl = str(formData.get("imageUrl"));
  if (!isFlavor(flavorRaw) || !imageUrl) {
    redirect(`/admin/products?folder=${category}&error=fields`);
  }
  const flavor = flavorRaw;

  try {
    const db = getDb();
    const [prev] = await db
      .select()
      .from(productContent)
      .where(
        and(
          eq(productContent.category, category),
          eq(productContent.flavor, flavor),
        ),
      )
      .limit(1);

    await upsertContent(category, flavor, { imageUrl });

    // Best-effort cleanup of the replaced image (only our Blob URLs).
    const old = prev?.imageUrl;
    if (old && old !== imageUrl && old.includes(".public.blob.vercel-storage.com")) {
      try {
        await del(old);
      } catch {
        /* ignore — the new URL is what matters */
      }
    }
  } catch {
    redirect(`/admin/products?folder=${category}&error=db`);
  }
  revalidateStorefront(category, flavor.replace("_", "-"));
  redirect(`/admin/products?folder=${category}&ok=image#${flavor}`);
}

/** Clear a flavor's image (revert to the CanSilhouette) and delete the Blob file. */
export async function removeProductImageAction(formData: FormData) {
  await assertAuthed();
  const category = normCategory(str(formData.get("category")));
  const flavorRaw = str(formData.get("flavor"));
  if (!isFlavor(flavorRaw)) redirect(`/admin/products?folder=${category}&error=fields`);
  const flavor = flavorRaw;

  try {
    const db = getDb();
    const [prev] = await db
      .select()
      .from(productContent)
      .where(
        and(
          eq(productContent.category, category),
          eq(productContent.flavor, flavor),
        ),
      )
      .limit(1);

    await upsertContent(category, flavor, { imageUrl: null });

    const old = prev?.imageUrl;
    if (old && old.includes(".public.blob.vercel-storage.com")) {
      try {
        await del(old);
      } catch {
        /* ignore */
      }
    }
  } catch {
    redirect(`/admin/products?folder=${category}&error=db`);
  }
  revalidateStorefront(category, flavor.replace("_", "-"));
  redirect(`/admin/products?folder=${category}&ok=image#${flavor}`);
}

/** Set a variant's price. Input is dollars; stored as integer cents. Audit-logged. */
export async function updateVariantPriceAction(formData: FormData) {
  await assertAuthed();
  const category = normCategory(str(formData.get("category")));
  const variantId = Number(str(formData.get("variantId")));
  const dollars = Number(str(formData.get("price")));
  if (!variantId || !Number.isFinite(dollars) || dollars < 0) {
    redirect(`/admin/products?folder=${category}&error=fields`);
  }
  const priceCents = Math.round(dollars * 100);

  try {
    const db = getDb();
    const [before] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1);
    const [after] = await db
      .update(productVariants)
      .set({ priceCents })
      .where(eq(productVariants.id, variantId))
      .returning();
    await logAudit({
      entity: "product_variant",
      entityId: variantId,
      action: "price_update",
      before,
      after,
    });
  } catch {
    redirect(`/admin/products?folder=${category}&error=db`);
  }
  // Prices show on the collection + PDP (and are re-priced server-side at checkout).
  revalidatePath("/admin/products");
  revalidatePath(category === "drinks" ? "/drinks" : "/tablets");
  redirect(`/admin/products?folder=${category}&ok=price`);
}
