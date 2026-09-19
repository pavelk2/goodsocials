# Accent options

Twelve candidate accents, each shown on the two marks that were chosen: the
light streak grid and the dark tile. Open `index.html`, or `contact-sheet.png`
for one image.

Nothing else moves. Paper `#F4F4F4`, ink `#000000` and the two greys are fixed,
and the accent still appears on one element per screen.

Two numbers decide most of this:

- **White text on the accent.** The landing button is the one place DESIGN.md
  lets the accent carry type. 4.5 to 1 is the AA floor. The current burnt
  orange sits at 3.6, so the button we have today fails it.
- **How the accent cell reads against ink.** The mark is one coloured cell in a
  field of black ones. A dark accent has good text contrast and a weak cell. A
  bright accent has the opposite problem. Anything in the middle is the answer.

## Regenerating

```
npx tsx scripts/accent-options.ts
```

Contrast ratios are computed in the script, not copied from a tool.

## When one is chosen

Four files carry the hex:

1. `app/globals.css`, the `--accent` token. Every component reads it from there.
2. `DESIGN.md` section 1, which holds the reasoning and the rejections.
3. `scripts/logo-candidates.ts` and `scripts/logo-streak.ts`, then regenerate
   both sheets so they stop showing the old colour.
