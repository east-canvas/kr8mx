CREATE TYPE "public"."coa_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "coa_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "product_category" NOT NULL,
	"flavor" "flavor",
	"title" text NOT NULL,
	"lot_number" varchar(48),
	"file_url" text NOT NULL,
	"summary" text,
	"result_line" text DEFAULT '0 PPM 7-hydroxymitragynine (dry weight basis)',
	"issued_by" text DEFAULT 'Nature''s Bridge Group Inc' NOT NULL,
	"issued_date" timestamp with time zone,
	"status" "coa_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dynamic_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(24) NOT NULL,
	"label" text NOT NULL,
	"target_url" text NOT NULL,
	"category" "product_category",
	"active" boolean DEFAULT true NOT NULL,
	"scan_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dynamic_links_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX "coa_documents_category_idx" ON "coa_documents" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "coa_documents_lot_unique" ON "coa_documents" USING btree ("lot_number");--> statement-breakpoint
CREATE UNIQUE INDEX "dynamic_links_code_unique" ON "dynamic_links" USING btree ("code");