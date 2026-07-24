CREATE TYPE "public"."sales_order_status" AS ENUM('new', 'invoiced', 'paid', 'submitted', 'cancelled');--> statement-breakpoint
CREATE TABLE "sales_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"brand" text NOT NULL,
	"flavor" text NOT NULL,
	"sku" varchar(32) NOT NULL,
	"unit" varchar(12) NOT NULL,
	"bottles_per_unit" integer DEFAULT 1 NOT NULL,
	"quantity" integer NOT NULL,
	"bottles" integer DEFAULT 0 NOT NULL,
	"unit_price_cents" integer DEFAULT 0 NOT NULL,
	"line_total_cents" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(24) NOT NULL,
	"rep_id" integer,
	"status" "sales_order_status" DEFAULT 'new' NOT NULL,
	"company" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" varchar(32),
	"ship_address" text,
	"ship_city" varchar(96),
	"ship_state" varchar(2),
	"ship_zip" varchar(12),
	"notes" text,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"total_bottles" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "sales_reps" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" varchar(32),
	"code" varchar(16),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sales_order_items" ADD CONSTRAINT "sales_order_items_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_rep_id_sales_reps_id_fk" FOREIGN KEY ("rep_id") REFERENCES "public"."sales_reps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sales_order_items_order_idx" ON "sales_order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "sales_orders_status_idx" ON "sales_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sales_orders_rep_idx" ON "sales_orders" USING btree ("rep_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_reps_code_unique" ON "sales_reps" USING btree ("code");