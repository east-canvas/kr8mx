import { cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { notifyList } from "@/db/schema";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { notifyListToCsv } from "@/lib/admin/csv";

/** Admin-only CSV export of the notify list. */
export async function GET(): Promise<Response> {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) {
    return new Response("Not authorized", { status: 401 });
  }
  let rows: Awaited<ReturnType<typeof getRows>> = [];
  try {
    rows = await getRows();
  } catch {
    rows = [];
  }
  const csv = notifyListToCsv(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kr8mx-notify-list.csv"',
      "Cache-Control": "no-store",
    },
  });
}

async function getRows() {
  const db = getDb();
  return db
    .select({
      email: notifyList.email,
      variantId: notifyList.variantId,
      subscribed: notifyList.subscribed,
      createdAt: notifyList.createdAt,
    })
    .from(notifyList)
    .orderBy(desc(notifyList.createdAt));
}
