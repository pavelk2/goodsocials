CREATE TABLE "linkedin_call_budget" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" text NOT NULL,
	"day" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "linkedin_call_member_day_unique" ON "linkedin_call_budget" USING btree ("member_id","day");