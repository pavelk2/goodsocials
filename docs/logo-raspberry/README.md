# Raspberry mark

24 variations on one idea: the streak grid packed into fruit. Eighteen
drupelets, which is the number of cells a month of posting fills, so the berry
and the calendar are the same object rather than a pun sitting next to one.

Open `index.html` for the sheet with every mark repeated at 24px, or
`contact-sheet.png` for one image. `svg/` is the source, `png/` is 200 by 200.

Raspberry is `#C2255C`. White text on it is 5.7 to 1, so the primary button
passes AA, which the burnt orange it replaced did not.

What each group tests:

| Marks | Variable |
|---|---|
| 01 to 04 | Whether the fruit needs a leaf, two leaves, a stem, or nothing. |
| 05 to 08 | Where ink goes when the whole berry is already the accent. |
| 09 to 13 | Packing. Interlocked rows, square rows, tapered, tight, loose. |
| 14 to 16 | Size and hue. Six large drupelets, a rounder berry, the deeper plum. |
| 17, 18 | The square grid recoloured, and the grid rounding into a berry. |
| 19 to 21 | Dark tile, for the app icon and any dark avatar. |
| 22 to 24 | Raspberry ground, round crop, and an outline version. |

One thing to decide with it: the mark is mostly one saturated colour, which is
the one place DESIGN.md lets the accent be the whole object rather than one
element on a surface. That is written into section 1.

## Regenerating

```
npx tsx scripts/logo-raspberry.ts
```

## After picking one

1. Move the chosen SVG to `public/logo.svg`, and the dark tile beside it.
2. Record the row counts in `DESIGN.md` section 5 if the shape changed.
3. Export the favicon set and a 400 by 400 avatar from the same SVG.
