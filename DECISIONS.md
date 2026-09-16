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
