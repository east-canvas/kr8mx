import { cookies } from "next/headers";
import { desc } from "drizzle-orm";
import { getDb } from "@/db/client";
import { leads } from "@/db/schema";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { leadsToCsv } from "@/lib/admin/csv";

/** Admin-only CSV export of the leads pipeline. */
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
  const csv = leadsToCsv(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="kr8mx-leads.csv"',
      "Cache-Control": "no-store",
    },
  });
}

async function getRows() {
  const db = getDb();
  return db
    .select({
      createdAt: leads.createdAt,
      type: leads.type,
      status: leads.status,
      name: leads.name,
      email: leads.email,
      company: leads.company,
      phone: leads.phone,
      message: leads.message,
    })
    .from(leads)
    .orderBy(desc(leads.createdAt));
}
