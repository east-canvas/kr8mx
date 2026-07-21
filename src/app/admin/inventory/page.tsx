import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listInventory } from "@/lib/admin/data";
import { adjustInventoryAction } from "../ops-actions";
import { Badge } from "@/components/ui/Badge";

const inputCls =
  "w-20 rounded-md border border-hairline bg-surface px-2 py-1 text-sm text-primary outline-none focus-visible:border-accent";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const rows = await listInventory();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display text-primary text-xl">Inventory</h2>
        <p className="mt-1 text-sm text-secondary">
          Variant stock. Inline adjustments are audit-logged. Low stock is
          highlighted.
        </p>
        {sp.ok ? <p className="mt-1 text-2xs text-secondary">Saved.</p> : null}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-2xs uppercase tracking-wide text-muted">
            <tr className="border-b border-hairline">
              <th className="py-2 pr-4">SKU</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">On hand</th>
              <th className="py-2 pr-4">Reserved</th>
              <th className="py-2">Adjust</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const onHand = r.onHand ?? 0;
              const low = onHand <= (r.restockThreshold ?? 0);
              return (
                <tr key={r.variantId} className="border-b border-hairline">
                  <td className="py-2 pr-4 text-primary">{r.sku}</td>
                  <td className="py-2 pr-4">
                    <Badge variant="outline">{r.status}</Badge>
                  </td>
                  <td className={`py-2 pr-4 ${low ? "text-strawberry" : "text-primary"}`}>
                    {onHand}
                    {low ? " · low" : ""}
                  </td>
                  <td className="py-2 pr-4 text-secondary">{r.reserved ?? 0}</td>
                  <td className="py-2">
                    <form action={adjustInventoryAction} className="flex items-center gap-2">
                      <input type="hidden" name="variantId" value={r.variantId} />
                      <input
                        name="onHand"
                        type="number"
                        min={0}
                        defaultValue={onHand}
                        className={inputCls}
                      />
                      <button className="rounded-sm border border-hairline px-2 py-1 text-2xs uppercase tracking-wide text-primary hover:border-secondary">
                        Set
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
