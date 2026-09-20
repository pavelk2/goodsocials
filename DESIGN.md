# Design

Everything not written here comes from the house-design skill: off-white `#F4F4F4` ground, pure black `#000000` type, `#6E6E73` and `#B4B4B8` greys, `#E6E6E6` hairlines, the fading sentence for every major heading, rows instead of cards, the radius scale, one motion moment per page. Read that skill before writing styles. This file records only what is specific to GoodSocials.

Six sections. The rest gets generated on Wednesday when there is something to style.

---

## 1. Accent

`#A61E4D`

Plum. One saturated hue, one element per screen.

Rejected LinkedIn blue for two reasons: it reads as a clone of the thing we post to, and it invites a trademark conversation we do not need in week one. Rejected deep violet `#5B21B6` because four other AI writing tools already wear it. Rejected pine green `#047857` because green on a cadence widget reads as a status light rather than a brand. Rejected signal red `#E03131` because the board already has a Reject action and a dead connection state, so red is spoken for. Rejected burnt orange `#E8590C`, which this file carried first, on contrast: white text on it is 3.6:1 and the primary button is white text on the accent. Rejected raspberry `#C2255C`, the same hue two steps brighter, because plum holds its own next to black type and the brighter one competes with it.

Where it is allowed to appear, one per screen:

- Landing page: the buying controls, which section 6 widened from one element to the accent pair Notion runs. Everywhere else on that page is black or one of the two greys.
- Board: the queue runway indicator. Nothing else on the board is colored, so a board about to run dry is the only colored thing on screen, which is correct.
- Dashboard: the current streak number.
- Everywhere else: black, or one of the two greys.

`--accent-ink` is `#FFFFFF`. Contrast of `#A61E4D` against white is 7.2:1, which passes AA and AAA for body text, so the primary button label is readable and the accent can carry type where a screen needs it to. It is still used sparingly: a background under white text, a 6px dot, a 2px rule. `*:focus-visible` uses it as an outline, which is the one exception to one-element-per-screen because focus is transient.

Semantic colors exist for destructive actions and for a dead LinkedIn connection. They are not the accent and they never appear on a marketing page.

---

## 2. The one memorable thing on the landing page

Pavel's position was the board as a real screenshot with real cards, one card mid-revision so the feedback loop is legible in a still image. Agreed on the screenshot. One refinement and one addition, because the still cannot carry the whole idea by itself.

**The hero is the real board, photographed at real fidelity.** Real cards, real post text a founder would actually publish, real scheduled times in tabular numerals, five columns with uneven counts because a real board is never balanced. No invented metrics, no fake avatars, no blurred placeholder text. If the screenshot is not good enough to be the hero, the fix is the product.

**Refinement: the three brand principles are in the frame.** A card mid-revision with an open comment box shows a user typing feedback. Any competitor screenshot shows that. What it does not show is the thing we sell, which is the correction persisting. So the shot includes the principles rail with the three principles visible, and the open comment on the card is visibly about one of them. Now the still says: this comment goes there, and there applies to everything after. That is the whole pitch in one image, without a caption explaining it.

**Addition: the single motion moment demonstrates the loop.** The house style allows one orchestrated moment per page, and only when it shows something a still cannot. This is exactly that case. Below the hero, a short silent loop, four seconds, no scroll trigger: comment typed on a card, the matching principle rewrites itself, the next card down changes to match. No narration, no captions, no cursor animation. It is the only moving thing on the page. It honours `prefers-reduced-motion` by holding on the last frame, which is still legible.

Everything else on the page stays quiet: the offer sentence set at hero scale, the three prices as three plain cards, a feature list as typographic rows with no icons, and a footer naming who built it and where.

---

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

Inside a card: post preview clamped to 3 lines at 15px/1.4 in `--ink`, then a 20px meta row at 13px in `--ink-2` carrying the scheduled time in tabular numerals. Nothing hovers, nothing lifts, nothing has a drop shadow. Cards separate from the column ground by being `--surface` white on `--paper` off-white, plus a 1px `--hairline` border. That is enough.

**The image is the card's full width, below the text.** This overturns the 48px thumbnail written here first. The thumbnail was sized as decoration on a card about text, and the card in the Image column is not about text: it asks the user to approve or reject a picture, and nobody approves a picture at 48px. So the image runs the full 288px of card interior at the 4:3 it is generated in, `--r-sm`, hairline border, under the post text and the Read it control. Under the text rather than over it because that is the order LinkedIn renders a post in, which makes the card a preview of the thing instead of a note about it.

**Clicking a card opens the post in a dialog.** This replaces the in-place Read it toggle written here first. A 320px column is a summary, and expanding one card in the column pushes the rest down to read text that is still 288px wide. The dialog is a `--surface` panel at `--r-lg`, 620px wide, 86dvh tall at most, on a dark scrim: column name and scheduled time on one row, the full post at 17px/1.5 with the line breaks LinkedIn will render and no clamp, the picture under it, the three actions, and one text control reading `Close, or press Esc`. Approve and Reject close it, because the card has left the column. Revise leaves it open and the text redraws.

The whole card body is the click target, and it is also the drag handle: dnd-kit waits for 8px of movement, so a press that does not move is a click. Enter on the body starts a keyboard drag, so the keyboard route into the post is the `Read it` control under the text, which is the visible sign there is more to read. The picture on the card opens the post too, not the picture.

Inside the dialog the picture opens full size in a second native `<dialog>`: dark scrim, image at up to 80vh, one text control reading `Close, or press Esc`. The two stack in the top layer, so Escape closes the picture and leaves the post open, then closes the post. Escape, the focus trap, the return of focus, and the inertness of everything behind all come from the platform. No zoom, no pan, no next and previous. The drag overlay and the landing hero render the same card with nothing to click.

The cost is a taller column, three or four cards visible instead of six. That is the correct trade: a column of cards nobody can decide on is not denser, it is longer.

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
- Pricing is three cards side by side, plan name, price, one line of what you get, and the button that starts that plan. No badge on a recommended one, no checkmark lists, no shadow.
- Settings is rows.
- The landing page feature list is typographic rows with no icon, no border, no shadow.

One card component, in `components/board/`, used on one surface. If a card appears anywhere outside the board, it is a mistake.

---

## 5. The mark

A 5 by 5 grid of dots, one cell per day. Eighteen cells in ink for days a post
went out, one cell in plum for today, the rest in `--hairline` for the days
ahead. Dots are 9px on a 30px pitch inside a 200 by 200 frame.

The mark is the dashboard metric drawn at logo size. Nothing about it is
decorative: if a month were actually empty, the honest version of this mark
would be almost blank, which is the correct thing for a product that sells
cadence to say about itself.

Two lockups, no others:

- On paper, ink cells with the plum cell. `public/logo.svg`, no background, so
  it drops onto any light ground.
- On ink, the same grid in white with the plum cell, on a rounded tile at
  `--r-xl`. `public/logo-tile.svg`, and the same shape full bleed for
  `public/avatar-400.png`, because LinkedIn and X both crop to a circle.

Browser and platform icons come from the tile: `app/icon.svg`,
`app/apple-icon.png`, `app/favicon.ico`. Regenerate all of them with
`npx tsx scripts/logo-export.ts` rather than editing any of them by hand.

Rejected: the same grid packed into a raspberry, which read as fruit before it
read as a calendar and spent the whole mark on one saturated colour.

---

## 6. The landing page is the mark at three scales

The first pass at this page copied notion.com: centred hero, a word in a
tinted lozenge, five rounded tiles with coloured icon plates, three duotone
story panels. Pavel's read was correct and short, so it is recorded here
rather than softened. It was not inspired by that page. It was that page with
our hex codes in it, and swapping a blue for a plum does not make a decision
yours. Every one of those moves was also a thing section 5 of the house style
ends the discussion on, which is what being borrowed feels like from inside.

**The fix was already in the repo.** Section 5 above describes a 5 by 5 grid of
dots, one cell per day, ink for a day a post went out, plum for today. It says
outright that the mark is the dashboard metric drawn at logo size. That is the
most specific thing GoodSocials owns, and it was being used at 26px as a
favicon.

So the grid stops being a logo and becomes the page's layout primitive. It is
the only thing on the landing page that is drawn at all.

- **Hero, 260px.** One month at the cadence we sell: twenty cells in ink,
  today in plum, the rest of the month scheduled and still hairline.
- **Every section head, 56px.** The same grid at the count that section has
  reached, 1, 4, 11, 18, 22, and the count spelled out beside it in the mono.
  Reading down the page is watching a month fill. It replaces the eyebrow, the
  icon and the tinted plate in one object, and it is data rather than
  ornament: the grid at the top of the page is genuinely thinner than the one
  at the bottom.
- **Footer, twelve of them.** A year. Months that have not happened yet are
  drawn empty, because filling them would be the one dishonest thing on the
  page.

`components/marketing/streak.tsx` is the single implementation, on the mark's
own geometry: 9px dots on a 30px pitch. That 30px pitch is also the page's
vertical rhythm, so the spacing and the mark come from one number.

**Plum means now.** This replaces the one-element-per-screen rule with
something that can actually be applied. The accent marks the live edge of
time and nothing else: today's cell in every grid, the queue runway on the
board, the streak on the dashboard, and the button that starts one. The
secondary button beside it separates by hairline, so the page holds exactly
one saturated idea rather than a palette.

**Geist Mono ships in the repo and was not being used.** It now carries every
count, date, price period and caption. Prose stays in Geist Sans. That split
is a typographic signature a single-grotesk page cannot have, and it costs
nothing because the font was already loading.

**What survived from the Notion pass**, because it is good page-building
rather than anybody's signature: a sticky header, bands of alternating ground,
the board screenshot sitting across the first seam so it joins the claim above
it to the explanation below, and a footer with link columns. None of that is
Notion's to own.

**What the page refuses.** No tinted icon plates, no coloured panels, no
lozenge, no centred hero, no logo wall. The five columns are rows with a mono
index, the three audiences are three columns of type under an ink rule with a
real card beneath, and the one screenshot on the page is the real board
rendered by the real components.

Marketing components live in `components/marketing/`. The slim `Footer` in
`components/footer.tsx` still serves sign in and the error page; `SiteFooter`
is the landing page's.
