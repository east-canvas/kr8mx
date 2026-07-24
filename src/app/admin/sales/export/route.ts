import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listSalesOrders, getSalesOrder } from "@/lib/admin/sales-data";
import { ordersToCsv, orderItemsToCsv } from "@/lib/sales/format";

/**
 * CSV export for the sales order book. With ?id= it returns one order's line
 * items (for importing into another platform); otherwise a summary of all
 * orders. Admin-only.
 */
export async function GET(request: Request): Promise<Response> {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) {
    return new Response("Not authorized", { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");

  if (id) {
    const data = await getSalesOrder(Number(id));
    if (!data) return new Response("Not found", { status: 404 });
    const csv = orderItemsToCsv(data.items);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${data.order.orderNumber}.csv"`,
      },
    });
  }

  const rows = await listSalesOrders();
  const csv = ordersToCsv(rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-orders.csv"`,
    },
  });
}
