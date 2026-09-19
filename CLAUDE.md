# GoodSocials

## The offer

> "AI social media manager for LinkedIn. Writes high quality content, you approve it in a kanban board, it schedules so you post regularly, close to daily. From 100 USD a month. Manage your clients' accounts from 1000 USD a month, up to 12 accounts."

Two prices on the page, no gap between them:
- 100 USD per month per LinkedIn profile
- 1000 USD per month for up to 12 profiles

This copy is the source. Do not improve it. Derive from it.

## What the product is

An approval queue, not a writing tool: the agent writes, the user approves, the system publishes. The board has five columns (Idea, Draft, Image, Scheduled, Posted) and every card has exactly three actions (Approve, Revise, Reject). A comment on a card rewrites that card and updates the brand principles, so the correction persists to every future card, and that persistence is the differentiator, not generation quality. Four themes per profile decide what the board is about, so ideas keep coming from somewhere after the homepage is used up. Cadence is the outcome sold, so the dashboard leads with posts published this month and current streak, never followers or impressions.

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

### Verified against the live API on Day 1

One real authorization and one real post to a real feed. Not documentation.

- All four scopes come back from a single consent, in this order: `email, openid, profile, w_member_social`.
- Access token lifetime is exactly 60 days.
- **No refresh token is returned.** The constraint that shapes the architecture is confirmed, not assumed. Re-authorization every 60 days is real work the product has to do for the user.
- `/rest/posts` returns **201** with the post URN in the `x-restli-id` response header and an empty body. Read the header, not the body.
- The pinned `LinkedIn-Version: 202606` is accepted. Re-check before it ages past 12 months.
- Author URN is `urn:li:person:{sub}` where `sub` comes from the OIDC `/v2/userinfo` response. The userinfo endpoint is unversioned and rejects the `LinkedIn-Version` header.

### Additions found during Day 1

- Redirect URLs must be HTTPS. `http://localhost` is rejected by the developer portal, so local development uses the deployed callback or an HTTPS tunnel.
- **`offline_access` is not grantable.** Tested with a real isolated authorization. There is no refresh token to be had on a standard app, by any route. Re-authorization every 60 days is the design, not a fallback.
- Requesting a scope the app has not been granted kills the whole authorization request, and it fails worse than documented. LinkedIn does **not** redirect back to `redirect_uri` with `error=unauthorized_scope_error`. It serves its own "Bummer, something went wrong" page and bounces the member to the bare app domain. Our callback never runs, so there is nothing to catch and nothing to log. A typo in the scope string is therefore invisible on our side and looks to the user like the product is broken. Build the scope list from `LINKEDIN_SCOPES` only, never from a string literal at a call site, and never add a scope without checking the Products tab first.
- Commentary escaping: PENDING. The Day 1 post carried unescaped parentheses and an apostrophe. Check the live post before wiring `escapeCommentary()` into the draft path.
- A pinned `LinkedIn-Version` stays valid about 12 months and then starts returning errors. Same silent failure class as a dead token. It is tracked by the same expiry monitor.
- Images need three calls: `POST /rest/images?action=initializeUpload`, `PUT` the binary to the returned upload URL, then reference the image URN in the post body. Each step fails independently.

## Integration constraints, verified against the live APIs, do not re-research

Five read-only sources, all authenticated with a pasted key rather than an OAuth
grant. Probed with a deliberately wrong credential on 19 September 2026:

- The status code does not identify the failure. Stripe, Notion and Plausible
  answer a bad key with **401**; PostHog answers **403**. So an error message
  built from the status alone will tell somebody to fix a permission on a key
  they mistyped. Read the body: all four return a usable sentence, and
  `credentialError()` in `lib/integrations/http.ts` leads with theirs.
- The error message sits in a different place in each one. Stripe nests it at
  `error.message`, Notion and GitHub use `message`, PostHog uses `detail`,
  Plausible uses `error` as a bare string. `messageFrom()` handles all four.
- Endpoints confirmed to exist and to authenticate:
  `POST https://us.posthog.com/api/projects/{id}/query/` with
  `{"query":{"kind":"HogQLQuery","query":"..."}}`,
  `POST https://api.notion.com/v1/search` with `Notion-Version: 2022-06-28`,
  `GET https://plausible.io/api/v1/stats/aggregate`,
  `GET https://api.stripe.com/v1/customers`.
- Not verified from a container, because it needs a real token: every GitHub
  call, and every authenticated response body shape. The GitHub search
  qualifiers (`type:pr is:merged merged:>=DATE`, `author-date:>=DATE`) are
  written from the documentation and are the first thing to check when a
  GitHub sync comes back empty.
- Stripe filters subscriptions by when they were **created**, not by when they
  ended, so churn is counted from `customer.subscription.deleted` events. Those
  are retained 30 days, which is exactly the window every adapter reads.
- Money is minor units except in the zero-decimal currencies, and a yearly plan
  is a twelfth of its invoice per month while a weekly one is 52/12, not 4. The
  arithmetic is in `lib/integrations/format.ts` and `adapters/stripe.ts`.

## Cost constraints, enforce in code

Text generation runs about 0.15 USD per finished post including revisions. Not a concern against 100 USD per month.

Images are the margin risk. Hard cap of 200 generated images per profile per month, counted in the database, count visible in settings. Regeneration attempts count against it. A user at the cap sees a clear message, never a silent failure.

Facts are the third thing that can move cost, because they go into every ideas, draft and revision prompt. `lib/integrations/facts.ts` caps them at 24 readings and 2,600 characters and sorts Notion excerpts last so they are cut first. A source that starts returning forty rows cannot spend money.

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
- Anthropic API for text generation, called directly. Structured output and adaptive thinking are first party features an OpenAI-compatible gateway does not carry, so text never goes through one.
- OpenRouter for images, because the response reports what each call cost, which is the number PostHog needs, and because the model is a string rather than an integration. Pinned to `black-forest-labs/flux.2-pro` at the 1K tier: 0.03 USD an image, so the 200 cap is at most 6 USD a month against a 100 USD subscription. Raising the resolution tier changes that arithmetic.
- Vercel Blob for generated images between generation and LinkedIn upload. A store connected to the project authenticates with `BLOB_STORE_ID` and a `VERCEL_OIDC_TOKEN` Vercel mints per deployment. There is no `BLOB_READ_WRITE_TOKEN` to set.

## Directory layout

- `app/` Next.js routes. `(marketing)` for landing and pricing, `(app)` for board and dashboard, `api/` for auth, webhooks, cron.
- `components/` UI. `components/board/` is the only place card markup lives.
- `lib/` domain logic with no React import. This is where a reviewer looks first.
- `lib/linkedin/` every call to LinkedIn. Nothing else in the repo talks to their API.
- `lib/agent/` prompts, generation, revision, principle updates.
- `lib/integrations/` the five read-only sources. `adapters/` is the only place that talks to Stripe, GitHub, PostHog, Plausible or Notion, the way `lib/linkedin/` is the only place that talks to LinkedIn.
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
- `theme` What this profile is known for. Four per profile, written from the site at onboarding and editable after. Principles say how a post sounds; themes say what it is allowed to be about, and without them every generation restarts from the same homepage and week four reads like week one. Ideas are dealt across them so no one theme takes the board.
- `card` The unit of work. Belongs to a board, and to a theme. Holds idea, draft text, image reference, scheduled time, and the LinkedIn post URN once published. Also `kind`, and `needs` when the post is waiting on something only the author has.
- `post_kind` Enum on `card`: `framework`, `data`, `receipt`, `finding`. The shape of the post, decided with the idea rather than at draft time, because a framework and a receipt are different posts from the first sentence. The mix is biased: `KIND_MIX` in `lib/agent/ideas.ts` is seven slots and six of them are frameworks, data breakdowns or receipts. That array is the bias, so tuning it is one edit.
- `needs` on `card` The one number or source only the author can supply, named in their own words. A receipt is credible because it is theirs, so the card asks for the number instead of inventing it: the board shows the line, the draft brackets the gap, and a revise comment supplying it closes it.
- `card_state` Enum: `idea`, `draft`, `image`, `scheduled`, `posted`, `rejected`. The board column is this field, not a position.
- `card_action` Append-only log of `approve`, `revise`, `reject` with the actor and the comment. Revisions are read from here, never overwritten.
- `brand_principles` Exactly three rows per profile, keyed by kind: `voice`, `visual`, `format`. Editable text. A revise comment updates the matching one.
- `scheduled_post` The publish intent: card, profile, `publish_at`, attempt count, last error, resulting post URN. The cron reads this table and nothing else. Five attempts and the row stops holding the reason. A paused row keeps its attempt count, because nothing about that post was wrong.
- `source` One connected read-only tool per kind per profile: Stripe, GitHub, PostHog, Plausible, Notion. Encrypted credential, `handle` (project id, site domain, account login), `host` for the two that are also self-hosted, `status`, `last_synced_at`, `last_error`. Every one authenticates with a pasted key that does not expire, which is the selection rule and not an accident: LinkedIn already costs a re-authorization every 60 days and a monitor to catch it dying, and five OAuth grants would be five more of those. Google Calendar has the widest coverage of the people who pay us and is the first that needs a refresh flow, so it is next rather than now.
- `fact` One reading from a source, upserted on `(source_id, key)` and never appended. This is what makes a receipt post a receipt. A sync replaces the set, so a reading that stops coming back is deleted: nobody posts last March's churn, and a year of daily MRR rows in every draft prompt is how a 0.15 USD post becomes a 0.60 USD one. `value` is text because the model reads it and "4,210 EUR" is what belongs in a sentence; the arithmetic happens in the adapter where the currency and the period are still in scope.
- `linkedin_call_budget` Per member per UTC day. Claimed before every LinkedIn call, so the 150 a day limit is a limit rather than a report.
- `image_quota` Per profile per calendar month. `generated_count` against a hard cap of 200. Regenerations increment it. Checked before the image call, not after.
- `queue_runway` Derived, not stored: approved and scheduled cards divided by target cadence, in days. Under 3 days triggers idea generation and a board warning.

## Environment variables

No values in this file, ever.

| Name | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string, pooled |
| `DATABASE_URL_UNPOOLED` | Direct connection for migrations |
| `AUTH_SECRET` | Auth.js session encryption |
| `AUTH_URL` | Canonical origin for OAuth callbacks, `https://goodsocials.co` in production |
| `LINKEDIN_CLIENT_ID` | LinkedIn app client id |
| `LINKEDIN_CLIENT_SECRET` | LinkedIn app client secret |
| `LINKEDIN_API_VERSION` | Pinned `YYYYMM` sent as `LinkedIn-Version` on every call |
| `LINKEDIN_REDIRECT_URI` | Only when the registered callback is not this deployment's own host |
| `TOKEN_ENCRYPTION_KEY` | 32-byte base64 key for encrypting LinkedIn tokens at rest |
| `ANTHROPIC_API_KEY` | Text generation and revision |
| `OPENROUTER_API_KEY` | Image generation |
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

Deploy: push the branch. Vercel builds a preview per branch.

Domains. `goodsocials.co` is the canonical production domain and the only one
that appears in copy, emails, OAuth redirect URIs, UTM links, or anything a
user sees. `goodsocials.vercel.app` is the Vercel alias and stays as a fallback
while DNS or a certificate settles. Per-deployment URLs such as
`goodsocials-timetuna.vercel.app` sit behind Vercel Authentication, so nothing
external can redirect to them. No file hardcodes a host: OAuth redirect URIs
are derived from the incoming request, so a preview authorizes against itself.

To publish a real LinkedIn post from the command line during development:
```
npx tsx scripts/linkedin-post.ts "text of the post"
```

The publish cron runs every 15 minutes at `/api/cron/publish`. Vercel sends
`CRON_SECRET` as a bearer token. To run the queue by hand without waiting,
append `?k=` and `LINKEDIN_DEBUG_SECRET`, which is a separate secret so the
cron's own never lands in a URL or a browser history. The response is the run:
what was due, what published, what paused and why.

The source sync cron runs daily at 04:00 UTC at `/api/cron/sync-sources`, with
the same two doors as the publish cron: Vercel's `CRON_SECRET` bearer, or `?k=`
and `LINKEDIN_DEBUG_SECRET` to run it by hand. The response says what was read,
what was refused and why.

Agency mode needs more than one seat, and until the Stripe webhook sets the
plan the seat limit is 1 for everyone:
```
npx tsx scripts/set-plan.ts <account email> agency
```

## Conventions

**Naming.** Database is snake_case, TypeScript is camelCase, files and routes are kebab-case. Drizzle handles the mapping. Tables are singular (`card`, not `cards`).

**Error handling.** Anything that talks to LinkedIn, Stripe, Anthropic, or OpenRouter returns a typed result rather than throwing into a component. Never swallow an error to keep a screen rendering. A failed publish writes `last_error` on `scheduled_post` and increments the attempt count so it is visible in a query, not only in a log line. User-facing failures say what happened and what to do next.

**Secrets.** Vercel environment variables only. `.env.local` is gitignored, `.env.example` holds names with empty values. No secret is ever a `NEXT_PUBLIC_` variable.

**Secrets at rest.** AES-256-GCM with `TOKEN_ENCRYPTION_KEY`, a fresh random IV per record, the IV and auth tag stored alongside the ciphertext. The cipher is `lib/crypto.ts` and nothing else calls it directly. Two files wrap it and they are the only ones that ever hold a plaintext: `lib/linkedin/crypto.ts` for a LinkedIn token, `lib/integrations/credentials.ts` for a source credential. Nothing is logged and nothing crosses into client-side code. A source credential never reaches the browser at all, sealed or otherwise, so the integrations screen shows when a source was last read and not what it was read with.

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
