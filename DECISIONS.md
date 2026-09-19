# Decisions

Settled. Any proposal that contradicts an entry: stop and ask Pavel. Do not implement it and explain afterward.

Format: what we chose, what we rejected, the reason in one sentence.

---

**LinkedIn only.**
Rejected: multi-channel from day one.
Multi-channel needs Buffer or a multi-tenant publisher, and both add an onboarding step that costs 60 to 70 percent of signups.

**Hosted app.**
Rejected: an MCP server.
MCP is pull-based so a scheduled manager cannot exist on it, and the buyer will not install one.

**Personal profiles only.**
Rejected: company pages.
Community Management API is gated on a 3 to 6 month approval cycle.

**Exactly three brand principles: voice, visual, format.**
Rejected: an unlimited or user-defined list.
The cap is the feature, ten principles degrade output.

**Approval queue with three card actions: Approve, Revise, Reject.**
Rejected: a writing tool with a rich text editor.
The product is the queue, and an editor invites the user to do the work they are paying us to not do.

**Cadence is the metric.**
Rejected: followers, impressions, engagement rate.
It is the outcome we sell, and it is the only one we can promise.

**100 USD per profile, 1000 USD for up to 12 profiles.**
Rejected: a middle tier, a free tier, a contact-us enterprise tier.
Two numbers with no gap is the whole pricing conversation, and a middle tier invents a buyer who does not exist.

---

## Decided during setup, same weight as the above

**The voice is a researcher, not a seller.**
Rejected: persuasion, engagement bait, rhetorical-question hooks, manufactured urgency.
The post reports something the author found and can point to, so credibility comes from being checkable rather than from sounding confident.

**The agent never invents a citation.**
Rejected: "studies show", unnamed percentages, plausible-sounding report titles.
This publishes under a real person's name, so a fabricated source costs them more than a weak post does, and prefers their own numbers, which are both checkable and better content.

**Neon Postgres.**
Rejected: Supabase.
The only Supabase feature we would use is Storage, which Vercel Blob covers in five lines, so the rest is configuration cost for a platform we use 15 percent of.

**Loops for transactional email.**
Rejected: Resend.
Pavel's call.

**Auth.js owns the LinkedIn OAuth flow, we own the token storage.**
Rejected: a hand-rolled OAuth implementation, and letting Auth.js manage token lifecycle.
Auth.js handles consent and the code exchange well, but a 60-day token with no refresh needs an expiry monitor Auth.js has no concept of, so the token lives in our `linkedin_connection` table.

**One pinned `LinkedIn-Version` in config.**
Rejected: sending the current month dynamically.
A version that changes on the first of the month changes the API contract without a deploy, which is a failure nobody is watching for.

**Vercel Cron drives publishing off `scheduled_post`.**
Rejected: waiting for a LinkedIn scheduling endpoint.
No such endpoint exists, and the cron is a day of work.

**Accent color `#E8590C`.**
Rejected: LinkedIn blue, deep violet, pine green.
Blue invites a trademark conversation and reads as a clone, violet is what four competitors already wear, and green on a cadence widget reads as a status rather than a brand.

---

## Decided on Day 3, building the loop

**At the image cap, the card schedules without a picture.**
Rejected: blocking approval until the month resets.
The cap protects our margin and the queue is what the customer pays for, so a
cap that stops publishing sells our problem to them. The message names the cap
and the reset date, the card carries on, and a post without a picture is still
a post.

**A revise comment is allowed to change no principle at all.**
Rejected: every comment updates one of the three.
"The revenue figure is 40k not 60k" folded into the voice principle would
poison every post after it. The model decides whether the correction
generalises and the card says which way it went, because a user who cannot see
that is guessing about the thing they are paying for.

**Approve is labelled with what it does: write the draft, make the image,
schedule it.**
Rejected: one button reading Approve in all three columns.
The writing rules say a button names its outcome, and approving an idea and
approving a finished post do very different things to somebody's month. The
row written to `card_action` still says `approve`, so the log is unchanged.

**Dragging runs the same transitions as the buttons.**
Rejected: drag writes the card's state directly.
A card dropped in Scheduled without a `scheduled_post` row sits there looking
correct and never publishes. Forward drops generate and cost what the buttons
cost. Backward drops only unwind: nothing is generated, nothing is charged, and
the card keeps the text and picture it already has.

**One publish hour, 09:00 UTC, for everyone.**
Rejected: per profile local time on Day 3.
The cron has one thing to read and the queue has one rule. Per profile time
zones are worth doing and they are a Day 4 item, not a Day 3 one.

**UTM parameters are appended in code, not asked for in the prompt.**
Rejected: instructing the model to tag its own links.
A model that forgets breaks the only number a traffic customer checks, and it
breaks it silently.

**Images go through OpenRouter. Text goes direct to Anthropic.**
Rejected: Replicate for images, and routing everything through one gateway.
Two different questions with two different answers. For images the gateway
wins because the response reports what the call actually cost, which is the
number PostHog needs, and because the model becomes a string rather than an
integration. For text it loses: structured output and adaptive thinking are
first party Anthropic features, and an OpenAI-compatible gateway would mean
hand-rolling schema validation at four call sites to gain nothing. The "one
API, one token" argument does not survive the split, because Vercel Blob is
storage rather than a model provider and stays either way.

**A failed image generation is not a spent image cap.**
Rejected: one ok:false for both.
At the cap the customer has spent their 200 and the card carries on without a
picture, because blocking the queue to protect our image bill stops the thing
they pay for. A provider that is down or unconfigured is our fault, so the card
stays in Draft and says so. Collapsing the two shipped a post scheduled with no
image and no reason given.

---

## Decided on Day 4, building the publish loop

**The cron runs every 15 minutes, not once at 09:00.**
Rejected: one daily run at the publish hour.
A daily cron that fails loses the day, and nobody finds out until a customer
asks where their post went. Slots are on the hour, so the run at :00 takes them
and the three after it are the retry. A run with nothing due is one query.

**A post approved with a picture does not publish without it.**
Rejected: falling back to text when the image upload fails.
The image cap is the one case where a post goes out without a picture, and that
decision is made at approval time, on the board, where the user sees it. An
upload that fails at 09:00 is our problem, not a new editorial decision to make
on somebody's behalf at five past.

**Five attempts, then the row stops and holds the reason.**
Rejected: retrying until it works.
A queue retrying a malformed post every 15 minutes for a month is a rate limit
incident with extra steps. The row keeps `last_error`, so what stopped it is
one query away and one line on the board.

**A dead token pauses the profile in one decision, and dead is not recomputed.**
Rejected: letting each post fail on its own 401, and deriving status purely
from `expires_at`.
An agency with 12 clients needs to read "this client needs to sign in again",
not 40 identical 401s. And a token LinkedIn has refused is gone whatever the
clock says: recomputing it back to active would retry a revoked token every
quarter hour and take the banner off the board while it did. Only signing in
again writes a connection that is not dead.

**Our own daily budget is claimed before the call, and a refusal is not an attempt.**
Rejected: reading LinkedIn's 429 and backing off.
150 calls per member per day, and near-daily posting needs one, so the limit is
not there to ration the product. It is there because an unattended cron with a
bug can spend a member's whole day before anyone is awake, and a member who is
rate limited by LinkedIn is rate limited for their own next action too. Our
refusal and LinkedIn's 429 both mean "not now, and not this post's fault", so
neither spends one of the five attempts.

**Alt text is written when the picture is, not derived from the post.**
Rejected: publishing the card's idea as the image's alt text.
The idea says what the writing is about. Alt text says what a screen reader
would otherwise miss. The generated image prompt is already a description of
the picture, so it is stored on the card at generation and published as is. A
redraw clears the uploaded image URN in the same statement, because a URN
pointing at the picture the user just replaced is how a card publishes the
image it was revised to get rid of.

**The board says when the queue is stopped.**
Rejected: leaving it to the day 50 email and the settings screen.
The cron runs whether or not anybody opens the board. Without a line on the
board the only other way to find out that a queue is paused is the client whose
feed went quiet, and at 12 accounts that is the 1000 USD subscription.

---

## Decided making the board and settings usable

**The account, not the member, is the authorization boundary for a card.**
Rejected: keep resolving everything from `profile.linkedin_member_id`.
Agency mode is one login with up to twelve boards, so a card is reachable
through any profile on the signed in member's account. Access is resolved from
`account.owner_member_id`, never from the profile's own member id: an agency's
client must not be able to sign in with their own LinkedIn and read the other
eleven boards. A member whose profile an agency already connected keeps that
seat, their own empty account stays empty, and settings says so rather than
stealing the profile back and taking the agency's board with it.

**Which profile the board shows is a cookie, not a column.**
Rejected: an `active_profile_id` on `account`.
It is a view of the account rather than a fact about it, so two browsers signed
in as the same agency can sit on two different clients at once. The cookie is
validated against the account's seats on every read, so a stale one reads as no
choice rather than as an error.

**Connecting a second profile is its own OAuth round trip, not a second sign in.**
Rejected: Auth.js `signIn` with a link marker.
Signing in again swaps the session to the new member and hands them the
account, which is the opposite of what an agency wants. The link flow keeps the
owner's session and lands on the `/api/linkedin/callback` URI the Day 1 flow
already registered, distinguished by a `link.` state prefix, so there is one
redirect URI to keep registered rather than two.

It is also how a seat is renewed. Tokens last 60 days with no refresh token,
and a seat that is not the owner's own has no sign in of its own to renew
through, so the same link is the re-authorization path for all twelve.

**Company pages stay out, and the settings screen says so.**
Rejected: silence about it.
`w_organization_social` is gated behind a 3 to 6 month approval. Somebody who
buys agency mode to run four brands will look for the company page first, so
the profile list states that it is personal profiles only rather than letting
them find out by connecting the wrong thing.

**A card opens a dialog. It does not expand in the column.**
Rejected: the in-place Read it toggle.
A 320px column is a summary, and expanding one card pushes the rest of the
column down to read text that is still 288px wide. The dialog carries the full
text at 17px with the line breaks LinkedIn will render, the picture at a size
somebody can judge, and the same three actions, so a post can be read and
approved without going anywhere. The picture inside it still opens full size,
which is a second dialog stacked on the first, and Escape closes them in order.

The click and the drag share the card body: dnd-kit's pointer sensor waits for
8px of movement, so a press that does not move is a click. Enter on the body
starts a keyboard drag, so the keyboard route into the post is the separate
Read it control rather than the same key meaning two things.

**The brand principles start collapsed.**
Rejected: the three principles open on the board.
They are what makes a correction stick and they are also the thing a user edits
least often. Open, they took half the screen above the board. One row closed,
three rows open, and the board is the first thing on the screen again.
