CREATE TABLE "funnel_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anon_id" text NOT NULL,
	"member_id" text,
	"event" text NOT NULL,
	"props" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "funnel_event_anon_idx" ON "funnel_event" USING btree ("anon_id");--> statement-breakpoint
CREATE INDEX "funnel_event_member_idx" ON "funnel_event" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "funnel_event_created_idx" ON "funnel_event" USING btree ("created_at");