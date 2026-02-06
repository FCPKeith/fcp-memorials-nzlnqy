ALTER TABLE "memorial_requests" ADD COLUMN "preservation_addon" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "memorial_requests" ADD COLUMN "preservation_billing_cycle" text;