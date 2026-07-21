import {
  pgTable,
  pgEnum,
  serial,
  integer,
  text,
  varchar,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* =============================================================================
   KR8MX — database schema (Drizzle ORM, Neon Postgres)

   Conventions:
   - Money is ALWAYS integer cents (price_cents). Never floats.
   - Enums are Postgres native enums so the DB enforces the domain.
   - Timestamps are timezone-aware; created/updated tracked where useful.
   ============================================================================= */

/* ---------------------------------------------------------------- enums --- */

export const flavorEnum = pgEnum("flavor", [
  "grape",
  "strawberry",
  "blue_razz",
  "lemon",
  "peach",
]);

export const variantStatusEnum = pgEnum("variant_status", [
  "active",
  "coming_soon",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "awaiting_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const productCategoryEnum = pgEnum("product_category", [
  "drinks",
  "tablets",
]);

/* ------------------------------------------------------------ catalog ----- */

export const productLines = pgTable("product_lines", {
  id: serial("id").primaryKey(),
  // slug: drinks | tablets
  slug: productCategoryEnum("slug").notNull().unique(),
  name: text("name").notNull(),
  // theme key mapping to the design system (performance | precision)
  theme: varchar("theme", { length: 32 }).notNull(),
  tagline: text("tagline"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    lineId: integer("line_id")
      .notNull()
      .references(() => productLines.id),
    slug: varchar("slug", { length: 96 }).notNull(),
    name: text("name").notNull(),
    // proprietary ingredient callout, e.g. "MitraGen+"
    proprietaryIngredient: text("proprietary_ingredient"),
    description: text("description"),
    flavor: flavorEnum("flavor"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugUnique: uniqueIndex("products_slug_unique").on(t.slug),
    lineIdx: index("products_line_idx").on(t.lineId),
  }),
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id),
    sku: varchar("sku", { length: 48 }).notNull(),
    flavor: flavorEnum("flavor").notNull(),
    // pack_config: structured description of the pack, e.g.
    //   { kind: "case", units: 12, volumeMl: 355 }
    //   { kind: "tablet_container", tablets: 10, mgPerTab: 100 }
    //   { kind: "blister", tablets: 5, mgPerTab: 100 }
    packConfig: jsonb("pack_config").notNull(),
    // money as integer cents. Placeholder values are TODO — see seed.
    priceCents: integer("price_cents").notNull(),
    upc: varchar("upc", { length: 14 }),
    status: variantStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    skuUnique: uniqueIndex("product_variants_sku_unique").on(t.sku),
    productIdx: index("product_variants_product_idx").on(t.productId),
  }),
);

export const inventory = pgTable(
  "inventory",
  {
    id: serial("id").primaryKey(),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id)
      .unique(),
    // on-hand and reserved units; available = onHand - reserved
    onHand: integer("on_hand").notNull().default(0),
    reserved: integer("reserved").notNull().default(0),
    restockThreshold: integer("restock_threshold").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    variantIdx: index("inventory_variant_idx").on(t.variantId),
  }),
);

/* --------------------------------------------------------------- carts ---- */

export const carts = pgTable(
  "carts",
  {
    id: serial("id").primaryKey(),
    // session-cookie keyed (anonymous carts)
    sessionId: varchar("session_id", { length: 64 }).notNull(),
    email: text("email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    sessionUnique: uniqueIndex("carts_session_unique").on(t.sessionId),
  }),
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: serial("id").primaryKey(),
    cartId: integer("cart_id")
      .notNull()
      .references(() => carts.id),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id),
    quantity: integer("quantity").notNull().default(1),
    // price snapshot at add-to-cart time (cents)
    unitPriceCents: integer("unit_price_cents").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    cartVariantUnique: uniqueIndex("cart_items_cart_variant_unique").on(
      t.cartId,
      t.variantId,
    ),
    cartIdx: index("cart_items_cart_idx").on(t.cartId),
  }),
);

/* -------------------------------------------------------------- orders ---- */

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    orderNumber: varchar("order_number", { length: 24 }).notNull().unique(),
    status: orderStatusEnum("status").notNull().default("pending"),
    email: text("email").notNull(),
    // destination state — drives shipping_restrictions checks
    shipState: varchar("ship_state", { length: 2 }),
    // money as integer cents
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("orders_status_idx").on(t.status),
  }),
);

export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id),
    sku: varchar("sku", { length: 48 }).notNull(),
    nameSnapshot: text("name_snapshot").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceCents: integer("unit_price_cents").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  }),
);

/**
 * Append-only order event log. Never UPDATE or DELETE — every state change and
 * side effect appends a row, giving a full audit trail.
 */
export const orderEvents = pgTable(
  "order_events",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id),
    // e.g. "status_changed", "payment_captured", "note"
    type: varchar("type", { length: 48 }).notNull(),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orderIdx: index("order_events_order_idx").on(t.orderId),
  }),
);

/* --------------------------------------------------------- notify list ---- */

/** Coming-soon interest capture (e.g. premarket tablets). */
export const notifyList = pgTable(
  "notify_list",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    // optional interest in a specific variant
    variantId: integer("variant_id").references(() => productVariants.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailVariantUnique: uniqueIndex("notify_list_email_variant_unique").on(
      t.email,
      t.variantId,
    ),
  }),
);

/* ------------------------------------------------- shipping restrictions -- */

/**
 * Category x state shipping rules. Data, not deploys: rows here are edited to
 * change where products may ship. `allowed=false` blocks; `reason` surfaces to
 * the customer and the footer availability line.
 */
export const shippingRestrictions = pgTable(
  "shipping_restrictions",
  {
    id: serial("id").primaryKey(),
    category: productCategoryEnum("category").notNull(),
    // two-letter USPS state code
    state: varchar("state", { length: 2 }).notNull(),
    allowed: boolean("allowed").notNull().default(true),
    reason: text("reason"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    categoryStateUnique: uniqueIndex(
      "shipping_restrictions_category_state_unique",
    ).on(t.category, t.state),
  }),
);

/* ------------------------------------------------- COA + dynamic links ---- */

export const coaStatusEnum = pgEnum("coa_status", ["draft", "published"]);

/**
 * Certificates of Analysis. Category-separated (drinks | tablets), each row
 * points to a hosted lab-report file. Managed via the KR8MX admin console.
 */
export const coaDocuments = pgTable(
  "coa_documents",
  {
    id: serial("id").primaryKey(),
    category: productCategoryEnum("category").notNull(),
    flavor: flavorEnum("flavor"),
    title: text("title").notNull(),
    lotNumber: varchar("lot_number", { length: 48 }),
    fileUrl: text("file_url").notNull(),
    summary: text("summary"),
    // headline analyte result surfaced on the COA card
    resultLine: text("result_line").default(
      "0 PPM 7-hydroxymitragynine (dry weight basis)",
    ),
    issuedBy: text("issued_by").notNull().default("KR8MX"),
    issuedDate: timestamp("issued_date", { withTimezone: true }),
    status: coaStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    categoryIdx: index("coa_documents_category_idx").on(t.category),
    lotUnique: uniqueIndex("coa_documents_lot_unique").on(t.lotNumber),
  }),
);

/**
 * Dynamic barcodes. A QR printed on packaging encodes /q/{code}; the resolver
 * 302-redirects to targetUrl. Because the code is fixed but the target is
 * editable, packaging is re-pointable without a reprint.
 */
export const dynamicLinks = pgTable(
  "dynamic_links",
  {
    id: serial("id").primaryKey(),
    // uniqueness enforced by the codeUnique index below (avoid a duplicate)
    code: varchar("code", { length: 24 }).notNull(),
    label: text("label").notNull(),
    targetUrl: text("target_url").notNull(),
    category: productCategoryEnum("category"),
    active: boolean("active").notNull().default(true),
    scanCount: integer("scan_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    codeUnique: uniqueIndex("dynamic_links_code_unique").on(t.code),
  }),
);

/* ------------------------------------------------------------ inferred ---- */

export type ProductLine = typeof productLines.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderEvent = typeof orderEvents.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type NotifyListEntry = typeof notifyList.$inferSelect;
export type ShippingRestriction = typeof shippingRestrictions.$inferSelect;

export type CoaDocument = typeof coaDocuments.$inferSelect;
export type DynamicLink = typeof dynamicLinks.$inferSelect;

export type Flavor = (typeof flavorEnum.enumValues)[number];
export type VariantStatus = (typeof variantStatusEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type ProductCategory = (typeof productCategoryEnum.enumValues)[number];
