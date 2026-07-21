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
  products,
} from "@/db/schema";
import type { Order, OrderStatus } from "@/db/schema";

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
