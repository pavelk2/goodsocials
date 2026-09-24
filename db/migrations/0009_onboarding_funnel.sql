ALTER TYPE "public"."board_goal" ADD VALUE 'leads';--> statement-breakpoint
ALTER TABLE "board" ADD COLUMN "funnel" jsonb;