ALTER TYPE "public"."principle_kind" ADD VALUE IF NOT EXISTS 'reader';--> statement-breakpoint
CREATE TABLE "level_step" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"level" integer NOT NULL,
	"choice" text NOT NULL,
	"text" text,
	"detail" jsonb,
	"actor_member_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "level" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "level_reached_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "level_step" ADD CONSTRAINT "level_step_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "level_step_profile_idx" ON "level_step" USING btree ("profile_id","level");