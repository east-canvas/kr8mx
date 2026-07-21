CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" text DEFAULT 'admin' NOT NULL,
	"entity" varchar(48) NOT NULL,
	"entity_id" varchar(64),
	"action" varchar(48) NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_outbox" (
	"id" serial PRIMARY KEY NOT NULL,
	"to_email" text NOT NULL,
	"template" varchar(48) NOT NULL,
	"subject" text NOT NULL,
	"html" text NOT NULL,
	"data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sent_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"template" varchar(48) NOT NULL,
	"to_email" text NOT NULL,
	"order_id" integer,
	"campaign" varchar(64),
	"provider_message_id" text,
	"status" varchar(24) DEFAULT 'sent' NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notify_list" ADD COLUMN "subscribed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "notify_list" ADD COLUMN "unsubscribe_token" varchar(64);--> statement-breakpoint
ALTER TABLE "shipping_restrictions" ADD COLUMN "last_verified" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "sent_emails" ADD CONSTRAINT "sent_emails_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "sent_emails_order_template_unique" ON "sent_emails" USING btree ("order_id","template");--> statement-breakpoint
CREATE UNIQUE INDEX "sent_emails_campaign_email_unique" ON "sent_emails" USING btree ("campaign","to_email");