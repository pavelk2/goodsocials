CREATE TYPE "public"."subscription_status" AS ENUM('none', 'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused');--> statement-breakpoint
ALTER TYPE "public"."account_plan" ADD VALUE IF NOT EXISTS 'consultancy';--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "stripe_subscription_id" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "current_period_end" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "account_stripe_customer_unique" ON "account" USING btree ("stripe_customer_id");