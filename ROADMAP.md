# Roadmap

Ordered by risk, not dependency. The riskiest unknown goes first, because finding out on day three is fatal and finding out on day one is a pivot.

Every item has a done condition in observable terms. "Auth works" is not a done condition. "A new user signs in with LinkedIn and the app publishes a test post to that user's feed" is.

---

## Day 1: de-risking

The order changed once from the original plan. A bare deploy moved ahead of the token exchange, because LinkedIn rejects non-HTTPS redirect URLs, so doing the authorization before a deployed callback URL exists means registering a redirect URI twice and authorizing twice.

- [x] **LinkedIn app exists and is verified.** Pavel can open the app in the developer portal, it is associated with a LinkedIn Page, and the Verification tab shows verified. (Pavel only, cannot be done from the container.)
- [x] **Both products added.** The Products tab lists Sign In with LinkedIn using OpenID Connect and Share on LinkedIn, both with status Added. (Pavel only.)
- [x] **Bare app deployed to Vercel.** https://goodsocials.co serves the holding page over a valid certificate, and `/api/linkedin/callback` returns 400 `{"error":"missing_code"}` rather than a 404. `www.goodsocials.co` has no DNS record yet, which is a Day 4 item, not a blocker.
- [x] **All four scopes granted on a test authorization.** One consent returned `email, openid, profile, w_member_social` and a 60 day access token with no refresh token.
- [x] **A hardcoded text post published to Pavel's real feed through `/rest/posts`.** 201, post URN returned in `x-restli-id`, live on the profile.
- [x] **`offline_access` answer recorded.** The isolated probe was refused by LinkedIn before reaching our callback. No refresh token is available on a standard app. Written into the LinkedIn constraints section of CLAUDE.md, along with the fact that the refusal is unloggable on our side.
- [x] **Repo scaffold, database, auth, board schema.** Nine tables created on Neon, signing in with LinkedIn created an `account`, a `profile`, an encrypted `linkedin_connection`, a `board` and three placeholder principles, and https://goodsocials.co/board renders five empty columns.

## Day 2: intake and ideas

Two gaps carried over from Day 1. Neither blocked the done condition, both block real data.

- [x] **The board reads the database.** It currently renders hardcoded zeros and five empty states. Done when a card inserted by hand appears in its column and the counts match.
- [x] **The board requires a session.** `/board` is public today. It leaks nothing yet because it shows nothing, but it must not render a real card to a signed out visitor. Done when a signed out visitor is sent to `/signin` and a signed in one sees only their own profile's board.

- [x] **Brand intake from a URL.** Pasting a website URL produces three principles (voice, visual, format) generated from the page content, within 30 seconds.
- [x] **Principles are editable and visible on the board.** Editing a principle saves and survives a reload, and the three are readable from the board without navigating away.
- [x] **Goal picker.** Choosing interesting content, grow followers, or grow website visits changes the generated idea mix, and choosing website visits appends UTM parameters to every link in a generated draft. Tagging happens in `lib/utm.ts` after generation, not in the prompt, so a model that forgets cannot break the one number a traffic customer checks.
- [x] **Idea column fills.** A new profile reaches 7 cards in the Idea column within 90 seconds of finishing onboarding, with no payment step and no second connection step before that moment.

## Day 3: the loop

Built and green on typecheck, lint and build. The done conditions below are
observable ones and the container has no database and no LinkedIn session, so
they are checked on the preview deploy, not here. What is unobserved is listed
under each item rather than implied.

- [x] **Draft generation.** A card in Idea becomes a card in Draft with post text in the profile's voice, on demand and automatically for the top of the queue. `lib/agent/drafts.ts` writes it; `topUpDrafts` in `lib/cards.ts` does the top two without being asked, bounded so a page refresh cannot spend in a loop. Unobserved: whether the drafts read as publishable, which is the open risk below and only five real users answer it.
- [x] **Three card actions.** Approve, Revise, and Reject each move or update the card and write a row to `card_action`. There is no fourth action and no rich text editor. Approve advances one column and is labelled with what it does: write the draft, make the image, schedule it.
- [x] **Comment-driven revision updates the principles.** A revise comment rewrites that card, updates the matching brand principle, and the next card generated after that shows the correction without the comment being repeated. A comment that corrects a fact about one card is allowed to change nothing else, and says so on the card.
- [x] **Image generation with quota.** Generating an image moves the card to Image and increments `image_quota`. Regenerations count. The claim and the increment are one statement, so two clicks cannot both pass the check, and a failed generation gives the image back. At the cap the card schedules without a picture rather than stalling the queue, and the message names the cap and the reset date. The count is on `/settings` and on the board.
- [x] **Drag between columns.** A card can be dragged between columns with a mouse and moved with the keyboard, and the new state survives a reload. A drop runs the same transitions the buttons run: forward generates, backward only unwinds and never charges. Unobserved: the keyboard path end to end on the preview.

## Day 4: publish and money

Built and green on typecheck, lint and build. As on Day 3, the container has no
database and no LinkedIn session, so the observable conditions are checked on
the preview deploy. What is unobserved is listed under each item.

- [x] **Cron publishes.** `/api/cron/publish` runs every 15 minutes, reads `scheduled_post` and nothing else, publishes, and moves the card to Posted carrying the post URN from the `x-restli-id` header. A post with a picture is the three call image upload first, and each of those three steps reports which one failed. Every call is claimed against the member's 150 a day before it is made. Unobserved: a real post reaching a real feed from the cron rather than from a hand run, and the `content.media` shape on a post with an image, which is the one request body Day 1 did not verify against the live API.
- [ ] **Token expiry monitor.** Day 60 is done: the cron derives the connection status, marks it dead, and pauses the whole profile with the reason on every row it skipped rather than failing post by post. The board carries the line. Day 50 email through Loops is not built.
- [ ] **Queue runway warning.** A board with fewer than 3 days of approved cards shows the runway in days and generates new ideas automatically.
- [ ] **Stripe checkout at both prices.** Both prices complete a real checkout in test mode, the webhook sets the plan and seat limit, and an agency account can create a second profile while a solo account cannot. The seat side is built: settings connects and switches between profiles and refuses past the seat limit. What is missing is the webhook that sets the limit, so until then `npx tsx scripts/set-plan.ts <email> agency` is the hand crank.
- [ ] **Landing page and pricing page.** Partly done early, pulled forward because thin content was half of what got the domain flagged. The board screenshot still replaces the type-led hero once there is a real board to photograph. Both live at https://goodsocials.co over a valid certificate, the offer copy is verbatim, both prices are on the page with no gap between them, and the board screenshot is the hero.

## Day 5: themes and post kinds

Built and green on typecheck, lint and build. Nothing here was observed against
a live board or the live Anthropic API, because the container has neither, so
every done condition below is checked on the preview deploy.

- [x] **Four themes, written from the site.** Onboarding step one writes three principles and four themes in one round trip, in parallel, so the 90 second budget does not pay for a second call in sequence. They show in the brand principles sheet under a rule, and each one is editable by hand.
- [x] **Every idea carries a theme and a kind.** The seven ideas are dealt across the four themes, no theme takes more than two, and the card shows what it is and what it is about on one meta line. A card whose theme was deleted keeps its idea and loses the label.
- [x] **The mix is one array.** `KIND_MIX` is the slate, and the slot decides the kind rather than the model, so a run cannot quietly return seven of one thing.
- [x] **Each kind is built differently in the draft.** The draft prompt is also forbidden from referring to a chart or an image, which it could not previously be trusted not to do.
- [x] **A personal post names the number it needs.** The card shows the line before anybody approves it, the draft writes the sentence around it and brackets the gap, and a revise comment supplying the number clears it. Unobserved: whether a real user answers the question rather than rejecting the card.

## Day 6: three kinds, and citations behind two of them

Built and green on typecheck, lint and build. Nothing here was run against the
live Anthropic API or a live board, because the container has neither, so every
done condition below is checked on the preview deploy.

- [x] **Four kinds become three.** `research`, `explainer`, `personal`, and no fourth without DECISIONS.md changing first. `KIND_MIX` is three research, two explainer, two personal. Migration `0005` maps the old rows: framework to explainer, data to research, receipt and finding to personal.
- [x] **Research and explainer are searched before they are written.** `lib/agent/research.ts` runs the Anthropic web search server tool, capped at 6 searches, and returns the brief plus the pages its own sentences cited. The writing call that follows has no search tool, so it cannot reach past what was found. The open question from Day 5, whether structured output and a server tool work in the same call, is now moot: they are two calls and never one.
- [x] **Sources are stored, shown, and enforced.** `card_source` holds one row per cited URL. The card prints the publishers, the dialog lists the titles as real links, and `sourcesMissing` in `lib/cards.ts` refuses to move a research or explainer card out of Draft with no rows behind it. A search that cites nothing fails the draft and the card says to narrow the idea or reject it.

To observe on the preview deploy, in this order:

- [ ] **A research card reaches Draft carrying links that open.** Approve a research idea, check the Sources list in the dialog, open each link, and confirm the post names the same organisation the link points at.
- [ ] **The gate actually holds.** Drag an old `framework` card, migrated to `explainer` and carrying no sources, from Draft to Image and confirm it refuses with the sentence about revising or rejecting.
- [ ] **What a search pass costs.** Read `llm_spend` for `research:research` and `research:explainer` on one full board and check the arithmetic in the cost section of CLAUDE.md against the real number.

What is deliberately not in this pass, in the order it is worth building.

- [ ] **Personal posts without typing.** The third kind is meant to read from the author's own systems: GitHub, Stripe, PostHog, Google Analytics. Today it reads from the author, through the `needs` line, which is the manual version and the version that ships first because it works without an integration and it proves whether anyone answers. Each integration is its own connection, its own token expiry, and its own set of numbers worth posting, so the first one ships alone and the rest follow the shape it sets. Stripe first: the account is already connected for billing.
- [ ] **A real chart on a research post.** A deterministic SVG rendered from numbers the research pass returns as data, rasterised, and uploaded as the post image. Never the image model: FLUX cannot render legible numbers, and a chart with wrong axis labels under a real name is worse than no chart.
- [ ] **Explainers as LinkedIn documents.** The carousel format, which is what a saveable reference post should be. `POST /rest/documents?action=initializeUpload`, `PUT` the binary, then the document URN in the post body. The same three call shape as images and unverified against the live API, plus a PDF renderer we do not have. Check it the way the image path was checked: one real document on one real feed before anything is built around it.

## Pre-launch

- [ ] **PostHog events named and firing.** The funnel from sign-in to first publish is visible as one funnel, and cost per account (tokens plus images) is a queryable property.
- [ ] **Five real users onboarded by hand.** Five people who are not Pavel reach 7 cards on a board, and at least one reaches a published post.
- [ ] **The launch gate, with a stranger.** One person with no help from Pavel completes sign-in, paste URL, 7 posts, approve, pay 100 USD, and watches it publish at the scheduled time. This is tested before launch day, not on it.
- [ ] **Product Hunt assets.** Thumbnail, gallery images, first comment, and the launch list primed. Target Tuesday.

---

## Not building

One line each, so nobody relitigates this on Wednesday.

- **Buffer integration.** Adds a connection step before the first post appears.
- **Multi-channel.** Costs 60 to 70 percent of signups at onboarding.
- **Company pages.** Gated API, 3 to 6 month approval.
- **Analytics dashboard.** We sell cadence, and we promise no measurement beyond UTM parameters.
- **Team seats.** Agency mode is one login with 12 boards, which covers the buyer we have.
- **Video.** Generation cost and review time both break the 100 USD price.
- **Comment and DM replies.** Different product, different API scopes, different risk.
- **MCP server.** Pull-based, so a scheduled manager cannot exist on it.
- **Mobile app.** The board works on a phone browser and approving is three taps.
- **Rich text editing.** LinkedIn has no rich text, and an editor invites the user to do the work they are paying us to avoid.

---

## Known risks

**A LinkedIn token dies silently and weeks of posts never publish.**
Trigger: a `scheduled_post` row with attempts above 1 and a 401 in `last_error`, or a `linkedin_connection` past 55 days.
Fallback: the expiry monitor pauses scheduling, emails the user, and shows the banner. At 12 accounts an agency sees which client needs re-authorization rather than discovering it from the client.

**Generated posts are good enough to read and not good enough to publish under a real name.**
Trigger: in the five hand-onboarded users, approval rate on first draft below 40 percent, or more than two revisions per published card.
Fallback: cut the goal picker and narrow to one goal, spend the day on the revision loop instead, since the correction persisting is what we sell.

**Onboarding does not reach 7 cards in 90 seconds.**
Trigger: median time from URL paste to seventh card above 90 seconds in PostHog.
Fallback: generate 3 cards synchronously and stream the rest onto the board. A visibly filling board beats a spinner.

**LinkedIn rate limits or content filtering block automated posting at volume.**
Trigger: any 429, or a published post that does not appear in the feed.
Fallback: the client already counts calls per member per day and refuses above 150. Near-daily posting needs 1, so the headroom is 150x. If content filtering is the issue, that is a Day 1 finding, not a Day 4 one, which is why the hardcoded post comes first.

**Image cost overruns the margin.**
Trigger: an account approaching 200 images in a month, visible in `image_quota`.
Fallback: the cap is enforced in the database before the image call. The cap is the fallback.

**Google Safe Browsing flags the domain as phishing.**
Hit on Day 1. A new domain with no content, serving an unbranded "Sign in with LinkedIn" page, is the exact shape of a credential harvester and Chrome blocked it with a red interstitial. A stranger cannot get past that screen, so the launch gate is impossible while it stands.
Trigger: a red interstitial on any goodsocials.co URL, or Security Issues appearing in Google Search Console.
Fallback: request a review in Search Console, which is the only thing that lifts it, and remove the signature so the review passes. Our own sign-in page that names what we ask for and what we never do, real content on the homepage, legal pages linked from every screen. Re-check before launch day, because a re-flag on Product Hunt morning ends the launch.

**Stripe checkout works and nobody buys.**
Trigger: signups reaching 7 cards but not reaching checkout.
Fallback: not a code problem. The price is settled, so the answer is the landing page and who we put it in front of.
