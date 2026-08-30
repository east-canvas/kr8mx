CREATE TABLE "lead_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"to_email" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'sent' NOT NULL,
	"provider_message_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coa_documents" ALTER COLUMN "result_line" SET DEFAULT 'Under 400 ppm 7-hydroxymitragynine (dry weight basis)';--> statement-breakpoint
ALTER TABLE "lead_replies" ADD CONSTRAINT "lead_replies_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lead_replies_lead_idx" ON "lead_replies" USING btree ("lead_id");