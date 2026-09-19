# Streak mark, 24 variations

One idea in 24 forms: a cell per day, filled when a post went out, one accent
cell for today, the rest receding. Open `index.html` for the sheet with each
mark repeated at 24px, or `contact-sheet.png` for one image.

Palette is the one `DESIGN.md` already fixes: paper `#F4F4F4`, ink `#000000`,
accent `#E8590C`, `#B4B4B8` and `#E6E6E6` for anything that has to recede.
`#262626` appears only as the empty cell on a dark tile.

What each group tests:

| Marks | Variable |
|---|---|
| 01 to 06 | Grid shape and density. How many days fit before the mark becomes texture. |
| 07, 08 | Cell form. Dot, rounded cell, hard square. |
| 09, 10, 17, 18 | How the days ahead are drawn, or whether they are drawn at all. |
| 11 to 14 | How the run itself reads: diagonal, a week, a missed day, by column. |
| 15, 16 | Carrying today by scale or by a ring instead of by colour alone. |
| 19 to 21 | Dark tile, for the app icon and the avatar. |
| 22 to 24 | The grid bent into something else: the letter G, a ring, a disc. |

`svg/` is the source, `png/` is 200 by 200 flat. No typeface is used anywhere,
so nothing needs outlining or licensing later.

## Regenerating

```
npx tsx scripts/logo-streak.ts
```

Edit the `variants` array in the script to change a mark. Rendering goes
through the Chromium already in the container.

## After picking one

1. Move the chosen SVG to `public/logo.svg` and drop this directory.
2. Record the mark and its accent cell in `DESIGN.md` section 1.
3. Export the favicon set and a 400 by 400 avatar from the same SVG. Use a
   dark tile variation for anything that lands on a dark background.
