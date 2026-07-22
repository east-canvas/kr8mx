import "server-only";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  orders,
  orderItems,
  orderEvents,
  sentEmails,
  notifyList,
  shippingRestrictions,
  inventory,
  productVariants,
  productContent,
  productLines,
  products,
} from "@/db/schema";
import type {
  Flavor,
  Order,
  OrderStatus,
  ProductCategory,
  ProductContent,
} from "@/db/schema";
import { FLAVORS } from "@/db/seed-data";

export async function listOrders(opts: {
  status?: string;
  q?: string;
}): Promise<Order[]> {
  try {
    const db = getDb();
    const conds = [];
    if (opts.status && opts.status !== "all") {
      conds.push(eq(orders.status, opts.status as OrderStatus));
    }
    if (opts.q) {
      const like = `%${opts.q}%`;
      conds.push(or(ilike(orders.orderNumber, like), ilike(orders.email, like)));
    }
    return await db
      .select()
      .from(orders)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(100);
  } catch {
    return [];
  }
}

export async function getOrderDetail(orderId: number) {
  try {
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) return null;
    const [items, events, emails] = await Promise.all([
      db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
      db
        .select()
        .from(orderEvents)
        .where(eq(orderEvents.orderId, orderId))
        .orderBy(desc(orderEvents.createdAt)),
      db.select().from(sentEmails).where(eq(sentEmails.orderId, orderId)),
    ]);
    return { order, items, events, emails };
  } catch {
    return null;
  }
}

export async function getNotifyOverview() {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(notifyList)
      .orderBy(desc(notifyList.createdAt));
    const subscribed = rows.filter((r) => r.subscribed).length;
    const byVariant = await db
      .select({
        variantId: notifyList.variantId,
        count: sql<number>`count(*)::int`,
      })
      .from(notifyList)
      .where(eq(notifyList.subscribed, true))
      .groupBy(notifyList.variantId);
    return { rows, subscribed, unsubscribed: rows.length - subscribed, byVariant };
  } catch {
    return { rows: [], subscribed: 0, unsubscribed: 0, byVariant: [] };
  }
}

export async function listRestrictions() {
  try {
    const db = getDb();
    return await db
      .select()
      .from(shippingRestrictions)
      .orderBy(shippingRestrictions.category, shippingRestrictions.state);
  } catch {
    return [];
  }
}

export type EditorVariant = {
  variantId: number;
  sku: string;
  priceCents: number;
  status: string;
  packLabel: string;
};

export type EditorFlavor = {
  flavor: Flavor;
  content: ProductContent | null;
  variants: EditorVariant[];
};

function packLabel(cfg: unknown): string {
  const c = (cfg ?? {}) as Record<string, unknown>;
  if (typeof c.units === "number") return `${c.units}-pack`;
  if (c.kind === "tablet_container" && typeof c.tablets === "number") {
    return `${c.tablets}-tab container`;
  }
  if (c.kind === "blister" && typeof c.tablets === "number") {
    return `${c.tablets}-tab blister`;
  }
  return "variant";
}

/**
 * Everything the Products editor needs for one line: each flavor with its
 * editable content row (or null) and its priced variants. Grouped by flavor in
 * the canonical FLAVORS order. Empty on a missing DB so the page still renders.
 */
export async function listProductEditor(
  category: ProductCategory,
): Promise<EditorFlavor[]> {
  try {
    const db = getDb();
    const [variants, content] = await Promise.all([
      db
        .select({
          variantId: productVariants.id,
          sku: productVariants.sku,
          flavor: productVariants.flavor,
          priceCents: productVariants.priceCents,
          status: productVariants.status,
          packConfig: productVariants.packConfig,
        })
        .from(productVariants)
        .innerJoin(products, eq(products.id, productVariants.productId))
        .innerJoin(productLines, eq(productLines.id, products.lineId))
        .where(eq(productLines.slug, category))
        .orderBy(productVariants.flavor, productVariants.priceCents),
      db
        .select()
        .from(productContent)
        .where(eq(productContent.category, category)),
    ]);

    const contentByFlavor = new Map(content.map((r) => [r.flavor, r]));
    const variantsByFlavor = new Map<Flavor, EditorVariant[]>();
    for (const v of variants) {
      const list = variantsByFlavor.get(v.flavor) ?? [];
      list.push({
        variantId: v.variantId,
        sku: v.sku,
        priceCents: v.priceCents,
        status: v.status,
        packLabel: packLabel(v.packConfig),
      });
      variantsByFlavor.set(v.flavor, list);
    }

    return FLAVORS.map((flavor) => ({
      flavor,
      content: contentByFlavor.get(flavor) ?? null,
      variants: variantsByFlavor.get(flavor) ?? [],
    }));
  } catch {
    return [];
  }
}

export async function listInventory() {
  try {
    const db = getDb();
    return await db
      .select({
        variantId: productVariants.id,
        sku: productVariants.sku,
        status: productVariants.status,
        productName: products.name,
        onHand: inventory.onHand,
        reserved: inventory.reserved,
        restockThreshold: inventory.restockThreshold,
      })
      .from(productVariants)
      .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
      .leftJoin(products, eq(products.id, productVariants.productId))
      .orderBy(productVariants.sku);
  } catch {
    return [];
  }
}
