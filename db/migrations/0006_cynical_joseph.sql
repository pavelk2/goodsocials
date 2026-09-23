CREATE TABLE "past_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"posted_at" timestamp with time zone NOT NULL,
	"text" text NOT NULL,
	"url" text,
	"source_key" text NOT NULL,
	"imported_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "past_post" ADD CONSTRAINT "past_post_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "past_post_profile_day_idx" ON "past_post" USING btree ("profile_id","posted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "past_post_source_unique" ON "past_post" USING btree ("profile_id","source_key");