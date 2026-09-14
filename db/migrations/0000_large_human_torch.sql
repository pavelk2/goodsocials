CREATE TYPE "public"."account_plan" AS ENUM('solo', 'agency');--> statement-breakpoint
CREATE TYPE "public"."board_goal" AS ENUM('interesting', 'followers', 'traffic');--> statement-breakpoint
CREATE TYPE "public"."card_action_kind" AS ENUM('approve', 'revise', 'reject');--> statement-breakpoint
CREATE TYPE "public"."card_state" AS ENUM('idea', 'draft', 'image', 'scheduled', 'posted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('active', 'expiring', 'dead');--> statement-breakpoint
CREATE TYPE "public"."principle_kind" AS ENUM('voice', 'visual', 'format');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_member_id" text NOT NULL,
	"email" text,
	"stripe_customer_id" text,
	"plan" "account_plan" DEFAULT 'solo' NOT NULL,
	"seat_limit" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_owner_member_id_unique" UNIQUE("owner_member_id")
);
--> statement-breakpoint
CREATE TABLE "board" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"goal" "board_goal" DEFAULT 'interesting' NOT NULL,
	"target_cadence" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "board_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "brand_principle" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"kind" "principle_kind" NOT NULL,
	"text" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"state" "card_state" DEFAULT 'idea' NOT NULL,
	"idea" text NOT NULL,
	"draft_text" text,
	"image_url" text,
	"image_urn" text,
	"scheduled_at" timestamp with time zone,
	"post_urn" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "card_action" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"action" "card_action_kind" NOT NULL,
	"comment" text,
	"actor_member_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_quota" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"period" text NOT NULL,
	"generated_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "linkedin_connection" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"access_token_ciphertext" text NOT NULL,
	"access_token_iv" text NOT NULL,
	"access_token_tag" text NOT NULL,
	"member_urn" text NOT NULL,
	"scopes" text NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "connection_status" DEFAULT 'active' NOT NULL,
	"expiry_email_sent_at" timestamp with time zone,
	CONSTRAINT "linkedin_connection_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"linkedin_member_id" text NOT NULL,
	"name" text,
	"email" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"card_id" uuid NOT NULL,
	"profile_id" uuid NOT NULL,
	"publish_at" timestamp with time zone NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"post_urn" text,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scheduled_post_card_id_unique" UNIQUE("card_id")
);
--> statement-breakpoint
ALTER TABLE "board" ADD CONSTRAINT "board_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_principle" ADD CONSTRAINT "brand_principle_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card" ADD CONSTRAINT "card_board_id_board_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."board"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_action" ADD CONSTRAINT "card_action_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_quota" ADD CONSTRAINT "image_quota_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "linkedin_connection" ADD CONSTRAINT "linkedin_connection_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_post" ADD CONSTRAINT "scheduled_post_card_id_card_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."card"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_post" ADD CONSTRAINT "scheduled_post_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "principle_profile_kind_unique" ON "brand_principle" USING btree ("profile_id","kind");--> statement-breakpoint
CREATE INDEX "card_board_state_idx" ON "card" USING btree ("board_id","state");--> statement-breakpoint
CREATE INDEX "card_action_card_idx" ON "card_action" USING btree ("card_id");--> statement-breakpoint
CREATE UNIQUE INDEX "image_quota_profile_period_unique" ON "image_quota" USING btree ("profile_id","period");--> statement-breakpoint
CREATE UNIQUE INDEX "profile_member_unique" ON "profile" USING btree ("linkedin_member_id");--> statement-breakpoint
CREATE INDEX "profile_account_idx" ON "profile" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "scheduled_post_due_idx" ON "scheduled_post" USING btree ("publish_at","published_at");