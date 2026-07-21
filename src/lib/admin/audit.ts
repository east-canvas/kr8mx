import "server-only";
import { getDb } from "@/db/client";
import { auditLog } from "@/db/schema";

/** Append an audit-log row (actor + before/after). Best-effort; never throws. */
export async function logAudit(args: {
  actor?: string;
  entity: string;
  entityId?: string | number;
  action: string;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  try {
    const db = getDb();
    await db.insert(auditLog).values({
      actor: args.actor ?? "admin",
      entity: args.entity,
      entityId: args.entityId == null ? null : String(args.entityId),
      action: args.action,
      before: args.before ?? null,
      after: args.after ?? null,
    });
  } catch {
    /* ignore — audit must not break the operation it records */
  }
}
