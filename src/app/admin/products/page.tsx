import Image from "next/image";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";
import { listProductEditor } from "@/lib/admin/data";
import { FLAVOR_META } from "@/lib/catalog";
import { defaultCopy } from "@/lib/product-copy";
import {
  saveProductContentAction,
  removeProductImageAction,
  updateVariantPriceAction,
  updateVariantStatusAction,
} from "../product-actions";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { Flavor } from "@/db/schema";

type Folder = "tablets" | "drinks";
const FOLDERS: Folder[] = ["tablets", "drinks"];

const inputCls =
  "w-full rounded-md border border-hairline bg-bg px-3 py-2 text-sm text-primary outline-none transition-colors focus-visible:border-accent";
const labelCls = "text-2xs font-medium uppercase tracking-wide text-secondary";
const saveBtn =
  "rounded-md bg-accent px-4 py-2 text-2xs font-semibold uppercase tracking-wide text-accent-contrast transition-opacity hover:opacity-90";

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
  const folder: Folder = sp.folder === "drinks" ? "drinks" : "tablets";

  const rows = await listProductEditor(folder);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="type-display text-primary text-2xl">Products</h2>
        <p className="mt-1.5 text-sm text-secondary">
          Manage the images, names, copy, prices, and availability shown on the
          storefront. Changes publish live to{" "}
          <span className="font-medium text-primary">/{folder}</span>.
        </p>
      </div>

      {sp.ok ? (
        <p className="rounded-md border border-[#6C2FB0]/40 bg-[#6C2FB0]/10 px-4 py-2.5 text-sm font-medium text-primary">
          {sp.ok === "image"
            ? "Image updated."
            : sp.ok === "price"
              ? "Price saved."
              : sp.ok === "status"
                ? "Availability updated."
                : "Saved."}
        </p>
      ) : null}
      {sp.error ? (
        <p className="rounded-md border border-strawberry/50 bg-strawberry/10 px-4 py-2.5 text-sm font-medium text-strawberry">
          {sp.error === "db"
            ? "Database unavailable, set DATABASE_URL to persist changes."
            : "Please check the fields and try again."}
        </p>
      ) : null}

      {/* line tabs */}
      <div className="flex gap-2">
        {FOLDERS.map((f) => (
          <a
            key={f}
            href={`/admin/products?folder=${f}`}
            className={cn(
              "rounded-md border px-4 py-2 text-sm font-medium capitalize transition-colors",
              f === folder
                ? "border-primary bg-primary text-bg"
                : "border-hairline text-secondary hover:border-primary hover:text-primary",
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
        <>
          {/* quick jump */}
          <div className="flex flex-wrap items-center gap-2 border-y border-hairline py-3">
            <span className="text-2xs uppercase tracking-wide text-muted">
              Jump to
            </span>
            {rows.map((row) => {
              const meta = FLAVOR_META[row.flavor as Flavor];
              const accent = row.content?.accentHex || meta.hex;
              return (
                <a
                  key={row.flavor}
                  href={`#${row.flavor}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1 text-2xs font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: accent }}
                    aria-hidden
                  />
                  {meta.name}
                </a>
              );
            })}
          </div>

          <ul className="flex flex-col gap-5">
            {rows.map((row) => {
              const flavor = row.flavor as Flavor;
              const meta = FLAVOR_META[flavor];
              const c = row.content;
              const accent = c?.accentHex || meta.hex;
              const copy = defaultCopy(folder, flavor);
              return (
                <li
                  key={flavor}
                  id={flavor}
                  className="scroll-mt-24 overflow-hidden rounded-xl border border-hairline border-l-[3px] bg-surface"
                  style={{ borderLeftColor: accent }}
                >
                  <div className="flex flex-col gap-6 p-5 md:flex-row">
                    {/* image column */}
                    <div className="flex w-full flex-col gap-3 md:w-52 md:shrink-0">
                      <div
                        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-hairline"
                        style={{
                          background: `radial-gradient(90% 90% at 50% 25%, ${accent}22, transparent 65%)`,
                        }}
                      >
                        {c?.imageUrl ? (
                          <Image
                            src={c.imageUrl}
                            alt={`${meta.name} product image`}
                            fill
                            sizes="208px"
                            className="object-contain p-3"
                          />
                        ) : (
                          <span className="px-4 text-center text-2xs text-muted">
                            No custom image. The default{" "}
                            {folder === "drinks" ? "can" : "silhouette"} shows on
                            the storefront.
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
                          <button className="text-2xs font-medium uppercase tracking-wide text-strawberry transition-opacity hover:opacity-70">
                            Remove image
                          </button>
                        </form>
                      ) : null}
                    </div>

                    {/* content column */}
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-base font-semibold text-primary">
                          {meta.name}
                        </span>
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full border border-hairline"
                          style={{ background: accent }}
                          aria-hidden
                        />
                        <Badge variant="outline">
                          {flavor.replace("_", " ")}
                        </Badge>
                      </div>

                      <form
                        action={saveProductContentAction}
                        className="flex flex-col gap-3"
                      >
                        <input type="hidden" name="category" value={folder} />
                        <input type="hidden" name="flavor" value={flavor} />

                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="flex flex-col gap-1.5">
                            <span className={labelCls}>Display name</span>
                            <input
                              name="name"
                              defaultValue={c?.name ?? ""}
                              placeholder={meta.name}
                              className={inputCls}
                            />
                          </label>
                          <label className="flex flex-col gap-1.5">
                            <span className={labelCls}>Accent color (hex)</span>
                            <div className="flex items-center gap-2">
                              <span
                                className="h-9 w-9 shrink-0 rounded-md border border-hairline"
                                style={{ background: accent }}
                                aria-hidden
                              />
                              <input
                                name="accentHex"
                                defaultValue={c?.accentHex ?? ""}
                                placeholder={meta.hex}
                                className={inputCls}
                              />
                            </div>
                          </label>
                        </div>

                        <label className="flex flex-col gap-1.5">
                          <span className={labelCls}>Tagline / eyebrow</span>
                          <input
                            name="tagline"
                            defaultValue={c?.tagline ?? ""}
                            placeholder={copy.tagline}
                            className={inputCls}
                          />
                        </label>

                        <label className="flex flex-col gap-1.5">
                          <span className={labelCls}>Description</span>
                          <textarea
                            name="description"
                            rows={3}
                            defaultValue={c?.description ?? ""}
                            placeholder={copy.description}
                            className={cn(inputCls, "resize-y")}
                          />
                        </label>

                        <div>
                          <button className={saveBtn}>Save details</button>
                        </div>
                      </form>

                      {/* variants: price + availability, always visible */}
                      {row.variants.length ? (
                        <div className="flex flex-col gap-2.5 border-t border-hairline pt-4">
                          <span className={labelCls}>Variants</span>
                          {row.variants.map((v) => {
                            const isActive = v.status === "active";
                            return (
                              <div
                                key={v.variantId}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-bg px-3 py-2.5"
                              >
                                <div className="min-w-0">
                                  <div className="text-sm text-primary">
                                    {v.packLabel}
                                  </div>
                                  <div className="text-2xs text-muted">
                                    {v.sku}
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                  {/* price */}
                                  <form
                                    action={updateVariantPriceAction}
                                    className="flex items-center gap-1.5"
                                  >
                                    <input
                                      type="hidden"
                                      name="category"
                                      value={folder}
                                    />
                                    <input
                                      type="hidden"
                                      name="variantId"
                                      value={v.variantId}
                                    />
                                    <span className="text-2xs text-muted">$</span>
                                    <input
                                      name="price"
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      defaultValue={
                                        v.priceCents ? dollars(v.priceCents) : ""
                                      }
                                      placeholder="-"
                                      className="w-20 rounded-md border border-hairline bg-surface px-2.5 py-1.5 text-sm text-primary outline-none focus-visible:border-accent"
                                    />
                                    <button className="rounded-md border border-hairline px-3 py-1.5 text-2xs font-medium uppercase tracking-wide text-primary transition-colors hover:border-primary">
                                      Save
                                    </button>
                                  </form>

                                  {/* availability toggle */}
                                  <div className="flex overflow-hidden rounded-md border border-hairline">
                                    {(
                                      [
                                        ["active", "Active"],
                                        ["coming_soon", "Coming soon"],
                                      ] as const
                                    ).map(([value, label]) => {
                                      const on =
                                        (value === "active") === isActive;
                                      return (
                                        <form
                                          key={value}
                                          action={updateVariantStatusAction}
                                        >
                                          <input
                                            type="hidden"
                                            name="category"
                                            value={folder}
                                          />
                                          <input
                                            type="hidden"
                                            name="variantId"
                                            value={v.variantId}
                                          />
                                          <input
                                            type="hidden"
                                            name="status"
                                            value={value}
                                          />
                                          <button
                                            className={cn(
                                              "px-3 py-1.5 text-2xs font-medium uppercase tracking-wide transition-colors",
                                              on
                                                ? "bg-primary text-bg"
                                                : "text-secondary hover:text-primary",
                                            )}
                                          >
                                            {label}
                                          </button>
                                        </form>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <p className="text-2xs text-muted">
                            Price shows on the storefront. Coming soon disables
                            purchase for that variant.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
