import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listSalesReps } from "@/lib/admin/sales-data";
import { createSalesOrderAction } from "../../sales-actions";
import { salesCatalog, SALES_BRANDS, CASE_BOTTLES } from "@/lib/sales/catalog";

const inputCls =
  "w-full rounded-md border border-hairline bg-bg px-3 py-2 text-sm text-primary outline-none transition-colors focus-visible:border-accent";
const labelCls = "text-2xs font-medium uppercase tracking-wide text-secondary";
const legendCls = "px-2 text-2xs font-medium uppercase tracking-wide text-secondary";

const ERRORS: Record<string, string> = {
  company: "Company name is required.",
  empty: "Add at least one product quantity.",
  db: "Database unavailable. Set DATABASE_URL and apply the sales migration.",
};

// Full state name -> USPS code, to map a lead's location onto the ship-state field.
const STATE_ABBR: Record<string, string> = {
  Alabama: "AL", Alaska: "AK", Arizona: "AZ", Arkansas: "AR", California: "CA",
  Colorado: "CO", Connecticut: "CT", Delaware: "DE", Florida: "FL", Georgia: "GA",
  Hawaii: "HI", Idaho: "ID", Illinois: "IL", Indiana: "IN", Iowa: "IA",
  Kansas: "KS", Kentucky: "KY", Louisiana: "LA", Maine: "ME", Maryland: "MD",
  Massachusetts: "MA", Michigan: "MI", Minnesota: "MN", Mississippi: "MS",
  Missouri: "MO", Montana: "MT", Nebraska: "NE", Nevada: "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", Ohio: "OH", Oklahoma: "OK",
  Oregon: "OR", Pennsylvania: "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", Tennessee: "TN", Texas: "TX", Utah: "UT", Vermont: "VT",
  Virginia: "VA", Washington: "WA", "West Virginia": "WV", Wisconsin: "WI",
  Wyoming: "WY",
};

export default async function NewSalesOrderPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    company?: string;
    contact?: string;
    email?: string;
    phone?: string;
    location?: string;
  }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const reps = await listSalesReps({ activeOnly: true });
  const catalog = salesCatalog();

  const prefill = {
    company: sp.company ?? "",
    contact: sp.contact ?? "",
    email: sp.email ?? "",
    phone: sp.phone ?? "",
  };
  const prefillState = sp.location ? (STATE_ABBR[sp.location] ?? "") : "";
  const fromLead = Boolean(
    prefill.company || prefill.contact || prefill.email || prefill.phone,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/sales"
          className="text-2xs uppercase tracking-wide text-muted hover:text-primary"
        >
          &larr; Sales
        </Link>
        <h2 className="type-display mt-2 text-primary text-2xl">New order</h2>
        <p className="mt-1.5 text-sm text-secondary">
          Enter the account, pick a rep, and set case quantities per flavor. A
          case is {CASE_BOTTLES} bottles. Price is optional while pricing is TBD.
        </p>
      </div>

      {sp.error ? (
        <p className="rounded-md border border-strawberry/50 bg-strawberry/10 px-4 py-2.5 text-sm font-medium text-strawberry">
          {ERRORS[sp.error] ?? "Please check the form."}
        </p>
      ) : null}

      {fromLead ? (
        <p className="rounded-md border border-[#6C2FB0]/40 bg-[#6C2FB0]/10 px-4 py-2.5 text-sm font-medium text-primary">
          Prefilled from a lead. Review the account details, then set quantities.
        </p>
      ) : null}

      <form action={createSalesOrderAction} className="flex flex-col gap-6">
        {/* account */}
        <fieldset className="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-5">
          <legend className={legendCls}>Account</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Company *</span>
              <input
                name="company"
                required
                defaultValue={prefill.company}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Sales rep</span>
              <select name="repId" className={inputCls} defaultValue="">
                <option value="">Unassigned</option>
                {reps.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.code ? ` (${r.code})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Contact name</span>
              <input
                name="contactName"
                defaultValue={prefill.contact}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Email</span>
              <input
                name="email"
                type="email"
                defaultValue={prefill.email}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Phone</span>
              <input name="phone" defaultValue={prefill.phone} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>Ship address</span>
              <input name="shipAddress" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1">
              <span className={labelCls}>City</span>
              <input name="shipCity" className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className={labelCls}>State</span>
                <input
                  name="shipState"
                  maxLength={2}
                  defaultValue={prefillState}
                  className={inputCls}
                  placeholder="FL"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className={labelCls}>ZIP</span>
                <input name="shipZip" className={inputCls} />
              </label>
            </div>
          </div>
        </fieldset>

        {/* products */}
        {SALES_BRANDS.map((brand) => (
          <fieldset key={brand} className="rounded-xl border border-hairline bg-surface p-5">
            <legend className={legendCls}>{brand}</legend>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-2xs font-medium uppercase tracking-wide text-secondary">
                  <tr className="border-b border-hairline">
                    <th className="py-2 pr-4">Flavor</th>
                    <th className="py-2 pr-4">Qty</th>
                    <th className="py-2 pr-4">Unit</th>
                    <th className="py-2">Unit price ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {catalog
                    .filter((p) => p.brand === brand)
                    .map((p) => (
                      <tr key={p.sku} className="border-b border-hairline">
                        <td className="py-2 pr-4 text-primary">{p.flavor}</td>
                        <td className="py-2 pr-4">
                          <input
                            name={`qty_${p.sku}`}
                            type="number"
                            min={0}
                            placeholder="0"
                            className="w-20 rounded-md border border-hairline bg-bg px-3 py-1.5 text-sm text-primary outline-none focus-visible:border-accent"
                          />
                        </td>
                        <td className="py-2 pr-4">
                          <select
                            name={`unit_${p.sku}`}
                            defaultValue="case"
                            className="rounded-md border border-hairline bg-bg px-3 py-1.5 text-sm text-primary"
                          >
                            <option value="case">Case ({CASE_BOTTLES})</option>
                            <option value="bottle">Bottle</option>
                          </select>
                        </td>
                        <td className="py-2">
                          <input
                            name={`price_${p.sku}`}
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="optional"
                            className="w-28 rounded-md border border-hairline bg-bg px-3 py-1.5 text-sm text-primary outline-none focus-visible:border-accent"
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </fieldset>
        ))}

        <label className="flex flex-col gap-1">
          <span className={labelCls}>Notes</span>
          <textarea name="notes" rows={2} className={inputCls} placeholder="PO #, terms, special instructions" />
        </label>

        <div>
          <button className="rounded-sm border border-accent bg-accent px-6 py-2.5 text-xs font-medium uppercase tracking-wide text-accent-contrast hover:opacity-90">
            Create order
          </button>
        </div>
      </form>
    </div>
  );
}
