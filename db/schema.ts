import {
  pgTable,
  pgEnum,
  boolean,
  uuid,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * Tables are singular, columns are snake_case. See the data model in CLAUDE.md.
 * queue_runway is deliberately absent: it is derived from approved cards and
 * target cadence, never stored, so it cannot drift from the board.
 */

/**
 * `solo` is the column's name for the plan the page calls Pro. It was written
 * before the plan was named, and renaming a live enum value to make two
 * spellings agree is a migration with nothing to show for it. lib/plans.ts
 * holds the only translation between the two.
 */
export const accountPlan = pgEnum("account_plan", [
  "solo",
  "agency",
  "consultancy",
]);

/**
 * Stripe's subscription statuses, plus `none` for an account that has never
 * reached checkout. Every value Stripe can send is here, because a status we
 * cannot store is a subscription we stop tracking without noticing.
 */
export const subscriptionStatus = pgEnum("subscription_status", [
  "none",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);
export const connectionStatus = pgEnum("connection_status", [
  "active",
  "expiring",
  "dead",
]);
export const boardGoal = pgEnum("board_goal", [
  "interesting",
  "followers",
  "traffic",
  "leads",
  "engagement",
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
/**
 * The shape of a post, which is a different question from what it is about.
 * The mix is biased in lib/agent/ideas.ts: the first three carry more weight
 * than a plain finding because they are the ones a reader saves, cites, or
 * believes. `finding` is the default and what every card written before themes
 * existed is.
 */
export const postKind = pgEnum("post_kind", [
  "framework",
  "data",
  "receipt",
  "finding",
]);

export const principleKind = pgEnum("principle_kind", [
  "voice",
  "visual",
  "format",
]);

/**
 * The paying entity. One Stripe customer, one plan, a seat limit of 1 or 10.
 *
 * Everything below stripe_customer_id is written by the Stripe webhook and by
 * nothing else, so what the board believes about a subscription is what Stripe
 * last said about it rather than what a screen inferred. The customer id is
 * unique because the webhook finds the account by it: two accounts on one
 * customer would send one person's plan change to somebody else's board.
 */
export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** LinkedIn member id (OIDC sub) of whoever signed up. The login identity. */
    ownerMemberId: text("owner_member_id").notNull().unique(),
    email: text("email"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: accountPlan("plan").notNull().default("solo"),
    seatLimit: integer("seat_limit").notNull().default(1),
    subscriptionStatus: subscriptionStatus("subscription_status")
      .notNull()
      .default("none"),
    /**
     * When the paid period runs out. Also the date a cancellation takes
     * effect, because the portal cancels at period end rather than on the day
     * somebody clicks it.
     */
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    /** Set while the free days are running, null once the first charge lands. */
    trialEndsAt: timestamp("trial_ends_at", { withTimezone: true }),
    /** True between clicking cancel and the period actually ending. */
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("account_stripe_customer_unique").on(t.stripeCustomerId)],
);

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
  /**
   * IANA zone this profile posts in, for example `Europe/Amsterdam`. Every slot
   * is 09:00 here, not 09:00 UTC, so the cron's instants are computed from this
   * and the calendar reads every day boundary through it.
   *
   * On the board rather than the profile because it is a scheduling setting,
   * and cadence, goal and posting time are one decision a user makes once.
   * Nullable rather than defaulted: null means nobody has told us yet, which is
   * what lets the board ask the browser once instead of assuming UTC forever.
   */
  timezone: text("timezone"),
  /**
   * Where this board is in the onboarding funnel, and what the member answered
   * on the way. Null on every board created before the funnel, which is what
   * keeps them out of it. Shape and meaning live in lib/funnel.ts, the only
   * file that reads or writes it.
   */
  funnel: jsonb("funnel"),
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
    /** The shape the post takes. Decided with the idea, read by the draft. */
    kind: postKind("kind").notNull().default("finding"),
    /**
     * The theme this post sits under. Nullable and set null on delete: a theme
     * the user removed should not take a week of approved work with it.
     */
    themeId: uuid("theme_id").references(() => theme.id, {
      onDelete: "set null",
    }),
    idea: text("idea").notNull(),
    /**
     * The idea in under seven words, for lists a member scans rather than
     * reads, like the picker after payment. The draft still works from `idea`.
     * Null on cards written before it existed and on ideas the member typed.
     */
    title: text("title"),
    /**
     * The one number only the author has, named in their own words. Written on
     * receipt cards, where the post is worthless without it and inventing it
     * would be worse. Shown on the card so the gap is visible before anyone
     * approves it, and filled with a revise comment.
     */
    needs: text("needs"),
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
    /**
     * What the quality gate last decided about this card's text, keyed by a
     * hash of it. Shape in lib/quality.ts. Null until the card first asks for a
     * slot. A held card shows the reasons until the text changes.
     */
    quality: jsonb("quality"),
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

/**
 * What this person is known for. Four per profile, written from their site at
 * onboarding and editable after.
 *
 * Principles say how they sound; themes say what they are allowed to be about.
 * Without them every generation starts from the same homepage and week four
 * reads like week one, which is the way this product dies quietly. Ideas are
 * dealt across the themes so no one of them takes the whole board.
 *
 * Not capped by a unique index the way principles are, because four is a
 * starting count rather than a rule: an agency running a client for six months
 * will add a fifth.
 */
export const theme = pgTable(
  "theme",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    /** Two to four words. What a reader would say this person posts about. */
    title: text("title").notNull(),
    /** One or two sentences naming what they can say here that nobody else can. */
    description: text("description").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("theme_profile_idx").on(t.profileId)],
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

/**
 * A post this person published on LinkedIn before GoodSocials existed, kept so
 * the calendar can show what the feed already looked like.
 *
 * Imported from the member's own LinkedIn data export, never read from the
 * API: retrieving a member's posts needs r_member_social, which is a closed
 * permission LinkedIn is not granting. See CLAUDE.md.
 *
 * Reference only. Nothing here is a card, has a state, or can be published:
 * these rows are read by the calendar and by nothing else, which is why they
 * are a table of their own rather than a flag on `card`.
 */
export const pastPost = pgTable(
  "past_post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    /** When it went out, as the export reports it. */
    postedAt: timestamp("posted_at", { withTimezone: true }).notNull(),
    text: text("text").notNull(),
    /** The permalink from the export, so a cell can open the real post. */
    url: text("url"),
    /**
     * What makes two imports of the same archive one set of rows: the
     * permalink when the export carries one, the day and the opening words
     * when it does not. Re-importing is how a user adds the posts they have
     * published since, so it has to be free of duplicates.
     */
    sourceKey: text("source_key").notNull(),
    importedAt: timestamp("imported_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("past_post_profile_day_idx").on(t.profileId, t.postedAt),
    uniqueIndex("past_post_source_unique").on(t.profileId, t.sourceKey),
  ],
);

/**
 * How many past posts one profile keeps. The calendar reads them all on every
 * board load, and a decade of a prolific poster's archive is not reference,
 * it is a second database. The most recent ones are the ones that say what
 * this person sounds like now.
 */
export const PAST_POST_LIMIT = 300;

/**
 * Where a fact came from. Five, all read-only, and every one of them
 * authenticates with a credential the user pastes once rather than an OAuth
 * round trip, which is deliberate: LinkedIn already taught this product what a
 * silently expiring token costs, and a Stripe restricted key, a GitHub
 * fine-grained token, a PostHog personal key, a Plausible key and a Notion
 * internal token all outlive the subscription. Google Calendar is the obvious
 * sixth and it is the first one that needs a refresh flow, so it waits.
 */
export const sourceKind = pgEnum("source_kind", [
  "stripe",
  "github",
  "posthog",
  "plausible",
  "notion",
]);

/** A source is broken when its last sync was refused, not when it was empty. */
export const sourceStatus = pgEnum("source_status", ["active", "broken"]);

/**
 * One connected read-only source per kind per profile.
 *
 * The credential is sealed with the same cipher as a LinkedIn token and read
 * only by lib/integrations/credentials.ts. Everything a source needs that is
 * not a secret sits in two plain columns rather than a JSON blob, because a
 * blob is where a required field goes to hide: `handle` is the PostHog project
 * id, the Plausible site domain, or the GitHub login, and `host` is the base
 * URL for the two products that are also self-hosted.
 */
export const source = pgTable(
  "source",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    kind: sourceKind("kind").notNull(),
    /** AES-256-GCM. Written and read only by lib/integrations/credentials.ts. */
    credentialCiphertext: text("credential_ciphertext").notNull(),
    credentialIv: text("credential_iv").notNull(),
    credentialTag: text("credential_tag").notNull(),
    /** Project id, site domain, or account login. Never a secret. */
    handle: text("handle"),
    /** Base URL, for the two of these that are also self-hosted. */
    host: text("host"),
    status: sourceStatus("status").notNull().default("active"),
    /** Null until the first sync lands, so "connected, never read" is visible. */
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    /** Why the last sync was refused, in the words the API used. */
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // One Stripe per profile. Two would mean two answers to "what is our MRR".
    uniqueIndex("source_profile_kind_unique").on(t.profileId, t.kind),
  ],
);

/**
 * One thing that is true about this business, read from a source rather than
 * written by a model. This is the table that makes a receipt post a receipt.
 *
 * Upserted on (source_id, key), never appended, for two reasons. A sync that
 * grew the table would put a year of daily MRR readings into every draft
 * prompt, and the cost of that lands on a 100 USD subscription. And a fact is
 * a current reading rather than a history: nobody posts last March's churn.
 *
 * `value` is text, not a number, because the model reads it and "4,210 EUR" is
 * what belongs in a sentence. Arithmetic happens in the adapter, before the row
 * is written, where the currency and the period are still in scope.
 */
export const fact = pgTable(
  "fact",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profile.id, { onDelete: "cascade" }),
    /**
     * Cascade rather than set null: a disconnected source's numbers are no
     * longer ours to publish under someone's name, and a fact nobody can
     * re-read is a fact nobody can check.
     */
    sourceId: uuid("source_id")
      .notNull()
      .references(() => source.id, { onDelete: "cascade" }),
    /** Stable within a source. The upsert key, not shown to anyone. */
    key: text("key").notNull(),
    /** What it is, in the words the source uses. "Monthly recurring revenue". */
    label: text("label").notNull(),
    /** The reading itself, formatted for a sentence. "4,210 EUR". */
    value: text("value").notNull(),
    /** One more clause of context, when there is one. "up from 3,800 in August". */
    detail: text("detail"),
    /** What the reading is true of. "last 30 days". Never assumed downstream. */
    period: text("period"),
    observedAt: timestamp("observed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("fact_source_key_unique").on(t.sourceId, t.key),
    index("fact_profile_idx").on(t.profileId),
  ],
);
