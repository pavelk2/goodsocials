CREATE TABLE "card_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"url" text NOT NULL,
	"title" text,
	"cited_text" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "kind" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "kind" SET DEFAULT 'personal'::text;--> statement-breakpoint
-- Four kinds become three. framework and data both rested on something
-- published elsewhere, so they become explainer and research; receipt and
-- finding both rested on the author's own evidence, so both become personal.
-- A card already drafted as framework or data was written before the search
-- pass existed and carries no source rows, so the draft gate will hold it
-- until it is revised or rejected. That is the intended outcome: those are
-- the posts this change exists to stop publishing.
-- Every arm is named and the fallthrough keeps the value it found, because
-- /api/admin/migrate replays every file on every run. An ELSE that reached for
-- 'personal' would be correct once and would flatten every research and
-- explainer card on the second run.
UPDATE "card" SET "kind" = CASE "kind"
	WHEN 'framework' THEN 'explainer'
	WHEN 'data' THEN 'research'
	WHEN 'receipt' THEN 'personal'
	WHEN 'finding' THEN 'personal'
	ELSE "kind"
END;--> statement-breakpoint
DROP TYPE "public"."post_kind";--> statement-breakpoint
CREATE TYPE "public"."post_kind" AS ENUM('research', 'explainer', 'personal');--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "kind" SET DEFAULT 'personal'::"public"."post_kind";--> statement-breakpoint
ALTER TABLE "card" ALTER COLUMN "kind" SET DATA TYPE "public"."post_kind" USING "kind"::"public"."post_kind";--> statement-breakpoint
ALTER TABLE "card_source" ADD CONSTRAINT "card_source_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "card_source_card_idx" ON "card_source" USING btree ("card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "card_source_card_url_unique" ON "card_source" USING btree ("card_id","url");