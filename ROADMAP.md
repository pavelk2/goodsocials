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
- [ ] **`offline_access` answer recorded.** An isolated authorization request adding `offline_access` either returns a refresh token or fails with `unauthorized_scope_error`, and the result is written into the LinkedIn constraints section of CLAUDE.md.
- [ ] **Repo scaffold, database, auth, board schema.** `npm run db:push` creates every table in the data model, signing in through the app creates an `account`, a `profile`, and an encrypted `linkedin_connection`, and the board page renders five empty columns.

## Day 2: intake and ideas

- [ ] **Brand intake from a URL.** Pasting a website URL produces three principles (voice, visual, format) generated from the page content, within 30 seconds.
- [ ] **Principles are editable and visible on the board.** Editing a principle saves and survives a reload, and the three are readable from the board without navigating away.
- [ ] **Goal picker.** Choosing interesting content, grow followers, or grow website visits changes the generated idea mix, and choosing website visits appends UTM parameters to every link in a generated draft.
- [ ] **Idea column fills.** A new profile reaches 7 cards in the Idea column within 90 seconds of finishing onboarding, with no payment step and no second connection step before that moment.

## Day 3: the loop

- [ ] **Draft generation.** A card in Idea becomes a card in Draft with post text in the profile's voice, on demand and automatically for the top of the queue.
- [ ] **Three card actions.** Approve, Revise, and Reject each move or update the card and write a row to `card_action`. There is no fourth action and no rich text editor.
- [ ] **Comment-driven revision updates the principles.** A revise comment rewrites that card, updates the matching brand principle, and the next card generated after that shows the correction without the comment being repeated.
- [ ] **Image generation with quota.** Generating an image moves the card to Image and increments `image_quota`. At 200 in a calendar month the button is disabled with a message naming the cap and the reset date, and the count is visible in settings.
- [ ] **Drag between columns.** A card can be dragged between columns with a mouse and moved with the keyboard, and the new state survives a reload.

## Day 4: publish and money

- [ ] **Cron publishes.** A card scheduled for a time in the next 10 minutes publishes to the real feed at that time with no human present, and the card moves to Posted carrying the LinkedIn post URN.
- [ ] **Token expiry monitor.** A connection 50 days old sends the re-authorization email through Loops, at 55 days the board shows a banner, and at 60 days the connection is marked dead and scheduling pauses rather than failing post by post.
- [ ] **Queue runway warning.** A board with fewer than 3 days of approved cards shows the runway in days and generates new ideas automatically.
- [ ] **Stripe checkout at both prices.** Both prices complete a real checkout in test mode, the webhook sets the plan and seat limit, and an agency account can create a second profile while a solo account cannot.
- [ ] **Landing page and pricing page.** Both live at https://goodsocials.co over a valid certificate, the offer copy is verbatim, both prices are on the page with no gap between them, and the board screenshot is the hero.

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
Fallback: the cap is enforced in the database before the Replicate call. The cap is the fallback.

**Stripe checkout works and nobody buys.**
Trigger: signups reaching 7 cards but not reaching checkout.
Fallback: not a code problem. The price is settled, so the answer is the landing page and who we put it in front of.
