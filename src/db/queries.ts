import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "./client";
import {
  coaDocuments,
  dynamicLinks,
  orders,
  orderItems,
  productVariants,
} from "./schema";
import type {
  CoaDocument,
  DynamicLink,
  Order,
  OrderItem,
  ProductCategory,
} from "./schema";

/**
 * Read helpers. Each swallows a missing-DATABASE_URL (or transient) error and
 * returns an empty result so pages render a graceful empty state before the DB
 * is wired. Once DATABASE_URL is set these serve live data unchanged.
 */

export async function getPublishedCoas(
  category?: ProductCategory,
): Promise<CoaDocument[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(coaDocuments)
      .where(
        and(
          eq(coaDocuments.status, "published"),
          category ? eq(coaDocuments.category, category) : undefined,
        ),
      )
      .orderBy(desc(coaDocuments.issuedDate));
  } catch {
    return [];
  }
}

export async function getAllCoas(): Promise<CoaDocument[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(coaDocuments)
      .orderBy(desc(coaDocuments.createdAt));
  } catch {
    return [];
  }
}

export async function getDynamicLink(code: string): Promise<DynamicLink | null> {
  try {
    const db = getDb();
    const rows = await db
      .select()
      .from(dynamicLinks)
      .where(eq(dynamicLinks.code, code))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getAllDynamicLinks(): Promise<DynamicLink[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(dynamicLinks)
      .orderBy(desc(dynamicLinks.createdAt));
  } catch {
    return [];
  }
}

/** Resolve product_variant ids for a set of SKUs (for order_items FK). */
export async function getVariantIdsBySku(
  skus: string[],
): Promise<Map<string, number>> {
  if (skus.length === 0) return new Map();
  try {
    const db = getDb();
    const rows = await db
      .select({ id: productVariants.id, sku: productVariants.sku })
      .from(productVariants)
      .where(inArray(productVariants.sku, skus));
    return new Map(rows.map((r) => [r.sku, r.id]));
  } catch {
    return new Map();
  }
}

/** Fetch an order + its items by order number (for the confirmation page). */
export async function getOrderByNumber(
  orderNumber: string,
): Promise<{ order: Order; items: OrderItem[] } | null> {
  try {
    const db = getDb();
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1);
    if (!order) return null;
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    return { order, items };
  } catch {
    return null;
  }
}

/** Best-effort scan counter — never blocks the redirect. */
export async function incrementScanCount(code: string): Promise<void> {
  try {
    const db = getDb();
    await db
      .update(dynamicLinks)
      .set({ scanCount: sql`${dynamicLinks.scanCount} + 1` })
      .where(eq(dynamicLinks.code, code));
  } catch {
    /* ignore */
  }
}
