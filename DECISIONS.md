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

**The landing hero is the live board components, not a screenshot.**
Rejected: a captured PNG of the board, and a recorded video of the revision loop.
A screenshot needs restaging on every card change and a video needs re-exporting, so both drift from the product within a week, and rendering the real components means the hero is wrong only when the board is wrong.
