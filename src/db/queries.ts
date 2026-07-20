import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "./client";
import { coaDocuments, dynamicLinks } from "./schema";
import type { CoaDocument, DynamicLink, ProductCategory } from "./schema";

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
