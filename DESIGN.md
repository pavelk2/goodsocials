# Design

Everything not written here comes from the house-design skill: off-white `#F4F4F4` ground, pure black `#000000` type, `#6E6E73` and `#B4B4B8` greys, `#E6E6E6` hairlines, the fading sentence for every major heading, rows instead of cards, the radius scale, one motion moment per page. Read that skill before writing styles. This file records only what is specific to GoodSocials.

Four sections. The rest gets generated on Wednesday when there is something to style.

---

## 1. Accent

`#E8590C`

Burnt orange. One saturated hue, one element per screen.

Rejected LinkedIn blue for two reasons: it reads as a clone of the thing we post to, and it invites a trademark conversation we do not need in week one. Rejected deep violet `#5B21B6` because four other AI writing tools already wear it. Rejected pine green `#047857` because green on a cadence widget reads as a status light rather than a brand.

Where it is allowed to appear, one per screen:

- Landing page: the primary button, which reads `Start for 100 USD a month`.
- Board: the queue runway indicator. Nothing else on the board is colored, so a board about to run dry is the only colored thing on screen, which is correct.
- Dashboard: the current streak number.
- Everywhere else: black, or one of the two greys.

`--accent-ink` is `#FFFFFF`. Contrast of `#E8590C` against white is 3.6:1, which fails AA for body text, so it is never used as a text color on paper. It is a background under white text, or a 6px dot, or a 2px rule. `*:focus-visible` uses it as an outline, which is the one exception to one-element-per-screen because focus is transient.

Semantic colors exist for destructive actions and for a dead LinkedIn connection. They are not the accent and they never appear on a marketing page.

---

## 2. The one memorable thing on the landing page

Pavel's position was the board as a real screenshot with real cards, one card mid-revision so the feedback loop is legible in a still image. Agreed on the screenshot. One refinement and one addition, because the still cannot carry the whole idea by itself.

**The hero is the real board, photographed at real fidelity.** Real cards, real post text a founder would actually publish, real scheduled times in tabular numerals, five columns with uneven counts because a real board is never balanced. No invented metrics, no fake avatars, no blurred placeholder text. If the screenshot is not good enough to be the hero, the fix is the product.

**Refinement: the three brand principles are in the frame.** A card mid-revision with an open comment box shows a user typing feedback. Any competitor screenshot shows that. What it does not show is the thing we sell, which is the correction persisting. So the shot includes the principles rail with the three principles visible, and the open comment on the card is visibly about one of them. Now the still says: this comment goes there, and there applies to everything after. That is the whole pitch in one image, without a caption explaining it.

**Addition: the single motion moment demonstrates the loop.** The house style allows one orchestrated moment per page, and only when it shows something a still cannot. This is exactly that case. Below the hero, a short silent loop, four seconds, no scroll trigger: comment typed on a card, the matching principle rewrites itself, the next card down changes to match. No narration, no captions, no cursor animation. It is the only moving thing on the page. It honours `prefers-reduced-motion` by holding on the last frame, which is still legible.

Everything else on the page stays quiet: the offer sentence set at hero scale, the two prices as hairline rows, a feature list as typographic rows with no icons, and a footer naming who built it and where.

---

### Built, and two departures from the house scale

The hero is the real `components/board/` components with fixed seed content,
not an image. The single motion moment is CSS on that live DOM, in
`components/marketing/hero-board.css`, so it survives a card restyle.

Two values depart from the house type scale, both recorded here so nobody
"fixes" them back:

- **Hero size is `clamp(34px, 4.6vw, 68px)`, not `clamp(40px, 7vw, 104px)`.**
  The offer sentence runs 160 characters. At 104px the grey continuation is six
  lines against two black ones, so the qualification shouts louder than the
  claim, which is the opposite of what the pattern is for.
- **The grey continuation is `--ink-2`, not `--ink-3`.** `#B4B4B8` on the
  off-white ground is 1.8:1 and the dark pairing is 2.4:1, so both fail AA at
  any size. `--ink-2` is 4.2:1 and still reads as a second level.

## 3. Board dimensions

The board is the dense surface. The marketing page around it is the airy one. That contrast is the effect, so do not soften the board.

```
--col-width      320px    fixed, columns do not flex
--col-gutter     16px     between columns
--card-gap       8px      between cards in a column
--card-pad       14px 16px
--card-min-h     88px
--card-radius    14px     --r-md, the size of the object
--col-radius     20px     --r-lg, the panel it sits in
--col-head-h     44px     column name left, count right in tabular numerals
```

Inside a card: post preview clamped to 3 lines at 15px/1.4 in `--ink`, then a 20px meta row at 13px in `--ink-2` carrying the scheduled time in tabular numerals. A card with an image shows a 48px square thumbnail on the right of the preview, not a full-bleed header image. Nothing hovers, nothing lifts, nothing has a drop shadow. Cards separate from the column ground by being `--surface` white on `--paper` off-white, plus a 1px `--hairline` border. That is enough.

Drag uses `--shadow` and only while a card is actually in the air, because at that moment it is genuinely floating. It lands flat.

The board scrolls horizontally on a phone, one column at a time with snap. It is not a squeeze of the desktop layout and it is not a different information architecture. Approving from a phone is three taps and that path is tested.

---

## 4. Why the card is the correct exception to rows, not cards

The house rule says cards are for things that are genuinely separate objects a user can pick up and move, and that almost nothing is. A kanban card is the almost-nothing.

Three reasons it qualifies, and the rule holds everywhere else:

**It is literally picked up and moved.** Not as a metaphor. The user drags it between columns, and the state of the object is its position. A row cannot express that, because a row's meaning comes from the list it sits in, not from where it sits.

**It carries a decision, not a value.** A row is label left, value right: one fact, scannable in a column of other facts. A card holds three lines of text a human has to read, a scheduled time, an image, and three actions. That is an object with an interior, and rows have no interior.

**It has independent state.** Cards in the same column are at different points in their own lifecycle, with their own revision history. Rows in a list share a state and differ only in value.

The rule still holds for the rest of the product, and this is where the discipline shows:

- The three brand principles are rows, not cards. Three boxes with icons is the exact pattern the house style bans.
- The dashboard is rows: posts this month, current streak, days of runway, image quota. Label left, number right, tabular, hairline between.
- Pricing is two hairline rows, not two pricing cards with a badge on the recommended one.
- Settings is rows.
- The landing page feature list is typographic rows with no icon, no border, no shadow.

One card component, in `components/board/`, used on one surface. If a card appears anywhere outside the board, it is a mistake.
