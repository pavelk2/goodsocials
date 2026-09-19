/**
 * 24 variations on the streak-grid mark for goodsocials.co.
 * One-off operator script. Not imported by app/.
 *
 *   npx tsx scripts/logo-streak.ts
 *
 * Every mark is the same idea: one cell per day, filled when a post went out,
 * one accent cell for today, the rest receding. The variables are grid shape,
 * cell form, how the run reads, and how the future is drawn.
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const PAPER = "#F4F4F4";
const INK = "#000000";
const GREY = "#6E6E73";
const GREY_2 = "#B4B4B8";
const HAIRLINE = "#E6E6E6";
const ACCENT = "#A61E4D";
const WHITE = "#FFFFFF";
const INK_EMPTY = "#262626"; // the empty cell on a dark tile

const OUT = join(process.cwd(), "docs", "logo-streak");
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

type Cell = { color: string; hollow?: boolean; r?: number; ring?: string } | null;
type Fill = (i: number, col: number, row: number) => Cell;
type Shape = "dot" | "round" | "square";

type Variant = { id: string; name: string; note: string; bg: string; body: string };

function cell(x: number, y: number, r: number, shape: Shape, c: Cell): string {
  if (!c) return "";
  const rr = c.r ?? r;
  const out: string[] = [];
  if (c.ring) {
    out.push(`<circle cx="${x}" cy="${y}" r="${rr + 7}" fill="none" stroke="${c.ring}" stroke-width="3"/>`);
  }
  if (shape === "dot") {
    out.push(
      c.hollow
        ? `<circle cx="${x}" cy="${y}" r="${rr - 1.5}" fill="none" stroke="${c.color}" stroke-width="3"/>`
        : `<circle cx="${x}" cy="${y}" r="${rr}" fill="${c.color}"/>`,
    );
  } else {
    const rx = shape === "round" ? rr * 0.42 : 0;
    out.push(
      c.hollow
        ? `<rect x="${x - rr + 1.5}" y="${y - rr + 1.5}" width="${rr * 2 - 3}" height="${rr * 2 - 3}" rx="${rx}" fill="none" stroke="${c.color}" stroke-width="3"/>`
        : `<rect x="${x - rr}" y="${y - rr}" width="${rr * 2}" height="${rr * 2}" rx="${rx}" fill="${c.color}"/>`,
    );
  }
  return out.join("");
}

/** A centred grid of cells. Row-major index unless byColumn is set. */
function grid(
  cols: number,
  rows: number,
  r: number,
  gap: number,
  shape: Shape,
  fill: Fill,
  byColumn = false,
): string {
  const step = 2 * r + gap;
  const x0 = (200 - (cols * 2 * r + (cols - 1) * gap)) / 2 + r;
  const y0 = (200 - (rows * 2 * r + (rows - 1) * gap)) / 2 + r;
  const out: string[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const i = byColumn ? col * rows + row : row * cols + col;
      out.push(cell(x0 + col * step, y0 + row * step, r, shape, fill(i, col, row)));
    }
  }
  return out.join("");
}

/** Posted, today, then the days that have not happened yet. */
function run(today: number, future: string, past = INK, accent = ACCENT): Fill {
  return (i) => (i < today ? { color: past } : i === today ? { color: accent } : { color: future });
}

const variants: Variant[] = [
  {
    id: "01-base",
    name: "Base",
    note: "The mark you picked, unchanged. Everything here is measured against it.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", run(18, HAIRLINE)),
  },
  {
    id: "02-dense-36",
    name: "Denser, 36",
    note: "More days in the same frame. Reads as texture before it reads as days.",
    bg: PAPER,
    body: grid(6, 6, 7, 9, "dot", run(25, HAIRLINE)),
  },
  {
    id: "03-month-28",
    name: "Four weeks",
    note: "Seven across, so the rows are actual weeks. Wide, not square.",
    bg: PAPER,
    body: grid(7, 4, 8, 9, "dot", run(18, HAIRLINE)),
  },
  {
    id: "04-big-16",
    name: "Sixteen, large",
    note: "Fewest cells, biggest dots. The version that survives a favicon.",
    bg: PAPER,
    body: grid(4, 4, 14, 16, "dot", run(11, HAIRLINE)),
  },
  {
    id: "05-month-35",
    name: "Full month",
    note: "Thirty five cells. Honest to the dashboard, busy as a mark.",
    bg: PAPER,
    body: grid(7, 5, 7, 8, "dot", run(22, HAIRLINE)),
  },
  {
    id: "06-airy",
    name: "Airy",
    note: "Same grid, more space between days. Calmer, weaker at small sizes.",
    bg: PAPER,
    body: grid(5, 5, 7, 20, "dot", run(18, HAIRLINE)),
  },
  {
    id: "07-rounded",
    name: "Rounded cells",
    note: "Squares with the card radius. Closer to the board, further from a chart.",
    bg: PAPER,
    body: grid(5, 5, 10, 10, "round", run(18, HAIRLINE)),
  },
  {
    id: "08-square",
    name: "Hard squares",
    note: "No radius anywhere. The most engineered of the set.",
    bg: PAPER,
    body: grid(5, 5, 10, 10, "square", run(18, HAIRLINE)),
  },
  {
    id: "09-hollow-future",
    name: "Hollow future",
    note: "The days ahead are outlines. The grid stays legible without filling in.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (i) =>
      i < 18 ? { color: INK } : i === 18 ? { color: ACCENT } : { color: GREY_2, hollow: true },
    ),
  },
  {
    id: "10-three-states",
    name: "Three states",
    note: "Posted, publishing, scheduled, empty. The whole queue in one mark.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (i) =>
      i < 18
        ? { color: INK }
        : i === 18
          ? { color: ACCENT }
          : i < 22
            ? { color: INK, hollow: true }
            : { color: HAIRLINE },
    ),
  },
  {
    id: "11-diagonal",
    name: "Diagonal run",
    note: "The streak crosses the field instead of filling it. Prettiest, least true.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (_i, col, row) =>
      col === row ? { color: row === 4 ? ACCENT : INK } : { color: HAIRLINE },
    ),
  },
  {
    id: "12-accent-row",
    name: "This week",
    note: "One row in accent. Reads as a week rather than a day.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (_i, _col, row) =>
      row < 3 ? { color: INK } : row === 3 ? { color: ACCENT } : { color: HAIRLINE },
    ),
  },
  {
    id: "13-broken",
    name: "Broken streak",
    note: "One day missed, in the middle. Honest, and a strange thing to put on a logo.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (i) =>
      i === 12 ? { color: HAIRLINE } : i < 18 ? { color: INK } : i === 18 ? { color: ACCENT } : { color: HAIRLINE },
    ),
  },
  {
    id: "14-columns",
    name: "Filled by column",
    note: "The run reads top to bottom. Same data, a board rather than a calendar.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", run(18, HAIRLINE), true),
  },
  {
    id: "15-today-large",
    name: "Today, large",
    note: "Scale carries today instead of colour. Breaks the grid on purpose.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (i) =>
      i < 18 ? { color: INK } : i === 18 ? { color: ACCENT, r: 13 } : { color: HAIRLINE },
    ),
  },
  {
    id: "16-today-ringed",
    name: "Today, ringed",
    note: "A ring around the current day. One more part to lose at 16px.",
    bg: PAPER,
    body: grid(5, 5, 8, 14, "dot", (i) =>
      i < 18 ? { color: INK } : i === 18 ? { color: ACCENT, ring: ACCENT } : { color: HAIRLINE },
    ),
  },
  {
    id: "17-no-future",
    name: "Ragged edge",
    note: "The days ahead are not drawn at all. Strongest silhouette in the set.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (i) => (i < 18 ? { color: INK } : i === 18 ? { color: ACCENT } : null)),
  },
  {
    id: "18-two-greys",
    name: "Scheduled ahead",
    note: "Grey for what is already queued. Says the board is not empty.",
    bg: PAPER,
    body: grid(5, 5, 9, 12, "dot", (i) =>
      i < 18 ? { color: INK } : i === 18 ? { color: ACCENT } : i < 21 ? { color: GREY_2 } : { color: HAIRLINE },
    ),
  },
  {
    id: "19-tile-dots",
    name: "Dark tile",
    note: "App icon. The empty days are a tint of the tile, not a hole in it.",
    bg: PAPER,
    body:
      `<rect width="200" height="200" rx="44" fill="${INK}"/>` +
      grid(5, 5, 9, 12, "dot", run(18, INK_EMPTY, WHITE)),
  },
  {
    id: "20-tile-month",
    name: "Dark tile, weeks",
    note: "Seven across on ink. Reads as a calendar at a glance.",
    bg: PAPER,
    body:
      `<rect width="200" height="200" rx="44" fill="${INK}"/>` +
      grid(7, 4, 8, 9, "dot", run(18, INK_EMPTY, WHITE)),
  },
  {
    id: "21-tile-rounded",
    name: "Dark tile, cells",
    note: "Rounded cells on ink. Closest to the board it comes from.",
    bg: PAPER,
    body:
      `<rect width="200" height="200" rx="44" fill="${INK}"/>` +
      grid(5, 5, 10, 10, "round", run(18, INK_EMPTY, WHITE)),
  },
  {
    id: "22-g-of-dots",
    name: "G of days",
    note: "The grid spells the letter. Carries the name and the cadence at once.",
    bg: PAPER,
    body: (() => {
      const g = [".#####.", "#.....#", "#......", "#..####", "#.....#", "#.....#", ".#####."];
      return grid(7, 7, 8, 7, "dot", (_i, col, row) => {
        const on = g[row][col] === "#";
        if (!on) return { color: HAIRLINE, r: 4 };
        return { color: row === 3 && col === 6 ? ACCENT : INK };
      });
    })(),
  },
  {
    id: "23-ring-of-days",
    name: "Ring of days",
    note: "Twelve days around a circle. Sits well in a round avatar crop.",
    bg: PAPER,
    body: Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const x = 100 + 64 * Math.cos(a);
      const y = 100 + 64 * Math.sin(a);
      const color = i < 9 ? INK : i === 9 ? ACCENT : HAIRLINE;
      return `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="12" fill="${color}"/>`;
    }).join(""),
  },
  {
    id: "24-disc",
    name: "Disc of days",
    note: "The grid cropped to a circle, whole cells only. A mark, not a chart.",
    bg: PAPER,
    body: (() => {
      const kept: Array<{ x: number; y: number }> = [];
      const r = 7;
      const gap = 8;
      const step = 2 * r + gap;
      const x0 = (200 - (7 * 2 * r + 6 * gap)) / 2 + r;
      const y0 = x0;
      for (let row = 0; row < 7; row += 1) {
        for (let col = 0; col < 7; col += 1) {
          const x = x0 + col * step;
          const y = y0 + row * step;
          if (Math.hypot(x - 100, y - 100) <= 70) kept.push({ x, y });
        }
      }
      return kept
        .map((p, i) => `<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${i < kept.length - 4 ? INK : i === kept.length - 4 ? ACCENT : HAIRLINE}"/>`)
        .join("");
    })(),
  },
];

function svg(v: Variant): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="GoodSocials streak mark: ${v.name}"><rect width="200" height="200" fill="${v.bg}"/>${v.body}</svg>`;
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
    [
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--window-size=200,200",
      `--screenshot=${join(OUT, "png", `${v.id}.png`)}`,
      page,
    ],
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
<title>GoodSocials streak mark</title>
<style>
  :root { color-scheme: light }
  html { background: ${PAPER} }
  body { margin: 0; padding: 56px 48px 64px; font: 15px/1.45 -apple-system, "Segoe UI", system-ui, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased }
  h1 { font-size: 34px; letter-spacing: -0.02em; margin: 0 0 4px; font-weight: 600 }
  h1 span { color: ${GREY} }
  p.sub { color: ${GREY}; margin: 0 0 44px; font-size: 15px }
  .grid { display: grid; grid-template-columns: repeat(4, 200px); gap: 40px 48px }
  figure { margin: 0 }
  img.big { display: block; background: ${PAPER}; border: 1px solid ${HAIRLINE}; border-radius: 4px }
  img.tiny { vertical-align: -5px; margin-right: 8px; border: 1px solid ${HAIRLINE} }
  figcaption { display: block; padding-top: 12px }
  figcaption b { display: block; font-weight: 600; font-size: 14px; font-variant-numeric: tabular-nums }
  figcaption span { display: block; color: ${GREY}; font-size: 13px; padding-top: 4px }
</style>
<h1>Streak mark <span>24 variations on one idea: a cell per day, one accent for today.</span></h1>
<p class="sub">Every caption carries the same mark at 24px, which is where most of these get decided.</p>
<div class="grid">${cells}</div>
`,
);

execFileSync(
  CHROME,
  [
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--window-size=1200,2240",
    `--screenshot=${join(OUT, "contact-sheet.png")}`,
    join(OUT, "index.html"),
  ],
  { stdio: "ignore" },
);

rmSync(shots, { recursive: true, force: true });
console.log(`Wrote ${variants.length} streak variations to docs/logo-streak/`);
