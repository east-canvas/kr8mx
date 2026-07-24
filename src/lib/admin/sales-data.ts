import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { salesReps, salesOrders, salesOrderItems } from "@/db/schema";
import type { SalesRep, SalesOrder, SalesOrderItem } from "@/db/schema";
import type { SalesOrderStatus } from "@/lib/sales/catalog";

export async function listSalesReps(
  opts: { activeOnly?: boolean } = {},
): Promise<SalesRep[]> {
  try {
    const db = getDb();
    return await db
      .select()
      .from(salesReps)
      .where(opts.activeOnly ? eq(salesReps.active, true) : undefined)
      .orderBy(desc(salesReps.active), salesReps.name);
  } catch {
    return [];
  }
}

export type SalesOrderRow = SalesOrder & { repName: string | null };

export async function listSalesOrders(
  opts: { status?: string; repId?: number } = {},
): Promise<SalesOrderRow[]> {
  try {
    const db = getDb();
    const conds = [];
    if (opts.status && opts.status !== "all") {
      conds.push(eq(salesOrders.status, opts.status as SalesOrderStatus));
    }
    if (opts.repId) conds.push(eq(salesOrders.repId, opts.repId));
    const rows = await db
      .select({
        order: salesOrders,
        repName: salesReps.name,
      })
      .from(salesOrders)
      .leftJoin(salesReps, eq(salesReps.id, salesOrders.repId))
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(salesOrders.createdAt))
      .limit(200);
    return rows.map((r) => ({ ...r.order, repName: r.repName }));
  } catch {
    return [];
  }
}

export type SalesStats = {
  total: number;
  byStatus: Record<string, number>;
  openBottles: number;
};

/** Dashboard counters. "Open" = not paid/submitted/cancelled (needs action). */
export async function salesStats(): Promise<SalesStats> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        status: salesOrders.status,
        count: sql<number>`count(*)::int`,
        bottles: sql<number>`coalesce(sum(${salesOrders.totalBottles}),0)::int`,
      })
      .from(salesOrders)
      .groupBy(salesOrders.status);
    const byStatus: Record<string, number> = {};
    let total = 0;
    let openBottles = 0;
    for (const r of rows) {
      byStatus[r.status] = r.count;
      total += r.count;
      if (r.status === "new" || r.status === "invoiced") openBottles += r.bottles;
    }
    return { total, byStatus, openBottles };
  } catch {
    return { total: 0, byStatus: {}, openBottles: 0 };
  }
}

export async function getSalesOrder(id: number): Promise<
  | {
      order: SalesOrder;
      rep: SalesRep | null;
      items: SalesOrderItem[];
    }
  | null
> {
  try {
    const db = getDb();
    const [order] = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.id, id))
      .limit(1);
    if (!order) return null;
    const [items, rep] = await Promise.all([
      db.select().from(salesOrderItems).where(eq(salesOrderItems.orderId, id)),
      order.repId
        ? db
            .select()
            .from(salesReps)
            .where(eq(salesReps.id, order.repId))
            .limit(1)
            .then((r) => r[0] ?? null)
        : Promise.resolve(null),
    ]);
    return { order, rep, items };
  } catch {
    return null;
  }
}
