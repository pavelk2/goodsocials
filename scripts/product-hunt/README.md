# Product Hunt launch assets

Seven gallery images and one thumbnail, rendered from `frames.html` by
headless Chromium. Output is in `out/`, at 2x the size Product Hunt asks for.

```
node scripts/product-hunt/render.mjs
```

Fonts are fetched once into `fonts/` and cached. `fonts/`, `build/` and `out/`
are gitignored: the PNGs live in `docs/product-hunt/` so the repo carries one
copy of each, and this directory stays a generator.

## The set

| File | 1270x760 unless noted | What it says |
|---|---|---|
| `01-offer.png` | | The offer sentence, with the board coming up from under it |
| `02-tell-it-once.png` | | A revise comment rewrites the principle, so the next seven drafts already know |
| `03-publishes-without-you.png` | | Approved Tuesday, posted Thursday at 09:00, by our own cron |
| `04-three-actions.png` | | Approve, revise, reject, and nothing else to learn |
| `05-pricing.png` | | Three prices, on the page |
| `06-linkedin-permissions.png` | | What we ask LinkedIn for, and what we never touch |
| `07-start.png` | | The price in the button, signed by a person |
| `thumbnail.png` | 240x240 | The mark |

Light and dark alternate so the gallery reads as a sequence.

## Rules these images follow

Copy is verbatim from `app/page.tsx` or derived from it, and the example board
is the same cards as `components/board/board-preview.tsx`, so a visitor who
clicks through from Product Hunt sees the page the image promised.

No invented metric appears anywhere. The only numbers are the three prices, the
seat count from `lib/legal.ts`, the 60 day token life, the 09:00 UTC publish
time from `lib/schedule.ts`, and the example board's own card counts. There is
no follower count, no impression count and no fabricated dashboard, because we
do not sell those and the product does not show them.

One accent element per frame, per DESIGN.md. The LinkedIn blue is a third party
mark on the badge, not a second accent.

## Sizes, if Product Hunt changes them

`FRAMES` in `render.mjs` carries an id, an output name and a size. The frame
itself is `width` and `height` in `.frame`, so a new size means changing both.
