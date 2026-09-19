CREATE TYPE "public"."post_kind" AS ENUM('framework', 'data', 'receipt', 'finding');--> statement-breakpoint
CREATE TABLE "theme" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card" ADD COLUMN "kind" "post_kind" DEFAULT 'finding' NOT NULL;--> statement-breakpoint
ALTER TABLE "card" ADD COLUMN "theme_id" uuid;--> statement-breakpoint
ALTER TABLE "card" ADD COLUMN "needs" text;--> statement-breakpoint
ALTER TABLE "theme" ADD CONSTRAINT "theme_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "theme_profile_idx" ON "theme" USING btree ("profile_id");--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_theme_id_theme_id_fk" FOREIGN KEY ("theme_id") REFERENCES "public"."theme"("id") ON DELETE set null ON UPDATE no action;