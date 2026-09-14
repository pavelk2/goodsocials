# GoodSocials

## The offer

> "AI social media manager for LinkedIn. Writes high quality content, you approve it in a kanban board, it schedules so you post regularly, close to daily. From 100 USD a month. Manage your clients' accounts from 1000 USD a month, up to 12 accounts."

Two prices on the page, no gap between them:
- 100 USD per month per LinkedIn profile
- 1000 USD per month for up to 12 profiles

This copy is the source. Do not improve it. Derive from it.

## What the product is

An approval queue, not a writing tool: the agent writes, the user approves, the system publishes. The board has five columns (Idea, Draft, Image, Scheduled, Posted) and every card has exactly three actions (Approve, Revise, Reject). A comment on a card rewrites that card and updates the brand principles, so the correction persists to every future card, and that persistence is the differentiator, not generation quality. Cadence is the outcome sold, so the dashboard leads with posts published this month and current streak, never followers or impressions.

## The launch gate

A stranger with no help from Pavel signs in with LinkedIn, pastes a URL, sees 7 posts on a board, approves one, pays 100 USD, and watches it publish to their feed at the scheduled time. If a task does not serve that sentence, cut it.

## LinkedIn constraints, verified, do not re-research

Two self-serve products in the LinkedIn developer portal, no partner approval needed:
- Sign In with LinkedIn using OpenID Connect. Scopes: openid, profile, email.
- Share on LinkedIn. Scope: w_member_social. Posts to the authenticated member's own feed.

Request all four scopes in one authorization request so the member consents once.

- Post to /rest/posts. Not /v2/ugcPosts, retired for new integrations.
- Every call needs LinkedIn-Version: YYYYMM and X-Restli-Protocol-Version: 2.0.0. Pin one version in config.
- Rate limits: 150 requests per member per day, 100,000 per app per day, reset daily UTC.
- No scheduling endpoint exists. Store the post, publish at time T with our own cron.
- Company pages need w_organization_social via Community Management API, application-gated. Out of scope. Personal profiles only, which is what agency mode is built around.

The constraint that shapes the architecture: access tokens last 60 days and standard apps do not receive a refresh token. Plan for re-authorization every 60 days. Build the expiry monitor in the first pass. The failure mode is silent: a dead token means weeks of scheduled posts never publish and the user hears about it from their client. At 12 accounts that is the difference between keeping and losing a 1000 USD subscription.

### Additions found during Day 1

- Redirect URLs must be HTTPS. `http://localhost` is rejected by the developer portal, so local development uses the deployed Vercel callback or an HTTPS tunnel.
- Requesting a scope the app has not been granted fails the whole authorization request with `unauthorized_scope_error`. It does not degrade quietly. Test unknown scopes in an isolated authorization attempt.
- `offline_access` result: PENDING. Record the answer here after the isolated test.
- A pinned `LinkedIn-Version` stays valid about 12 months and then starts returning errors. Same silent failure class as a dead token. It is tracked by the same expiry monitor.
- Images need three calls: `POST /rest/images?action=initializeUpload`, `PUT` the binary to the returned upload URL, then reference the image URN in the post body. Each step fails independently.

## Cost constraints, enforce in code

Text generation runs about 0.15 USD per finished post including revisions. Not a concern against 100 USD per month.

Images are the margin risk. Hard cap of 200 generated images per profile per month, counted in the database, count visible in settings. Regeneration attempts count against it. A user at the cap sees a clear message, never a silent failure.

Log token and image spend per account so cost per customer is visible in PostHog from launch day.

## Stack

- Next.js 16 App Router on Vercel. One deploy target for app, API routes, and cron. Next 16 has breaking changes against Next 15, so read `node_modules/next/dist/docs/` before writing route or rendering code.
- TypeScript strict. Schema errors at build time instead of at 09:00 when the cron fires.
- Neon Postgres. Serverless Postgres with per-preview-branch databases, which matters while schema changes daily.
- Drizzle ORM. Typed schema in the repo, migrations as files, no hidden codegen step.
- Auth.js with the LinkedIn OIDC provider. Owns the four-scope consent and hands us the access token to store.
- Tailwind plus shadcn/ui. Component primitives we restyle to the house tokens rather than accept as shipped.
- dnd-kit for the board. Keyboard-accessible drag, which the house style requires.
- Vercel Cron. LinkedIn has no scheduling endpoint, so the publish loop is ours.
- Stripe Checkout. Two prices, no custom billing UI.
- Loops for transactional email. Day 50 re-authorization warning and receipts.
- PostHog. Funnel to the launch gate, plus per-account cost.
- Anthropic API for text generation. Replicate for images.
- Vercel Blob for generated images between generation and LinkedIn upload. Replicate URLs expire in about an hour.

## Directory layout

- `app/` Next.js routes. `(marketing)` for landing and pricing, `(app)` for board and dashboard, `api/` for auth, webhooks, cron.
- `components/` UI. `components/board/` is the only place card markup lives.
- `lib/` domain logic with no React import. This is where a reviewer looks first.
- `lib/linkedin/` every call to LinkedIn. Nothing else in the repo talks to their API.
- `lib/agent/` prompts, generation, revision, principle updates.
- `db/` Drizzle schema and migrations.
- `emails/` Loops template ids and payload builders.
- `scripts/` one-off operator scripts. Not shipped, not imported by `app/`.
- `docs/` DECISIONS.md, ROADMAP.md, DESIGN.md live at repo root, anything longer lives here.

## Data model

- `account` The paying entity. Holds the Stripe customer, plan (`solo` or `agency`), and profile seat limit (1 or 12).
- `profile` One LinkedIn person we post as. Belongs to an account. An agency account has up to 12. Owns its own board, principles, quota, and connection.
- `linkedin_connection` Per profile. Encrypted access token, LinkedIn member URN, granted scopes, `connected_at`, `expires_at`, `status` (`active`, `expiring`, `dead`).
- `token_expiry` Not a table. Derived from `linkedin_connection.expires_at`. Day 50 sends email, day 55 shows a banner, day 60 marks the connection `dead` and pauses scheduling instead of failing post by post.
- `board` One per profile. Holds the goal (`interesting`, `followers`, `traffic`) and the target cadence.
- `card` The unit of work. Belongs to a board. Holds idea, draft text, image reference, scheduled time, and the LinkedIn post URN once published.
- `card_state` Enum: `idea`, `draft`, `image`, `scheduled`, `posted`, `rejected`. The board column is this field, not a position.
- `card_action` Append-only log of `approve`, `revise`, `reject` with the actor and the comment. Revisions are read from here, never overwritten.
- `brand_principles` Exactly three rows per profile, keyed by kind: `voice`, `visual`, `format`. Editable text. A revise comment updates the matching one.
- `scheduled_post` The publish intent: card, profile, `publish_at`, attempt count, last error, resulting post URN. The cron reads this table and nothing else.
- `image_quota` Per profile per calendar month. `generated_count` against a hard cap of 200. Regenerations increment it. Checked before the Replicate call, not after.
- `queue_runway` Derived, not stored: approved and scheduled cards divided by target cadence, in days. Under 3 days triggers idea generation and a board warning.

## Environment variables

No values in this file, ever.

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string, pooled |
| `DATABASE_URL_UNPOOLED` | Direct connection for migrations |
| `AUTH_SECRET` | Auth.js session encryption |
| `AUTH_URL` | Canonical origin for OAuth callbacks |
| `LINKEDIN_CLIENT_ID` | LinkedIn app client id |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn app client secret |
| `LINKEDIN_API_VERSION` | Pinned `YYYYMM` sent as `LinkedIn-Version` on every call |
| `TOKEN_ENCRYPTION_KEY` | 32-byte base64 key for encrypting LinkedIn tokens at rest |
| `ANTHROPIC_API_KEY` | Text generation and revision |
| `REPLICATE_API_TOKEN` | Image generation |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob, holds images until LinkedIn upload |
| `STRIPE_SECRET_KEY` | Checkout sessions and subscription reads |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe webhook signatures |
| `STRIPE_PRICE_SOLO` | Price id for 100 USD per profile per month |
| `STRIPE_PRICE_AGENCY` | Price id for 1000 USD for up to 12 profiles |
| `LOOPS_API_KEY` | Transactional email |
| `NEXT_PUBLIC_POSTHOG_KEY` | Client analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog ingest host |
| `CRON_SECRET` | Shared secret on cron routes so only Vercel can trigger publish |

## Running it

```
npm install
cp .env.example .env.local     # fill from Vercel, never commit
npm run db:push                # push Drizzle schema to the branch database
npm run dev                    # http://localhost:3000
npm test                       # vitest, unit only
npm run typecheck              # tsc --noEmit, run before every push
npm run lint
```

Deploy: push the branch. Vercel builds a preview per branch. `main` is production at goodsocials.co.

To publish a real LinkedIn post from the command line during development:
```
npx tsx scripts/linkedin-post.ts "text of the post"
```

## Conventions

**Naming.** Database is snake_case, TypeScript is camelCase, files and routes are kebab-case. Drizzle handles the mapping. Tables are singular (`card`, not `cards`).

**Error handling.** Anything that talks to LinkedIn, Stripe, Anthropic, or Replicate returns a typed result rather than throwing into a component. Never swallow an error to keep a screen rendering. A failed publish writes `last_error` on `scheduled_post` and increments the attempt count so it is visible in a query, not only in a log line. User-facing failures say what happened and what to do next.

**Secrets.** Vercel environment variables only. `.env.local` is gitignored, `.env.example` holds names with empty values. No secret is ever a `NEXT_PUBLIC_` variable.

**LinkedIn tokens at rest.** AES-256-GCM with `TOKEN_ENCRYPTION_KEY`, a fresh random IV per record, the IV and auth tag stored alongside the ciphertext. Encrypt and decrypt only in `lib/linkedin/crypto.ts`. No other file reads the raw token, no token is logged, and no token crosses into client-side code.

**Rate limits.** Every LinkedIn call goes through `lib/linkedin/client.ts`, which counts calls per member per day. The cron refuses to exceed 150.

## Git

Branch per roadmap item, meaningful slug, for example `linkedin-publish-cron` or `board-card-actions`. Merge before starting the next. No dependency added without the reason in the commit message. Do not refactor anything that works. After pushing, share the Vercel deployment link.

## Writing rules for anything a user reads

Applies to landing copy, buttons, empty states, error messages, emails, and generated posts.

- No em dashes.
- No buzzwords. No "seamless", "leverage", "unlock", "supercharge", "effortless", "game-changer".
- No filler words. No "actually", "really", "simply", "just", "basically".
- Never the "this is not X, this is Y" construction.
- Sentence case. Plain words. Say the price in the button.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
