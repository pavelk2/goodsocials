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
- [ ] **Stripe checkout at all three prices.** Built: three live products and prices in Stripe, a Checkout session per plan with the 7 day trial, the billing portal configured for plan changes and cancellation, `/api/stripe/webhook` writing the plan, seat limit and subscription status onto the account, and a publish loop that pauses rather than posts for an account that is not paying. What is unobserved is the part that needs a card: one real checkout completing, one webhook arriving, one plan switch in the portal landing on the account, and one cancellation stopping the queue. `STRIPE_SECRET_KEY` is the one value Claude cannot mint, so nothing runs until it is set. Until a real subscription exists, `npx tsx scripts/set-plan.ts <email> agency --paid` is the hand crank.
- [ ] **Landing page and pricing page.** Partly done early, pulled forward because thin content was half of what got the domain flagged. The board screenshot still replaces the type-led hero once there is a real board to photograph. Both live at https://goodsocials.co over a valid certificate, the offer copy is verbatim, both prices are on the page with no gap between them, and the board screenshot is the hero.

## Day 5: themes and post kinds

Built and green on typecheck, lint and build. Nothing here was observed against
a live board or the live Anthropic API, because the container has neither, so
every done condition below is checked on the preview deploy.

- [x] **Four themes, written from the site.** Onboarding step one writes three principles and four themes in one round trip, in parallel, so the 90 second budget does not pay for a second call in sequence. They show in the brand principles sheet under a rule, and each one is editable by hand.
- [x] **Every idea carries a theme and a kind.** The seven ideas are dealt across the four themes, no theme takes more than two, and the card shows what it is and what it is about on one meta line. A card whose theme was deleted keeps its idea and loses the label.
- [x] **The mix is biased and the bias is one array.** `KIND_MIX` is framework, receipt, data, framework, receipt, data, finding. The slot decides the kind, not the model, so a run cannot quietly return seven findings.
- [x] **Each kind is built differently in the draft.** A framework is named steps in an order that matters. A data breakdown is the finding, the named source, and exactly three takeaways. A receipt opens on the number. The draft prompt is also forbidden from referring to a chart or an image, which it could not previously be trusted not to do.
- [x] **A receipt names the number it needs.** The card shows the line before anybody approves it, the draft writes the sentence around it and brackets the gap, and a revise comment supplying the number clears it. Unobserved: whether a real user answers the question rather than rejecting the card.

What is deliberately not in this pass, in the order it is worth building.

- [ ] **Research behind framework and data posts.** Both kinds are written from the model's own knowledge today, which is why the data brief refuses to name a source it is not certain of. The Anthropic web search server tool is the route. It goes on the draft call, never on the onboarding call, because onboarding has a 90 second budget and this would spend it. Open question to verify against the live API before building: whether structured output and a server tool can be requested in the same call.
- [ ] **A real chart on a data post.** A deterministic SVG rendered from numbers the model returns as data, rasterised, and uploaded as the post image. Never the image model: FLUX cannot render legible numbers, and a chart with wrong axis labels under a real name is worse than no chart. This is what makes the data kind worth its two slots.
- [ ] **Frameworks as LinkedIn documents.** The carousel format, which is what a saveable reference post should be. `POST /rest/documents?action=initializeUpload`, `PUT` the binary, then the document URN in the post body. The same three call shape as images and unverified against the live API, plus a PDF renderer we do not have. Check it the way the image path was checked: one real document on one real feed before anything is built around it.
- [x] **Receipts without typing.** Built as Day 6, below. The `needs` line stays, because it is still the answer when no connected source holds the number.

## Day 6: read integrations

Built and green on typecheck, lint and build. The container has no database, no
LinkedIn session and no third-party credentials, so the observable conditions
below are checked on the preview deploy with a real Stripe restricted key. What
is unobserved is listed under each item.

Five sources, all read-only, all authenticated with a pasted key that does not
expire. That last part is the selection rule rather than a coincidence: LinkedIn
already costs this product a re-authorization every 60 days plus a monitor to
catch it dying silently, and five OAuth grants would be five more of those.
Google Calendar has the widest coverage of the people who pay us and is the
first source that needs a refresh flow, which is why it is the next one and not
one of these.

- [x] **Two tables and one seam.** `source` holds the connection, `fact` holds the readings, upserted on `(source_id, key)` so a sync replaces rather than accumulates. Nothing else in the product knows the five sources apart: adding one is a file in `lib/integrations/adapters/`, a line in the registry, a definition in the catalog, and a member on the enum.
- [x] **Five adapters, no new dependency.** Stripe, GitHub, PostHog, Plausible, Notion, over raw fetch with a 12 second timeout on every call. Four of the five error envelopes were probed live with a wrong key, which found the thing that would have shipped broken: PostHog answers a bad key with 403 where Stripe answers 401, so a message built from the status code alone tells the user to fix a permission on a key they mistyped. Unobserved: every authenticated GitHub call, because the container's proxy refuses non-repository GitHub paths.
- [x] **A credential is checked before it is stored.** `connectSource` reads the live API once and refuses a bad key in the sheet the user is still looking at, then runs the first sync inline, so a screen that says connected also shows numbers. Unobserved: the round trip with a real key on the preview.
- [x] **Facts reach every prompt that writes.** Ideas, drafts and revisions all read them, and the instruction above them is the part that matters: use the figure exactly, never round one for effect, never bracket a number that is sitting in front of you. On a revise, the user's comment outranks a reading, because a comment is them telling us something the tool does not know. Unobserved: whether a receipt built on a real MRR line actually reads better than one with a bracket, which is the whole bet and only real users answer it.
- [x] **The prompt cannot grow without a decision.** 24 readings and 2,600 characters, Notion excerpts sorted last so they are cut first. Text is 0.15 USD a post against a 100 USD subscription and it stays there.
- [x] **Rows, not a plugin directory.** Five rows, the official brand mark as a monochrome leading glyph, ink when connected and grey when not, so state is the weight of the first object rather than a badge. A connected source lists its actual readings underneath in the dashboard's row shape, which is the one thing worth looking at on the screen because it is literally what the next post is built from.
- [x] **Daily sync cron.** `/api/cron/sync-sources` at 04:00 UTC, 20 hour staleness window so a late run does not skip a day. A refused source writes `last_error`, keeps the readings it had, and does not fail the run, which is the posture the publish cron already uses.

What is deliberately not in this pass.

- [ ] **Google Calendar.** The widest coverage of the people who pay us, and not a number source: 14 customer calls this month, a talk on Thursday, a launch date. It needs OAuth with a refresh token, which is the first real work here, and it is worth doing next.
- [ ] **The agency intake link.** An agency running 12 client profiles has no access to the client's Stripe, so read integrations are a solo-tier feature as built. The agency version is a page the client fills in that writes `fact` rows on their profile, which solves the actual agency problem of chasing clients for material. Same table, no OAuth.
- [ ] **A card that says which source answered it.** The board shows `needs` when a card is waiting on the author. It does not yet show "this number came from Stripe on Tuesday", which is what makes a user trust the figure enough to approve without checking.
- [ ] **A per-source error email.** A broken source is visible on the integrations screen and nowhere else. It belongs in the same day 50 machinery as a dying LinkedIn token, because the failure is the same shape: silent, and discovered late.

## Day 6: the calendar and local time

Built and green on typecheck and lint. The container has no database, so the
month model and the zone arithmetic were checked against fixtures and the
screens were rendered from a throwaway route with mock cards. Everything below
is checked properly on the preview deploy.

- [x] **The board has a second reading.** `/board?view=calendar` draws the same cards by the day they go out: posted, scheduled, today, open weekdays, weekends drawn back and not counted as gaps. A segmented control in the header switches between them, and both are real links, so a month can be sent to whoever approves it. Unobserved: the switch against a real board.
- [x] **A post can be given a day.** Dragging a card from Ready to schedule onto an open day schedules it there rather than at the next free slot, and dragging a scheduled post to another day moves it. Dropping one back on the rail takes it out of the queue. A day in the past or a day that already has a post is refused with the reason on screen. Unobserved: the drag end to end, mouse and keyboard, on the preview.
- [x] **Every profile posts at 09:00 in its own zone.** `board.timezone` holds an IANA name, taken from the browser at onboarding and once more on first board load if it is still missing, editable in settings, and every slot the scheduler claims is 09:00 there. The board, the card dialog and the calendar all read times through it. Unobserved: a cron run publishing against a non-UTC zone.
- [x] **Choosing a day does not require a drag.** An open weekday says `Schedule here`, which opens the list of approved posts and writes the same slot a drop writes. Weekends show it on hover, and the rail says the rule once above the cards. Unobserved: the dialog on a phone.
- [x] **The calendar shows what was posted before GoodSocials.** LinkedIn has no API for a member's own posts, so the history is imported from the archive they download themselves, parsed in the browser out of `Shares.csv` and sent in chunks of 100. The most recent 300 are kept per profile, drawn in `--ink-3` behind our own cards, reference only. Re-importing adds the posts since and nothing else. Unobserved: a real archive, which needs one of us to request one from LinkedIn and wait for the email.
- [ ] **Backfill the zone for boards created before this.** They carry null until somebody opens the board, which is the only moment the browser can be asked. Until then they schedule at 09:00 UTC, which is what they were already doing.

## Pre-launch

- [ ] **PostHog events named and firing.** The funnel from sign-in to first publish is visible as one funnel, and cost per account (tokens plus images) is a queryable property.
- [ ] **Five real users onboarded by hand.** Five people who are not Pavel reach 7 cards on a board, and at least one reaches a published post.
- [ ] **The launch gate, with a stranger.** One person with no help from Pavel completes sign-in, paste URL, 7 posts, approve, pay 100 USD, and watches it publish at the scheduled time. This is tested before launch day, not on it.
- [ ] **Product Hunt assets.** Thumbnail, gallery images, first comment, and the launch list primed. Target Tuesday.

---

## Not building

One line each, so nobody relitigates this on Wednesday.

- **Buffer integration.** Adds a connection step before the first post appears, gains nothing in content quality, and hands the queue to somebody else, which breaks the one thing we sell: if Buffer holds the post we cannot say whether it published, so cadence and streak become guesses. The only shape that would be allowed is a publish destination chosen in settings after the first post has already gone out from LinkedIn directly, and only if a paying agency asks for it twice.
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
