import Image from "next/image";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listProductEditor } from "@/lib/admin/data";
import { FLAVOR_META } from "@/lib/catalog";
import {
  saveProductContentAction,
  removeProductImageAction,
  updateVariantPriceAction,
} from "../product-actions";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Flavor } from "@/db/schema";

type Folder = "drinks" | "tablets";
const FOLDERS: Folder[] = ["drinks", "tablets"];

const inputCls =
  "w-full rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-primary outline-none focus-visible:border-accent";
const labelCls = "text-2xs uppercase tracking-wide text-muted";

function dollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; ok?: string; error?: string }>;
}) {
  const store = await cookies();
  if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) return null;
  const sp = await searchParams;
  const folder: Folder = sp.folder === "tablets" ? "tablets" : "drinks";

  const rows = await listProductEditor(folder);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display text-primary text-xl">Products</h2>
        <p className="mt-1 text-sm text-secondary">
          Edit the images, names, copy, and prices shown on the storefront.
          Changes publish live to{" "}
          <span className="text-primary">
            /{folder === "drinks" ? "drinks" : "drinks & home"}
          </span>
          . No image → the branded silhouette is shown.
        </p>
      </div>

      {sp.ok ? (
        <p className="rounded-md border border-hairline px-4 py-2 text-sm text-secondary">
          {sp.ok === "image"
            ? "Image updated."
            : sp.ok === "price"
              ? "Price saved."
              : "Saved."}
        </p>
      ) : null}
      {sp.error ? (
        <p className="rounded-md border border-strawberry/40 px-4 py-2 text-sm text-strawberry">
          {sp.error === "db"
            ? "Database unavailable — set DATABASE_URL to persist changes."
            : "Please check the fields and try again."}
        </p>
      ) : null}

      {/* folder tabs */}
      <div className="flex gap-2">
        {FOLDERS.map((f) => (
          <a
            key={f}
            href={`/admin/products?folder=${f}`}
            className={cn(
              "rounded-md border px-4 py-2 text-sm capitalize transition-colors",
              f === folder
                ? "border-primary bg-primary text-bg"
                : "border-hairline text-secondary hover:border-secondary",
            )}
          >
            {f}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-hairline px-4 py-10 text-center text-sm text-muted">
          No products found for this line. Connect the database (DATABASE_URL)
          and seed the catalog to edit content here.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row) => {
            const flavor = row.flavor as Flavor;
            const meta = FLAVOR_META[flavor];
            const c = row.content;
            const accent = c?.accentHex || meta.hex;
            return (
              <li
                key={flavor}
                id={flavor}
                className="scroll-mt-24 rounded-lg border border-hairline p-4"
              >
                <div className="flex flex-col gap-5 md:flex-row">
                  {/* image column */}
                  <div className="flex w-full flex-col gap-3 md:w-56 md:shrink-0">
                    <div
                      className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md border border-hairline"
                      style={{
                        background: `radial-gradient(90% 90% at 50% 25%, ${accent}22, transparent 65%)`,
                      }}
                    >
                      {c?.imageUrl ? (
                        <Image
                          src={c.imageUrl}
                          alt={`${meta.name} product image`}
                          fill
                          sizes="224px"
                          className="object-contain p-3"
                        />
                      ) : (
                        <span className="px-4 text-center text-2xs text-muted">
                          No image — silhouette shown on storefront
                        </span>
                      )}
                    </div>
                    <ProductImageUpload
                      category={folder}
                      flavor={flavor}
                      hasImage={Boolean(c?.imageUrl)}
                    />
                    {c?.imageUrl ? (
                      <form action={removeProductImageAction}>
                        <input type="hidden" name="category" value={folder} />
                        <input type="hidden" name="flavor" value={flavor} />
                        <button className="text-2xs uppercase tracking-wide text-strawberry transition-opacity hover:opacity-70">
                          Remove image
                        </button>
                      </form>
                    ) : null}
                  </div>

                  {/* content column */}
                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-primary">{meta.name}</span>
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-hairline"
                        style={{ background: accent }}
                        aria-hidden
                      />
                      <Badge variant="outline">{flavor.replace("_", " ")}</Badge>
                    </div>

                    <form
                      action={saveProductContentAction}
                      className="flex flex-col gap-3"
                    >
                      <input type="hidden" name="category" value={folder} />
                      <input type="hidden" name="flavor" value={flavor} />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1">
                          <span className={labelCls}>Display name</span>
                          <input
                            name="name"
                            defaultValue={c?.name ?? ""}
                            placeholder={meta.name}
                            className={inputCls}
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          <span className={labelCls}>Accent color (hex)</span>
                          <input
                            name="accentHex"
                            defaultValue={c?.accentHex ?? ""}
                            placeholder={meta.hex}
                            className={inputCls}
                          />
                        </label>
                      </div>

                      <label className="flex flex-col gap-1">
                        <span className={labelCls}>Tagline / eyebrow</span>
                        <input
                          name="tagline"
                          defaultValue={c?.tagline ?? ""}
                          placeholder="Energy Drink"
                          className={inputCls}
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className={labelCls}>Description</span>
                        <textarea
                          name="description"
                          rows={2}
                          defaultValue={c?.description ?? ""}
                          placeholder="Short marketing copy shown on the product page."
                          className={cn(inputCls, "resize-y")}
                        />
                      </label>

                      <div>
                        <button className="rounded-sm border border-primary px-4 py-2 text-2xs uppercase tracking-wide text-primary hover:bg-primary hover:text-bg">
                          Save details
                        </button>
                      </div>
                    </form>

                    {/* variant prices */}
                    {row.variants.length ? (
                      <div className="flex flex-col gap-2 border-t border-hairline pt-3">
                        <span className={labelCls}>Prices</span>
                        <div className="flex flex-col gap-2">
                          {row.variants.map((v) => (
                            <form
                              key={v.variantId}
                              action={updateVariantPriceAction}
                              className="flex flex-wrap items-center gap-2"
                            >
                              <input type="hidden" name="category" value={folder} />
                              <input
                                type="hidden"
                                name="variantId"
                                value={v.variantId}
                              />
                              <span className="min-w-0 flex-1 truncate text-2xs text-secondary">
                                {v.packLabel}
                                <span className="text-muted"> · {v.sku}</span>
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-2xs text-muted">$</span>
                                <input
                                  name="price"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  defaultValue={dollars(v.priceCents)}
                                  className="w-24 rounded-md border border-hairline bg-surface px-3 py-1.5 text-sm text-primary outline-none focus-visible:border-accent"
                                />
                              </div>
                              <button className="rounded-sm border border-hairline px-3 py-1.5 text-2xs uppercase tracking-wide text-primary hover:border-secondary">
                                Save
                              </button>
                            </form>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
