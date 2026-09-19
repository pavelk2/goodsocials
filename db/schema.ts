import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Tables are singular, columns are snake_case. See the data model in CLAUDE.md.
 * queue_runway is deliberately absent: it is derived from approved cards and
 * target cadence, never stored, so it cannot drift from the board.
 */

export const accountPlan = pgEnum("account_plan", ["solo", "agency"]);
export const connectionStatus = pgEnum("connection_status", [
  "active",
  "expiring",
  "dead",
]);
export const boardGoal = pgEnum("board_goal", [
  "interesting",
  "followers",
  "traffic",
]);
export const cardState = pgEnum("card_state", [
  "idea",
  "draft",
  "image",
  "scheduled",
  "posted",
  "rejected",
]);
export const cardActionKind = pgEnum("card_action_kind", [
  "approve",
  "revise",
  "reject",
]);
export const principleKind = pgEnum("principle_kind", [
  "voice",
  "visual",
  "format",
]);

/** The paying entity. One Stripe customer, one plan, a seat limit of 1 or 12. */
export const account = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** LinkedIn member id (OIDC sub) of whoever signed up. The login identity. */
  ownerMemberId: text("owner_member_id").notNull().unique(),
  email: text("email"),
  stripeCustomerId: text("stripe_customer_id"),
  plan: accountPlan("plan").notNull().default("solo"),
  seatLimit: integer("seat_limit").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** One LinkedIn person we post as. An agency account has up to 12. */
export const profile = pgTable(
  "profile",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => account.id, { onDelete: "cascade" }),
    /** OIDC sub. The author URN is urn:li:person:{linkedin_member_id}. */
    linkedinMemberId: text("linkedin_member_id").notNull(),
    name: text("name"),
    email: text("email"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("profile_member_unique").on(t.linkedinMemberId),
    index("profile_account_idx").on(t.accountId),
  ],
);

/**
 * The perishable asset. Tokens last 60 days and no refresh token exists, which
 * is verified, not assumed. expires_at drives the day 50 email, the day 55
 * banner, and the day 60 pause.
 */
export const linkedinConnection = pgTable("linkedin_connection", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" })
    .unique(),
  /** AES-256-GCM. Written and read only by lib/linkedin/crypto.ts. */
  accessTokenCiphertext: text("access_token_ciphertext").notNull(),
  accessTokenIv: text("access_token_iv").notNull(),
  accessTokenTag: text("access_token_tag").notNull(),
  memberUrn: text("member_urn").notNull(),
  scopes: text("scopes").notNull(),
  connectedAt: timestamp("connected_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  status: connectionStatus("status").notNull().default("active"),
  /** Set when the day 50 email goes out, so it goes out once. */
  expiryEmailSentAt: timestamp("expiry_email_sent_at", { withTimezone: true }),
});

export const board = pgTable("board", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profile.id, { onDelete: "cascade" })
    .unique(),
  goal: boardGoal("goal").notNull().default("interesting"),
  /** The URL brand intake read. The traffic goal links here and tags it. */
  siteUrl: text("site_url"),
  /** Posts per week. Close to daily is 5. Drives the runway calculation. */
  targetCadence: integer("target_cadence").notNull().default(5),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** The unit of work. The board column is `state`, not a stored position. */
export const card = pgTable(
  "card",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    boardId: uuid("board_id")
      .notNull()
      .references(() => board.id, { onDelete: "cascade" }),
    state: cardState("state").notNull().default("idea"),
    idea: text("idea").notNull(),
    draftText: text("draft_text"),
    imageUrl: text("image_url"),
    /** Set after the three step LinkedIn image upload, before publishing. */
    imageUrn: text("image_urn"),
    /**
     * What the picture is of, written when it is generated and published as
     * the post's alt text. The post idea would be a lie here: it says what the
     * writing is about, not what a screen reader would otherwise miss.
     */
    imageAlt: text("image_alt"),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    postUrn: text("post_urn"),
    /** Ordering within a column only. Never the column itself. */
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("card_board_state_idx").on(t.boardId, t.state)],
);

/** Append only. Revisions are read from here, never overwritten. */
export const cardAction = pgTable(
  "card_action",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" }),
    action: cardActionKind("action").notNull(),
    comment: text("comment"),
    actorMemberId: text("actor_member_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("card_action_card_idx").on(t.cardId)],
);

/** Exactly three per profile. The unique index is what enforces the cap. */
export const brandPrinciple = pgTable(
  "brand_principle",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    kind: principleKind("kind").notNull(),
    text: text("text").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("principle_profile_kind_unique").on(t.profileId, t.kind)],
);

/** The publish intent. The cron reads this table and nothing else. */
export const scheduledPost = pgTable(
  "scheduled_post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cardId: uuid("card_id")
      .notNull()
      .references(() => card.id, { onDelete: "cascade" })
      .unique(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    publishAt: timestamp("publish_at", { withTimezone: true }).notNull(),
    attempts: integer("attempts").notNull().default(0),
    /** A failure is visible in a query, not only in a log line. */
    lastError: text("last_error"),
    postUrn: text("post_urn"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("scheduled_post_due_idx").on(t.publishAt, t.publishedAt)],
);

/** Hard cap of 200 per profile per month. Checked before the image call. */
export const imageQuota = pgTable(
  "image_quota",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    /** Calendar month as YYYY-MM. */
    period: text("period").notNull(),
    generatedCount: integer("generated_count").notNull().default(0),
  },
  (t) => [uniqueIndex("image_quota_profile_period_unique").on(t.profileId, t.period)],
);

export const IMAGE_CAP_PER_MONTH = 200;

/**
 * LinkedIn allows 150 requests per member per day, reset daily UTC. The count
 * has to survive between invocations, so it is a row rather than a number in
 * memory: two cron runs an hour apart share no process.
 *
 * Claimed before the call, like the image quota, because a limit checked after
 * the fact is a report rather than a limit.
 */
export const linkedinCallBudget = pgTable(
  "linkedin_call_budget",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** OIDC sub. The same key the author URN is built from. */
    memberId: text("member_id").notNull(),
    /** UTC day as YYYY-MM-DD, because that is when LinkedIn resets. */
    day: text("day").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [uniqueIndex("linkedin_call_member_day_unique").on(t.memberId, t.day)],
);
