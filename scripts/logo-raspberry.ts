/**
 * 24 variations on the streak grid read as a raspberry.
 * One-off operator script. Not imported by app/.
 *
 *   npx tsx scripts/logo-raspberry.ts
 *
 * The drupelets are the cells. Eighteen of them, which is the same count the
 * streak mark fills, so the fruit and the calendar are the same object.
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const PAPER = "#F4F4F4";
const INK = "#000000";
const GREY = "#6E6E73";
const HAIRLINE = "#E6E6E6";
const BERRY = "#C2255C";
const BERRY_DEEP = "#A61E4D";
const WHITE = "#FFFFFF";
const INK_EMPTY = "#262626";

const OUT = join(process.cwd(), "docs", "logo-raspberry");
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

type Cell = { color: string; hollow?: boolean; r?: number } | null;
type Fill = (i: number, row: number, col: number, total: number) => Cell;
type Shape = "dot" | "round";
type Variant = { id: string; name: string; note: string; bg: string; body: string };

/** Rows of drupelets, each row centred, so rows of different counts interlock. */
function cluster(
  rows: number[],
  r: number,
  gap: number,
  fill: Fill,
  shape: Shape = "dot",
  packed = true,
  taper = 0,
): string {
  const s = 2 * r + gap;
  const vs = packed ? s * 0.866 : s;
  const total = rows.reduce((a, b) => a + b, 0);
  const height = (rows.length - 1) * vs + 2 * r;
  const y0 = (200 - height) / 2 + r;
  const out: string[] = [];
  let i = 0;
  rows.forEach((n, row) => {
    const rr = r - taper * row;
    const width = (n - 1) * s;
    const x0 = (200 - width) / 2;
    for (let col = 0; col < n; col += 1) {
      const c = fill(i, row, col, total);
      i += 1;
      if (!c) continue;
      const x = x0 + col * s;
      const y = y0 + row * vs;
      const size = c.r ?? rr;
      if (shape === "dot") {
        out.push(
          c.hollow
            ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size - 2).toFixed(1)}" fill="none" stroke="${c.color}" stroke-width="3.5"/>`
            : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${c.color}"/>`,
        );
      } else {
        out.push(
          `<rect x="${(x - size).toFixed(1)}" y="${(y - size).toFixed(1)}" width="${(size * 2).toFixed(1)}" height="${(size * 2).toFixed(1)}" rx="${(size * 0.42).toFixed(1)}" fill="${c.color}"/>`,
        );
      }
    }
  });
  return out.join("");
}

/** A lens, which is the only leaf shape that belongs in a geometric mark. */
function leaf(cx: number, cy: number, len: number, w: number, deg: number, color: string): string {
  const h = w / 2;
  const R = h / 2 + (len * len) / (8 * h);
  const d = `M ${-len / 2} 0 A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${len / 2} 0 A ${R.toFixed(1)} ${R.toFixed(1)} 0 0 1 ${-len / 2} 0 Z`;
  return `<g transform="translate(${cx} ${cy}) rotate(${deg})"><path d="${d}" fill="${color}"/></g>`;
}

const BERRY_ROWS = [4, 5, 4, 3, 2]; // 18 drupelets
const solid = (color: string): Fill => () => ({ color });
const streak = (posted: number, past: string, future: string, today?: string): Fill => (i) =>
  i < posted ? { color: past } : i === posted && today ? { color: today } : { color: future };

const variants: Variant[] = [
  {
    id: "01-berry",
    name: "Berry",
    note: "Eighteen drupelets, the same count the streak mark fills. No decoration.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, solid(BERRY)),
  },
  {
    id: "02-berry-leaf",
    name: "Berry, one leaf",
    note: "One ink leaf. Reads as fruit a second faster, costs a part at small sizes.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, solid(BERRY)) + leaf(128, 42, 46, 20, -32, INK),
  },
  {
    id: "03-berry-two-leaves",
    name: "Berry, two leaves",
    note: "A hull rather than a leaf. More botanical, less mark.",
    bg: PAPER,
    body:
      cluster(BERRY_ROWS, 12, 4, solid(BERRY)) +
      leaf(128, 42, 42, 18, -32, INK) +
      leaf(72, 42, 42, 18, 32, INK),
  },
  {
    id: "04-berry-stem",
    name: "Berry, stem",
    note: "A 6px ink stem instead of a leaf. Survives the favicon that a leaf does not.",
    bg: PAPER,
    body:
      cluster(BERRY_ROWS, 12, 4, solid(BERRY)) +
      `<rect x="97" y="22" width="6" height="22" rx="3" fill="${INK}"/>`,
  },
  {
    id: "05-berry-ink-hull",
    name: "Ink hull",
    note: "The top row is the hull, in ink. One shape, two materials, no extra parts.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, (_i, row) => ({ color: row === 0 ? INK : BERRY })),
  },
  {
    id: "06-berry-today",
    name: "Today, ink",
    note: "The whole fruit is the accent, so today has to be ink. Inverts the usual rule.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, (i) => ({ color: i === 11 ? INK : BERRY })),
  },
  {
    id: "07-berry-fills",
    name: "Fruit fills",
    note: "Posted days are drupelets, the rest are outlines. The berry completes as the month does.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, (i) =>
      i < 12 ? { color: BERRY } : { color: BERRY, hollow: true },
    ),
  },
  {
    id: "08-berry-calendar",
    name: "Calendar, berry shaped",
    note: "Ink for posted, raspberry for today, hairline ahead. The old logic in the new silhouette.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, streak(13, INK, HAIRLINE, BERRY)),
  },
  {
    id: "09-berry-square",
    name: "Unpacked rows",
    note: "Rows sit square instead of interlocking. More calendar, less fruit.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, solid(BERRY), "dot", false),
  },
  {
    id: "10-berry-cells",
    name: "Cells, not dots",
    note: "Drupelets as board cards. The mark comes from the product rather than the fruit.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 6, solid(BERRY), "round", false),
  },
  {
    id: "11-berry-taper",
    name: "Tapered",
    note: "Drupelets shrink toward the point. Rounder, and it stops being a grid.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 14, 3, solid(BERRY), "dot", true, 1.4),
  },
  {
    id: "12-berry-tight",
    name: "Tight packing",
    note: "Almost touching. Reads as one object before it reads as cells.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 14, 1, solid(BERRY)),
  },
  {
    id: "13-berry-loose",
    name: "Loose packing",
    note: "Air between the drupelets. Keeps the calendar reading, weakens the fruit.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 10, 12, solid(BERRY)),
  },
  {
    id: "14-berry-big",
    name: "Six drupelets",
    note: "Fewest parts, biggest cells. The version that still works at 16px.",
    bg: PAPER,
    body: cluster([3, 2, 1], 23, 4, solid(BERRY)),
  },
  {
    id: "15-berry-round",
    name: "Round berry",
    note: "Widest in the middle, not at the top. Closer to a blackberry than a raspberry.",
    bg: PAPER,
    body: cluster([3, 4, 5, 4, 3], 12, 4, solid(BERRY)),
  },
  {
    id: "16-berry-deep",
    name: "Deep raspberry",
    note: "The darker plum at #A61E4D. Heavier, and the type next to it can stay black.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, solid(BERRY_DEEP)),
  },
  {
    id: "17-grid-berry",
    name: "Grid, berry coloured",
    note: "The mark you picked, recoloured. Square, and no fruit at all.",
    bg: PAPER,
    body: (() => {
      const pos = [40, 70, 100, 130, 160];
      const out: string[] = [];
      let i = 0;
      for (const y of pos)
        for (const x of pos) {
          out.push(`<circle cx="${x}" cy="${y}" r="9" fill="${i < 18 ? BERRY : i === 18 ? INK : HAIRLINE}"/>`);
          i += 1;
        }
      return out.join("");
    })(),
  },
  {
    id: "18-grid-cornerless",
    name: "Grid, corners off",
    note: "A 5 by 5 with the four corners dropped. The calendar rounding into a berry.",
    bg: PAPER,
    body: cluster([3, 5, 5, 5, 3], 11, 8, (i) => ({ color: i === 11 ? INK : BERRY }), "dot", false),
  },
  {
    id: "19-tile-berry",
    name: "Dark tile",
    note: "App icon. Raspberry on ink is the strongest pairing in the set.",
    bg: PAPER,
    body: `<rect width="200" height="200" rx="44" fill="${INK}"/>` + cluster(BERRY_ROWS, 11, 4, solid(BERRY)),
  },
  {
    id: "20-tile-leaf",
    name: "Dark tile, leaf",
    note: "The leaf in white so it reads against the tile.",
    bg: PAPER,
    body:
      `<rect width="200" height="200" rx="44" fill="${INK}"/>` +
      cluster(BERRY_ROWS, 11, 4, solid(BERRY)) +
      leaf(126, 46, 40, 17, -32, WHITE),
  },
  {
    id: "21-tile-fills",
    name: "Dark tile, filling",
    note: "Posted days bright, the rest a tint of the tile. Cadence visible in the icon.",
    bg: PAPER,
    body:
      `<rect width="200" height="200" rx="44" fill="${INK}"/>` +
      cluster(BERRY_ROWS, 11, 4, streak(12, BERRY, INK_EMPTY)),
  },
  {
    id: "22-tile-berry-ground",
    name: "Raspberry tile",
    note: "Ground and figure swapped. The loudest thing here, and the best avatar.",
    bg: PAPER,
    body: `<rect width="200" height="200" rx="44" fill="${BERRY}"/>` + cluster(BERRY_ROWS, 11, 4, solid(WHITE)),
  },
  {
    id: "23-disc",
    name: "Raspberry disc",
    note: "For the round crop LinkedIn and X both apply anyway.",
    bg: PAPER,
    body: `<circle cx="100" cy="100" r="88" fill="${BERRY}"/>` + cluster(BERRY_ROWS, 10, 4, solid(WHITE)),
  },
  {
    id: "24-outline",
    name: "Outline",
    note: "Every drupelet hollow. Lightest on the page, first to disappear at small sizes.",
    bg: PAPER,
    body: cluster(BERRY_ROWS, 12, 4, (i) => ({ color: i === 11 ? INK : BERRY, hollow: true })),
  },
];

function svg(v: Variant): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="GoodSocials raspberry mark: ${v.name}"><rect width="200" height="200" fill="${v.bg}"/>${v.body}</svg>`;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "svg"), { recursive: true });
mkdirSync(join(OUT, "png"), { recursive: true });
const shots = join(OUT, ".shots");
mkdirSync(shots, { recursive: true });

for (const v of variants) {
  writeFileSync(join(OUT, "svg", `${v.id}.svg`), svg(v));
  const page = join(shots, `${v.id}.html`);
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0}</style>${svg(v)}`);
  execFileSync(
    CHROME,
    ["--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=200,200", `--screenshot=${join(OUT, "png", `${v.id}.png`)}`, page],
    { stdio: "ignore" },
  );
}

const cells = variants
  .map(
    (v, i) => `<figure>
      <img class="big" src="png/${v.id}.png" width="200" height="200" alt="${v.name}">
      <figcaption>
        <b><img class="tiny" src="png/${v.id}.png" width="24" height="24" alt="">${String(i + 1).padStart(2, "0")} ${v.name}</b>
        <span>${v.note}</span>
      </figcaption>
    </figure>`,
  )
  .join("");

writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html>
<meta charset="utf-8">
<title>GoodSocials raspberry mark</title>
<style>
  :root { color-scheme: light }
  html { background: ${PAPER} }
  body { margin: 0; padding: 56px 48px 64px; font: 15px/1.45 -apple-system, "Segoe UI", system-ui, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased }
  h1 { font-size: 34px; letter-spacing: -0.02em; margin: 0 0 4px; font-weight: 600 }
  h1 span { color: ${GREY} }
  p.sub { color: ${GREY}; margin: 0 0 44px; font-size: 15px; max-width: 780px }
  .grid { display: grid; grid-template-columns: repeat(4, 200px); gap: 40px 48px }
  figure { margin: 0 }
  img.big { display: block; background: ${PAPER}; border: 1px solid ${HAIRLINE}; border-radius: 4px }
  img.tiny { vertical-align: -5px; margin-right: 8px; border: 1px solid ${HAIRLINE} }
  figcaption { display: block; padding-top: 12px }
  figcaption b { display: block; font-weight: 600; font-size: 14px; font-variant-numeric: tabular-nums }
  figcaption span { display: block; color: ${GREY}; font-size: 13px; padding-top: 4px }
</style>
<h1>Raspberry mark <span>The streak grid, packed into fruit.</span></h1>
<p class="sub">Eighteen drupelets, which is the number of cells the streak mark fills, so the fruit and the calendar are the same object. Raspberry is #C2255C. Every caption repeats the mark at 24px.</p>
<div class="grid">${cells}</div>
`,
);

execFileSync(
  CHROME,
  ["--disable-gpu", "--no-sandbox", "--hide-scrollbars", "--window-size=1200,2240", `--screenshot=${join(OUT, "contact-sheet.png")}`, join(OUT, "index.html")],
  { stdio: "ignore" },
);

rmSync(shots, { recursive: true, force: true });
console.log(`Wrote ${variants.length} raspberry variations to docs/logo-raspberry/`);
