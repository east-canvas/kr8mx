CREATE TABLE "product_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "product_category" NOT NULL,
	"flavor" "flavor" NOT NULL,
	"name" text,
	"tagline" text,
	"description" text,
	"image_url" text,
	"accent_hex" varchar(9),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "product_content_category_flavor_unique" ON "product_content" USING btree ("category","flavor");