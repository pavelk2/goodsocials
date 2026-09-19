/**
 * Generates 24 logo candidates for goodsocials.co as SVG source plus 200x200 PNG.
 * One-off operator script. Not imported by app/.
 *
 *   npx tsx scripts/logo-candidates.ts
 *
 * Palette is fixed by DESIGN.md: paper, ink, two greys, one accent.
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const PAPER = "#F4F4F4";
const INK = "#000000";
const GREY = "#6E6E73";
const GREY_2 = "#B4B4B8";
const HAIRLINE = "#E6E6E6";
const ACCENT = "#C2255C";
const WHITE = "#FFFFFF";

const OUT = join(process.cwd(), "docs", "logo-candidates");
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

type Variant = {
  id: string;
  name: string;
  note: string;
  bg: string;
  body: string;
};

/** Geometric G: a ring with a gap on the right, plus a crossbar. */
function gMark(cx: number, cy: number, r: number, w: number, ring: string, bar: string): string {
  const startX = cx + r * Math.cos(-Math.PI / 4);
  const startY = cy + r * Math.sin(-Math.PI / 4);
  const endX = cx + r;
  return [
    `<path d="M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${r} ${r} 0 1 0 ${endX} ${cy}" fill="none" stroke="${ring}" stroke-width="${w}" stroke-linecap="butt"/>`,
    `<path d="M ${endX} ${cy} L ${cx - r * 0.42} ${cy}" fill="none" stroke="${bar}" stroke-width="${w}" stroke-linecap="butt"/>`,
  ].join("");
}

/** Geometric S: two half ellipses stacked, stroked. Elliptical so it can match the G's height. */
function sMark(cx: number, cy: number, rx: number, ry: number, w: number, color: string): string {
  const upper = cy - ry;
  const lower = cy + ry;
  const ax = cx + rx * Math.cos(-Math.PI / 6);
  const ay = upper + ry * Math.sin(-Math.PI / 6);
  const bx = cx + rx * Math.cos((5 * Math.PI) / 6);
  const by = lower + ry * Math.sin((5 * Math.PI) / 6);
  return `<path d="M ${ax.toFixed(2)} ${ay.toFixed(2)} A ${rx} ${ry} 0 1 0 ${cx} ${cy} A ${rx} ${ry} 0 1 1 ${bx.toFixed(2)} ${by.toFixed(2)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="butt"/>`;
}

function check(points: string, color: string, w: number): string {
  return `<path d="${points}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="butt" stroke-linejoin="miter"/>`;
}

function tile(color: string): string {
  return `<rect x="0" y="0" width="200" height="200" rx="44" fill="${color}"/>`;
}

function bar(x: number, y: number, w: number, h: number, fill: string, rx = 8): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
}

function dot(cx: number, cy: number, r: number, fill: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
}

const variants: Variant[] = [
  // A. The G, as a geometric monogram.
  {
    id: "01-g-open",
    name: "G, open",
    note: "Geometric G. The crossbar is the only colour.",
    bg: PAPER,
    body: gMark(100, 100, 52, 22, INK, ACCENT),
  },
  {
    id: "02-g-heavy",
    name: "G, heavy",
    note: "Same construction at display weight. Square terminal in accent.",
    bg: PAPER,
    body:
      gMark(100, 100, 50, 32, INK, INK) +
      `<rect x="134" y="84" width="32" height="32" fill="${ACCENT}"/>`,
  },
  {
    id: "03-g-tile",
    name: "G, dark tile",
    note: "App icon weight. Same mark knocked out of ink.",
    bg: PAPER,
    body: tile(INK) + gMark(100, 100, 46, 20, WHITE, ACCENT),
  },
  {
    id: "04-g-badge",
    name: "G, accent badge",
    note: "Spends the whole accent budget in one disc. Loudest option.",
    bg: PAPER,
    body: `<circle cx="100" cy="100" r="58" fill="${ACCENT}"/>` + gMark(100, 100, 40, 18, WHITE, WHITE),
  },

  // B. The board.
  {
    id: "05-board-bars",
    name: "Five columns",
    note: "Idea, Draft, Image, Scheduled, Posted. Posted is the accent.",
    bg: PAPER,
    body: [
      bar(36, 92, 16, 56, INK),
      bar(64, 64, 16, 84, INK),
      bar(92, 104, 16, 44, INK),
      bar(120, 48, 16, 100, INK),
      bar(148, 76, 16, 72, ACCENT),
    ].join(""),
  },
  {
    id: "06-board-tile",
    name: "Five columns, tile",
    note: "The board as an app icon. Survives 16px.",
    bg: PAPER,
    body:
      tile(INK) +
      [
        bar(50, 96, 14, 46, WHITE),
        bar(74, 72, 14, 70, WHITE),
        bar(98, 108, 14, 34, WHITE),
        bar(122, 58, 14, 84, WHITE),
        bar(146, 84, 14, 58, ACCENT),
      ].join(""),
  },
  {
    id: "07-board-cards",
    name: "Cards in columns",
    note: "Three columns, uneven counts. A real board is never balanced.",
    bg: PAPER,
    body: [
      bar(30, 56, 36, 16, INK, 5),
      bar(30, 80, 36, 16, INK, 5),
      bar(30, 104, 36, 16, INK, 5),
      bar(82, 56, 36, 16, INK, 5),
      bar(82, 80, 36, 16, INK, 5),
      bar(134, 56, 36, 16, ACCENT, 5),
    ].join(""),
  },
  {
    id: "08-board-move",
    name: "Card moved",
    note: "The one card that just changed column.",
    bg: PAPER,
    body: [
      bar(34, 60, 52, 22, INK, 6),
      bar(34, 90, 52, 22, INK, 6),
      bar(34, 120, 52, 22, INK, 6),
      bar(114, 60, 52, 22, ACCENT, 6),
      bar(114, 90, 52, 22, GREY_2, 6),
    ].join(""),
  },

  // C. Approve.
  {
    id: "09-check-tile",
    name: "Approve, tile",
    note: "The only action that matters, cut out of ink.",
    bg: PAPER,
    body: tile(INK) + check("M 56 102 L 88 134 L 148 66", WHITE, 20),
  },
  {
    id: "10-check-accent",
    name: "Approve, accent",
    note: "Bare mark. Nothing to shrink badly.",
    bg: PAPER,
    body: check("M 48 100 L 86 138 L 154 62", ACCENT, 24),
  },
  {
    id: "11-check-ring",
    name: "Approve, ring",
    note: "Ring holds it together in a round avatar crop.",
    bg: PAPER,
    body:
      `<circle cx="100" cy="100" r="64" fill="none" stroke="${INK}" stroke-width="12"/>` +
      check("M 68 100 L 90 122 L 134 78", ACCENT, 16),
  },
  {
    id: "12-queue-check",
    name: "Queue approved",
    note: "Three drafts waiting, one approval. The whole product.",
    bg: PAPER,
    body: [
      bar(32, 62, 72, 14, INK, 7),
      bar(32, 93, 72, 14, INK, 7),
      bar(32, 124, 72, 14, INK, 7),
      check("M 118 102 L 136 120 L 170 72", ACCENT, 16),
    ].join(""),
  },

  // D. Cadence. The outcome sold.
  {
    id: "13-streak-dots",
    name: "Streak, dots",
    note: "Posting history. Filled is published, grey is ahead of today.",
    bg: PAPER,
    body: (() => {
      const cells: string[] = [];
      const pos = [40, 70, 100, 130, 160];
      let n = 0;
      for (const y of pos) {
        for (const x of pos) {
          const fill = n < 18 ? INK : n === 18 ? ACCENT : HAIRLINE;
          cells.push(dot(x, y, 9, fill));
          n += 1;
        }
      }
      return cells.join("");
    })(),
  },
  {
    id: "14-streak-grid",
    name: "Streak, grid",
    note: "Contribution grid. Reads as regularity without a single word.",
    bg: PAPER,
    body: (() => {
      const cells: string[] = [];
      const pos = [40, 72, 104, 136];
      let n = 0;
      for (const y of pos) {
        for (const x of pos) {
          const fill = n < 12 ? INK : n === 12 ? ACCENT : HAIRLINE;
          cells.push(`<rect x="${x - 12}" y="${y - 12}" width="24" height="24" rx="6" fill="${fill}"/>`);
          n += 1;
        }
      }
      return cells.join("");
    })(),
  },
  {
    id: "15-week",
    name: "Seven days",
    note: "Four posted, today publishing, two scheduled.",
    bg: PAPER,
    body: [0, 1, 2, 3, 4, 5, 6]
      .map((i) => dot(22 + i * 26, 100, 11, i < 4 ? INK : i === 4 ? ACCENT : GREY_2))
      .join(""),
  },
  {
    id: "16-cadence-steps",
    name: "Cadence, rising",
    note: "Volume going up. Closest thing here to a chart, which is a risk.",
    bg: PAPER,
    body: [
      bar(24, 114, 26, 38, INK),
      bar(66, 90, 26, 62, INK),
      bar(108, 66, 26, 86, INK),
      bar(150, 42, 26, 110, ACCENT),
    ].join(""),
  },

  // E. The post itself.
  {
    id: "17-post-card",
    name: "Post card",
    note: "A drafted post. The last line is still being written.",
    bg: PAPER,
    body: [
      `<rect x="34" y="44" width="132" height="112" rx="18" fill="none" stroke="${INK}" stroke-width="6"/>`,
      bar(54, 72, 96, 10, INK, 5),
      bar(54, 94, 92, 10, INK, 5),
      bar(54, 116, 56, 10, ACCENT, 5),
    ].join(""),
  },
  {
    id: "18-bubble",
    name: "Bubble",
    note: "Says social without saying LinkedIn.",
    bg: PAPER,
    body: [
      `<path d="M 52 36 H 148 A 24 24 0 0 1 172 60 V 120 A 24 24 0 0 1 148 144 H 92 L 58 176 V 144 H 52 A 24 24 0 0 1 28 120 V 60 A 24 24 0 0 1 52 36 Z" fill="${INK}"/>`,
      bar(52, 66, 96, 10, WHITE, 5),
      bar(52, 88, 88, 10, WHITE, 5),
      bar(52, 110, 52, 10, ACCENT, 5),
    ].join(""),
  },
  {
    id: "19-bubble-check",
    name: "Bubble approved",
    note: "Content plus consent, one shape.",
    bg: PAPER,
    body: [
      `<path d="M 52 36 H 148 A 24 24 0 0 1 172 60 V 120 A 24 24 0 0 1 148 144 H 92 L 58 176 V 144 H 52 A 24 24 0 0 1 28 120 V 60 A 24 24 0 0 1 52 36 Z" fill="${INK}"/>`,
      check("M 72 90 L 92 110 L 130 70", ACCENT, 16),
    ].join(""),
  },
  {
    id: "20-card-approved",
    name: "Card approved",
    note: "The approval queue, literally. Busiest mark in the set.",
    bg: PAPER,
    body: [
      `<rect x="28" y="38" width="124" height="108" rx="18" fill="none" stroke="${INK}" stroke-width="6"/>`,
      bar(48, 66, 84, 9, INK, 5),
      bar(48, 86, 78, 9, INK, 5),
      bar(48, 106, 46, 9, GREY_2, 5),
      `<circle cx="146" cy="146" r="34" fill="${ACCENT}"/>`,
      check("M 132 146 L 142 156 L 162 134", WHITE, 10),
    ].join(""),
  },

  // F. GS monogram.
  {
    id: "21-gs-pair",
    name: "GS, pair",
    note: "Two letters, one weight, drawn on the same circle grid.",
    bg: PAPER,
    body: gMark(66, 100, 34, 14, INK, INK) + sMark(134, 100, 22, 17, 14, ACCENT),
  },
  {
    id: "22-gs-stack",
    name: "GS, stacked",
    note: "Square lockup. Two letters at one weight, stacked.",
    bg: PAPER,
    body: gMark(100, 62, 28, 10, INK, INK) + sMark(100, 138, 22, 14, 10, INK),
  },
  {
    id: "23-g-stop",
    name: "G, full stop",
    note: "Posted. The dot is the whole tone of voice.",
    bg: PAPER,
    body: gMark(96, 92, 48, 21, INK, INK) + `<rect x="148" y="132" width="20" height="20" fill="${ACCENT}"/>`,
  },
  {
    id: "24-gs-tile",
    name: "GS, dark tile",
    note: "The pair on ink. Safest thing to put on a dark LinkedIn avatar.",
    bg: PAPER,
    body: tile(INK) + gMark(70, 100, 30, 13, WHITE, WHITE) + sMark(130, 100, 20, 15, 13, ACCENT),
  },
];

function svg(v: Variant): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="GoodSocials logo candidate: ${v.name}"><rect width="200" height="200" fill="${v.bg}"/>${v.body}</svg>`;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, "svg"), { recursive: true });
mkdirSync(join(OUT, "png"), { recursive: true });

for (const v of variants) {
  writeFileSync(join(OUT, "svg", `${v.id}.svg`), svg(v));
}

// Render each SVG to a 200x200 PNG through headless Chromium.
const shots = join(OUT, ".shots");
mkdirSync(shots, { recursive: true });
for (const v of variants) {
  const html = `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0}</style>${svg(v)}`;
  const page = join(shots, `${v.id}.html`);
  writeFileSync(page, html);
  execFileSync(CHROME, [
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--window-size=200,200",
    `--screenshot=${join(OUT, "png", `${v.id}.png`)}`,
    page,
  ], { stdio: "ignore" });
}

// Contact sheet, four across.
const cells = variants
  .map(
    (v, i) => `<figure>
      <img src="png/${v.id}.png" width="200" height="200" alt="${v.name}">
      <figcaption><b>${String(i + 1).padStart(2, "0")} ${v.name}</b><span>${v.note}</span></figcaption>
    </figure>`,
  )
  .join("");

const sheet = `<!doctype html>
<meta charset="utf-8">
<title>GoodSocials logo candidates</title>
<style>
  :root { color-scheme: light }
  html { background: ${PAPER} }
  body { margin: 0; padding: 56px 48px 64px; font: 15px/1.45 -apple-system, "Segoe UI", system-ui, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased }
  h1 { font-size: 34px; letter-spacing: -0.02em; margin: 0 0 4px; font-weight: 600 }
  h1 span { color: ${GREY} }
  p.sub { color: ${GREY}; margin: 0 0 44px; font-size: 15px }
  .grid { display: grid; grid-template-columns: repeat(4, 200px); gap: 40px 48px }
  figure { margin: 0 }
  img { display: block; background: ${PAPER}; border: 1px solid ${HAIRLINE}; border-radius: 4px }
  figcaption { display: block; padding-top: 12px }
  figcaption b { display: block; font-weight: 600; font-size: 14px; font-variant-numeric: tabular-nums }
  figcaption span { display: block; color: ${GREY}; font-size: 13px; padding-top: 2px }
</style>
<h1>GoodSocials logo candidates <span>24 marks, 200 by 200, one accent each.</span></h1>
<p class="sub">Palette fixed by DESIGN.md: paper #F4F4F4, ink #000000, accent #E8590C. Source SVG next to every PNG.</p>
<div class="grid">${cells}</div>
`;
writeFileSync(join(OUT, "index.html"), sheet);

execFileSync(CHROME, [
  "--disable-gpu",
  "--no-sandbox",
  "--hide-scrollbars",
  "--window-size=1200,2240",
  "--screenshot=" + join(OUT, "contact-sheet.png"),
  join(OUT, "index.html"),
], { stdio: "ignore" });

rmSync(shots, { recursive: true, force: true });
console.log(`Wrote ${variants.length} candidates to docs/logo-candidates/`);
