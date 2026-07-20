import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { getDb } from "./client";
import {
  productLines,
  products,
  productVariants,
  inventory,
  shippingRestrictions,
  coaDocuments,
  dynamicLinks,
} from "./schema";
import { buildLines, buildProducts, buildVariants } from "./seed-data";
import { buildShippingRestrictionRows } from "@/lib/compliance/shipping-restrictions";

/**
 * Idempotent seed. Inserts the catalog (lines -> products -> variants ->
 * inventory) and the shipping-restriction rows, using onConflictDoNothing on the
 * unique keys so re-running is safe.
 *
 * Run:  npm run db:seed   (requires DATABASE_URL)
 */
async function main() {
  const db = getDb();

  const lines = buildLines();
  const productRows = buildProducts();
  const variantRows = buildVariants();
  const restrictionRows = buildShippingRestrictionRows();

  console.log("Seeding product lines…");
  await db.insert(productLines).values(lines).onConflictDoNothing();

  const lineBySlug = new Map(
    (await db.select().from(productLines)).map((l) => [l.slug, l.id]),
  );

  console.log("Seeding products…");
  await db
    .insert(products)
    .values(
      productRows.map((p) => ({
        lineId: lineBySlug.get(p.lineSlug)!,
        slug: p.slug,
        name: p.name,
        proprietaryIngredient: p.proprietaryIngredient,
        flavor: p.flavor,
        sortOrder: p.sortOrder,
      })),
    )
    .onConflictDoNothing();

  const productBySlug = new Map(
    (await db.select().from(products)).map((p) => [p.slug, p.id]),
  );

  console.log("Seeding product variants…");
  await db
    .insert(productVariants)
    .values(
      variantRows.map((v) => ({
        productId: productBySlug.get(v.productSlug)!,
        sku: v.sku,
        flavor: v.flavor,
        packConfig: v.packConfig,
        priceCents: v.priceCents,
        status: v.status,
      })),
    )
    .onConflictDoNothing();

  const variantBySku = new Map(
    (await db.select().from(productVariants)).map((v) => [v.sku, v.id]),
  );

  console.log("Seeding inventory…");
  await db
    .insert(inventory)
    .values(
      variantRows.map((v) => ({
        variantId: variantBySku.get(v.sku)!,
        // active drinks get placeholder stock; coming_soon tablets stay at 0
        onHand: v.status === "active" ? 500 : 0,
        reserved: 0,
        restockThreshold: 50,
      })),
    )
    .onConflictDoNothing();

  console.log("Seeding shipping restrictions…");
  await db
    .insert(shippingRestrictions)
    .values(restrictionRows)
    .onConflictDoNothing();

  console.log("Seeding example COAs…");
  await db
    .insert(coaDocuments)
    .values([
      {
        category: "drinks",
        flavor: "grape",
        title: "Energy Drink — Grape — Lot 24-0142",
        lotNumber: "24-0142",
        fileUrl: "https://example.com/coa/K8D-GRP-24-0142.pdf",
        status: "published",
        issuedDate: new Date("2026-05-01"),
      },
      {
        category: "tablets",
        flavor: "lemon",
        title: "Tablets — Lemon — Lot T-24-0007",
        lotNumber: "T-24-0007",
        fileUrl: "https://example.com/coa/KR8-T100-10-LEM-0007.pdf",
        status: "published",
        issuedDate: new Date("2026-05-10"),
      },
    ])
    .onConflictDoNothing();

  console.log("Seeding example dynamic barcodes…");
  await db
    .insert(dynamicLinks)
    .values([
      {
        code: "drinkscoa",
        label: "Drinks pack — COA QR",
        targetUrl: "https://www.kr8mx.com/coa/drinks",
        category: "drinks",
        active: true,
      },
      {
        code: "tabletscoa",
        label: "Tablets pack — COA QR",
        targetUrl: "https://www.kr8mx.com/coa/tablets",
        category: "tablets",
        active: true,
      },
    ])
    .onConflictDoNothing();

  console.log(
    `Seed complete: ${lines.length} lines, ${productRows.length} products, ` +
      `${variantRows.length} variants, ${restrictionRows.length} restriction rows.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
