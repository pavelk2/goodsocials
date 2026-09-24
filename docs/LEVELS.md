# Levels

Levels 1 to 5 are built: `lib/levels.ts` holds the rules, `lib/levels-store.ts`
reads the evidence, `/levels` is the screen. Levels 6 to 10 show on the ladder
and cannot be reached until their steps exist.

## Why

Onboarding is four questions and a URL, which is right for the launch gate and
wrong for everything after it. At the end of the funnel the agent knows a
homepage, a goal, a picture style and four themes it guessed. It does not know
how the person writes, who reads them, what numbers they own, or what their
audience responds to. Every post until those gaps close is written from a
homepage.

Levels are the plan for closing them after the sale, one small step at a time,
with the next step always named.

## The shape

Ten levels in four stages. Each stage learns from a different source, and the
source gets harder to obtain as the stages go up.

| Stage | Levels | Learns from | By |
|---|---|---|---|
| Foundation | 1 to 3 | What the member tells us | Week 1 |
| Calibration | 4 to 5 | What the member approves and corrects | Week 4 |
| Audience | 6 to 8 | What their readers do | Week 10 |
| Authority | 9 to 10 | Sustained results against their own baseline | Week 12 and later |

Lower levels are inputs the member can give in minutes. Upper levels are
outcomes nobody can type in, which is what keeps level 10 rare.

## Three rules for every level

1. **One step, one screen.** The same shape as the funnel: one question, three
   options, and a free text answer. Under three minutes. If a step needs more,
   it is two levels.
2. **Three gates, all required.** A step completed, an evidence threshold met,
   and a calendar floor passed. The floor is what makes week 4 and week 12 real:
   a member who does every step on day one still waits.
3. **Measured against yourself.** Every engagement threshold is a multiple of
   the member's own baseline, never an absolute number. A founder with 800
   followers and one with 80,000 climb the same ladder.

## The ten levels

Posts are counted as published through GoodSocials. At five a week, day 28 is
about 20 posts and day 84 about 60.

### Foundation

**Level 1. Set up.** Day 0.
We know the site, the goal, the picture style, four themes read off the
homepage, and one sample post.
We do not know anything about the person that is not on their website.
Reached by finishing the funnel.

**Level 2. Your voice.** Floor: day 1.
Step: *Give us writing that sounds like you.*
- Import your LinkedIn archive (the existing `Shares.csv` import)
- Paste three things you wrote anywhere: posts, emails, a talk
- Paste three posts by other people you wish you had written
Result: the voice principle is rewritten from their text, with a short list of
phrases they never use.
Gate: at least five texts of their own, or three reference posts, and the voice
principle regenerated.

**Level 3. Your reader.** Floor: day 3.
Step: *Who should stop scrolling for your posts?*
- Three reader descriptions drafted from the site and the competitor research,
  each as role, company type and the problem they have
- Their own words
Then, on the same screen, confirm or replace each of the four themes against
that reader. Themes were guessed from a homepage; this is the first time the
member chooses them.
Gate: a reader named, all four themes confirmed or replaced, 3 posts published.

### Calibration

**Level 4. Your proof.** Floor: day 10.
Step: *Where do your numbers live?*
- Connect a source (Stripe, GitHub, PostHog, Plausible, Notion)
- Answer the open `needs` questions on the board
- Paste a few numbers you are proud of this month
Result: receipts carry real figures instead of brackets.
Gate: one source active or three receipts published with a number the member
supplied, 8 posts published.

**Level 5. Runs itself.** Floor: day 28.
Step: *These are the corrections you made most. Keep them as rules?*
We read `card_action` and show the three revise comments that repeat most,
phrased as rules ("never open with a question"). Each one: keep, edit, drop.
Kept rules go into the matching principle. A picture choice from the images
they approved was planned here and is deferred, see DECISIONS.md.
Gate: 15 posts published, 7 of the last 10 cards approved on the first draft,
two whole weeks in a row at the board's cadence.
Level 5 is the promise of the product kept: the board fills, the member
approves, the feed stays regular.

### Audience

Everything from here needs engagement numbers, and LinkedIn has no API route to
them for us (see the constraint below). So level 6 starts by asking for them.

**Level 6. Measured.** Floor: day 35.
Step: *Show us how your posts did.*
- Upload your LinkedIn analytics export
- Enter reactions and comments on each posted card, two numbers, three days
  after it goes out
- Not now, and the ladder stops here until one of the two happens
Result: a baseline (median comments, reactions and impressions per post, from
their posts before GoodSocials when the export covers them, otherwise from the
first ten measured posts), and the first readout: the top three and bottom
three posts, and what separates them by theme, kind, hook, length and picture.
Themes stop being dealt evenly and are weighted by what the readout found.
Gate: 15 measured posts, baseline set.

**Level 7. Your real audience.** Floor: day 49.
Step: *The people reading you are not quite the people you named. Which do we
write for?*
We compare the export's viewer and follower demographics (titles, industries,
seniority) against the reader chosen at level 3.
- Write for who is already reading
- Keep the reader you chose and change what we write to reach them
- Both, split by theme
And one more input: paste the three best comments from this month. Comments
say what readers want next, and each one becomes an idea on the board.
Gate: demographics imported, a choice made, 25 measured posts, median
engagement over the last 10 at or above baseline.

**Level 8. What works.** Floor: day 63.
Step: *Pick the next thing to test.*
Three experiments proposed from the data, for example opening line style, post
length, picture or no picture. Each runs over six posts, three and three,
dealt by the agent. The winner is written into the format principle.
Gate: two experiments concluded, 35 measured posts, median engagement over the
last 15 at 1.3 times baseline or more.

### Authority

**Level 9. Expert.** Floor: day 77.
Step: *Choose a series you are known for.*
Three recurring formats derived from their best posts, such as a monthly numbers
post or a weekly teardown, each with a fixed day. A series is a theme with a
fixed shape and a fixed weekday.
Gate: 45 measured posts, 1.6 times baseline sustained over the last 20, 8 of
the last 10 approved without revision, and at least a third of the last 20
built on facts only the member has (receipts and findings with their own
numbers). That last one is the authenticity test: an expert posts things nobody
else could have written.

**Level 10. Reference.** Floor: day 84.
The name people forward when someone asks who knows this subject. Most members
will not get here, by design.
Step: none. Level 10 is not chosen, it is observed.
Gate: 12 weeks without missing a planned weekday, 2.5 times baseline over the
last 30 posts, six instalments of the series published, and one outcome on the
goal they picked: follower growth from the export for `followers`, visits from
LinkedIn in a connected Plausible or PostHog for `traffic`, a number they report
for `leads`. The last 20 cards approved with no revision.

## The screen

One line in the board header: `Level 4 · Next: connect your numbers`. It opens
`/levels`, which shows:

- The ladder, 1 to 10, the current level in plum, the rest hairline. It is the
  streak mark's grammar applied to a single row.
- **What we know** and **What we are guessing**, two short lists. The second
  list is the honest reason to take the next step.
- The next step, as the one-question screen.
- The gates as plain progress: `12 of 15 posts published`, `7 of 10 approved
  first time`, `Opens on 22 October`.

The dashboard rule stands: it leads with posts this month and the streak.
Engagement appears on `/levels` and in the readout, compared to the member's
own baseline, never as a raw follower or impression count on the board.

Agency accounts get a level column per profile, which answers the question an
agency has every Monday: which client needs what from whom.

## Data model

Additions, following the existing conventions.

- `profile.level`, `profile.level_reached_at`. Stored, because a level is
  earned once. Progress toward the next level is derived in `lib/levels.ts` and
  stored nowhere, like `queue_runway`.
- `level_step` Append-only, like `card_action`: profile, level, the answer, the
  free text, when. What the member said is never overwritten.
- `brand_principles` gains a fourth kind, `reader`. See decisions below.
- `post_metric` Per card: impressions, reactions, comments, reposts,
  `measured_at`, `source` (`export` or `manual`). Upserted on the card. Also
  keyed to `past_post` when the export covers posts from before GoodSocials,
  which is where the baseline comes from.
- `audience_snapshot` Per profile per import: the export's demographic
  breakdown as jsonb, with the date. Replaced, not appended, the way `fact` is.
- `experiment` Variable, arms, status, result. `card.experiment_arm` nullable.
- `theme.series_weekday` nullable. A series is a theme with a day.

`LEVELS` in `lib/levels.ts` holds every threshold and floor as one array, the
way `KIND_MIX` holds the idea bias, so recalibrating is one edit.

## Build order

The calendar floors set the build order. Nobody can reach level 6 before day
35, so the audience stages do not need to exist on launch day.

**Phase 1. Levels 1 to 5.** Everything is derivable from tables that exist:
funnel answers, `past_post`, `card_action`, `source`, `fact`, published cards.
New: `lib/levels.ts`, `/levels`, the header line, the four step screens, the
`reader` principle, `level_reached` to PostHog with days since onboarding.

**Phase 2. Levels 6 and 7.** Before any code: one real analytics export from
Pavel's account, read by hand. The `Shares.csv` import taught that an export's
columns and IDs are not what the documentation says. Then the parser, the
manual two-number entry on posted cards, the baseline, the readout, theme
weighting, the demographics comparison. Must ship by day 35 after the first
paying member.

**Phase 3. Levels 8 to 10.** Experiments, series, goal outcomes. Must ship by
day 63.

## The constraint that shapes the upper half

Reading a member's posts needs `r_member_social`, closed to new applications.
There is no API route to engagement either. What remains:

- **The analytics export.** LinkedIn lets a member export their content
  analytics as a spreadsheet. Unverified by us: which sheets it carries today,
  whether it covers every post or only the top ones, and whether its post IDs
  match the URN `/rest/posts` returns. Those three are the first thing to check,
  and the matching question decides whether per-post data comes from the export
  or from manual entry.
- **Manual entry.** Two numbers per post, asked for on the card three days
  after publishing. Always works, costs the member 10 seconds a post.
- **A gated API.** Any member analytics scope sits behind the
  application-gated Community Management API, the same wall as company pages.
  Nothing in this plan assumes it.

Parsing a spreadsheet in the browser needs a dependency. The reason goes in the
commit that adds it.

## Decisions

All four taken as recommended on 24 September 2026, and recorded in
DECISIONS.md.

1. **A fourth principle, `reader`.** CLAUDE.md says exactly three. Folding the
   reader into `voice` keeps the rule but makes a revise comment like "too
   technical for my readers" ambiguous about which principle it should change.
   Recommend the fourth kind.
2. **Levels never drop.** A broken streak does not take a level away. The
   upper gates ask for current performance, so a member who stops posting
   stalls rather than falls. Recommend this over decay, which punishes the
   holiday week.
3. **Levels unlock steps, never features.** Nothing is paywalled behind a
   level. Recommend: every member at every level gets the full product, and the
   ladder is advice with a scoreboard.
4. **Engagement on `/levels` only.** The rule that the dashboard never leads
   with followers or impressions holds. Upper levels need engagement, so it is
   shown on the level screen, relative to baseline. Recommend.

## How we will know the thresholds are wrong

They are guesses. After the first 20 profiles pass level 5, compare median days
to each level against the plan (week 4 for level 5, week 12 for level 10). If
most members sit at one level for more than three weeks, that gate is wrong,
not the members. The `level_step` log and `level_reached` in PostHog are the
data for that review.
