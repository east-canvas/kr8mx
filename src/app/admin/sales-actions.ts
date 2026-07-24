"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { salesReps, salesOrders, salesOrderItems } from "@/db/schema";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { logAudit } from "@/lib/admin/audit";
import {
  salesCatalog,
  bottlesPerUnit,
  generateSalesOrderNumber,
  SALES_ORDER_STATUSES,
  type SalesOrderStatus,
  type SalesUnit,
} from "@/lib/sales/catalog";

async function assertAuthed() {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) redirect("/admin");
}
const str = (v: FormDataEntryValue | null) => (v ?? "").toString().trim();
const nullable = (v: string) => (v.length ? v : null);

function deriveCode(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (initials || name.slice(0, 3)).toUpperCase().slice(0, 16);
}

/* --------------------------------------------------------------- reps ----- */

export async function createRepAction(formData: FormData) {
  await assertAuthed();
  const name = str(formData.get("name"));
  if (!name) redirect("/admin/sales/reps?error=fields");
  const code = str(formData.get("code")) || deriveCode(name);
  try {
    const db = getDb();
    const [rep] = await db
      .insert(salesReps)
      .values({
        name,
        email: nullable(str(formData.get("email"))),
        phone: nullable(str(formData.get("phone"))),
        code,
      })
      .returning();
    await logAudit({ entity: "sales_rep", entityId: rep?.id, action: "create", after: rep });
  } catch {
    redirect("/admin/sales/reps?error=db");
  }
  revalidatePath("/admin/sales/reps");
  redirect("/admin/sales/reps?ok=added");
}

export async function updateRepAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const name = str(formData.get("name"));
  if (!id || !name) redirect("/admin/sales/reps?error=fields");
  const active = str(formData.get("active")) === "true";
  try {
    const db = getDb();
    await db
      .update(salesReps)
      .set({
        name,
        email: nullable(str(formData.get("email"))),
        phone: nullable(str(formData.get("phone"))),
        code: str(formData.get("code")) || deriveCode(name),
        active,
      })
      .where(eq(salesReps.id, id));
    await logAudit({ entity: "sales_rep", entityId: id, action: "update" });
  } catch {
    redirect("/admin/sales/reps?error=db");
  }
  revalidatePath("/admin/sales/reps");
  redirect("/admin/sales/reps?ok=saved");
}

export async function toggleRepAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const active = str(formData.get("active")) === "true";
  if (!id) redirect("/admin/sales/reps?error=fields");
  try {
    const db = getDb();
    await db.update(salesReps).set({ active: !active }).where(eq(salesReps.id, id));
  } catch {
    redirect("/admin/sales/reps?error=db");
  }
  revalidatePath("/admin/sales/reps");
  redirect("/admin/sales/reps?ok=saved");
}

/* -------------------------------------------------------------- orders ---- */

/** Parse a dollars string to integer cents; blank/invalid becomes 0. */
function toCents(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

export async function createSalesOrderAction(formData: FormData) {
  await assertAuthed();
  const company = str(formData.get("company"));
  if (!company) redirect("/admin/sales/new?error=company");

  const repRaw = str(formData.get("repId"));
  const repId = repRaw ? Number(repRaw) : null;

  // Build line items from the product grid: only rows with quantity > 0.
  const items = [];
  let subtotalCents = 0;
  let totalBottles = 0;
  for (const p of salesCatalog()) {
    const qty = Number(str(formData.get(`qty_${p.sku}`)));
    if (!Number.isInteger(qty) || qty <= 0) continue;
    const unit = (str(formData.get(`unit_${p.sku}`)) === "bottle"
      ? "bottle"
      : "case") as SalesUnit;
    const bpu = bottlesPerUnit(unit);
    const bottles = qty * bpu;
    const unitPriceCents = toCents(str(formData.get(`price_${p.sku}`)));
    const lineTotalCents = unitPriceCents * qty;
    subtotalCents += lineTotalCents;
    totalBottles += bottles;
    items.push({
      brand: p.brand,
      flavor: p.flavor,
      sku: p.sku,
      unit,
      bottlesPerUnit: bpu,
      quantity: qty,
      bottles,
      unitPriceCents,
      lineTotalCents,
    });
  }

  if (items.length === 0) redirect("/admin/sales/new?error=empty");

  const orderNumber = generateSalesOrderNumber();
  try {
    const db = getDb();
    const [order] = await db
      .insert(salesOrders)
      .values({
        orderNumber,
        repId,
        status: "new",
        company,
        contactName: nullable(str(formData.get("contactName"))),
        email: nullable(str(formData.get("email"))),
        phone: nullable(str(formData.get("phone"))),
        shipAddress: nullable(str(formData.get("shipAddress"))),
        shipCity: nullable(str(formData.get("shipCity"))),
        shipState: nullable(str(formData.get("shipState")).toUpperCase().slice(0, 2)),
        shipZip: nullable(str(formData.get("shipZip"))),
        notes: nullable(str(formData.get("notes"))),
        subtotalCents,
        totalBottles,
      })
      .returning({ id: salesOrders.id });

    await db.insert(salesOrderItems).values(
      items.map((it) => ({ ...it, orderId: order.id })),
    );
    await logAudit({
      entity: "sales_order",
      entityId: order.id,
      action: "create",
      after: { orderNumber, company, totalBottles, subtotalCents, lines: items.length },
    });
    revalidatePath("/admin/sales");
    redirect(`/admin/sales/${order.id}?ok=created`);
  } catch (err) {
    // redirect() throws NEXT_REDIRECT; let it pass through.
    if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
    redirect("/admin/sales/new?error=db");
  }
}

export async function updateSalesOrderStatusAction(formData: FormData) {
  await assertAuthed();
  const id = Number(str(formData.get("id")));
  const status = str(formData.get("status")) as SalesOrderStatus;
  if (!id || !SALES_ORDER_STATUSES.includes(status)) {
    redirect(`/admin/sales/${id || ""}?error=fields`);
  }
  try {
    const db = getDb();
    const [before] = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, id))
      .limit(1);
    await db
      .update(salesOrders)
      .set({ status, updatedAt: new Date() })
      .where(eq(salesOrders.id, id));
    await logAudit({
      entity: "sales_order",
      entityId: id,
      action: "status_change",
      before: before ? { status: before.status } : undefined,
      after: { status },
    });
  } catch {
    redirect(`/admin/sales/${id}?error=db`);
  }
  revalidatePath("/admin/sales");
  revalidatePath(`/admin/sales/${id}`);
  redirect(`/admin/sales/${id}?ok=status`);
}
