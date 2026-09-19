/**
 * Accent candidates for goodsocials.co, shown on the two marks that were chosen:
 * the light streak grid and the dark tile.
 * One-off operator script. Not imported by app/.
 *
 *   npx tsx scripts/accent-options.ts
 *
 * Contrast is white text on the accent, which is the only way DESIGN.md allows
 * the accent to carry type: the primary button. 4.5 is the AA floor.
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const PAPER = "#F4F4F4";
const INK = "#000000";
const GREY = "#6E6E73";
const HAIRLINE = "#E6E6E6";
const WHITE = "#FFFFFF";
const INK_EMPTY = "#262626";

const OUT = join(process.cwd(), "docs", "accent-options");
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";

type Option = { hex: string; name: string; note: string; verdict: "shortlist" | "maybe" | "no" };

const options: Option[] = [
  { hex: "#E8590C", name: "Burnt orange", verdict: "maybe", note: "Where we are now. Warm, energetic, and one of four oranges in every productivity tool." },
  { hex: "#C2255C", name: "Raspberry", verdict: "shortlist", note: "Confident without being loud. Nobody in this category wears it, and it is the rare accent that can also be a text colour." },
  { hex: "#002FA7", name: "Klein blue", verdict: "shortlist", note: "Editorial and expensive looking. It is blue, but it is nothing like LinkedIn blue, which is lighter and friendlier." },
  { hex: "#A61E4D", name: "Plum", verdict: "shortlist", note: "Raspberry with the volume down. Reads as a serious tool for people billing clients." },
  { hex: "#E64980", name: "Hot pink", verdict: "maybe", note: "Younger, louder. Harder to put in front of an agency owner charging 1000 a month." },
  { hex: "#F08C00", name: "Amber", verdict: "maybe", note: "Friendlier than the current orange and the weakest contrast here. White text on it is not readable." },
  { hex: "#9C36B5", name: "Grape", verdict: "maybe", note: "Purple that is not the AI purple. Still one hue away from the thing DESIGN.md rejected." },
  { hex: "#0C8599", name: "Teal", verdict: "maybe", note: "Calm and slightly clinical. Sits between LinkedIn blue and status green, so it borrows both problems." },
  { hex: "#D9480F", name: "Rust", verdict: "maybe", note: "The current orange, darker. Fixes the button contrast without changing the brand." },
  { hex: "#E03131", name: "Signal red", verdict: "no", note: "The board has a Reject button and a dead connection state. Red is already spoken for." },
  { hex: "#7048E8", name: "Ultraviolet", verdict: "no", note: "Already rejected in DESIGN.md. Four other AI writing tools wear it." },
  { hex: "#A9E000", name: "Acid lime", verdict: "no", note: "Best thing on the dark tile and invisible on paper. An accent has to work on both." },
];

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Mark 01: the streak grid on paper. */
function light(accent: string): string {
  const cells: string[] = [];
  const pos = [40, 70, 100, 130, 160];
  let i = 0;
  for (const y of pos) {
    for (const x of pos) {
      cells.push(`<circle cx="${x}" cy="${y}" r="9" fill="${i < 18 ? INK : i === 18 ? accent : HAIRLINE}"/>`);
      i += 1;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="132" height="132"><rect width="200" height="200" fill="${PAPER}"/>${cells.join("")}</svg>`;
}

/** Mark 19: the same grid on a dark tile. */
function dark(accent: string): string {
  const cells: string[] = [];
  const pos = [40, 70, 100, 130, 160];
  let i = 0;
  for (const y of pos) {
    for (const x of pos) {
      cells.push(`<circle cx="${x}" cy="${y}" r="9" fill="${i < 18 ? WHITE : i === 18 ? accent : INK_EMPTY}"/>`);
      i += 1;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="132" height="132"><rect width="200" height="200" rx="44" fill="${INK}"/>${cells.join("")}</svg>`;
}

const verdictLabel = { shortlist: "Shortlist", maybe: "Possible", no: "Rejected" } as const;

const rows = options
  .map((o) => {
    const ratio = contrast(o.hex, WHITE);
    const passes = ratio >= 4.5;
    return `<tr class="${o.verdict}">
      <td class="marks">${light(o.hex)}${dark(o.hex)}</td>
      <td class="meta">
        <h2>${o.name} <code>${o.hex.toUpperCase()}</code></h2>
        <p>${o.note}</p>
        <div class="row">
          <button style="background:${o.hex}">Start for $100 a month</button>
          <span class="ratio ${passes ? "pass" : "fail"}">${ratio.toFixed(1)} to 1 &middot; white text ${passes ? "passes AA" : "fails AA"}</span>
          <span class="verdict">${verdictLabel[o.verdict]}</span>
        </div>
      </td>
    </tr>`;
  })
  .join("");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html>
<meta charset="utf-8">
<title>GoodSocials accent options</title>
<style>
  :root { color-scheme: light }
  html { background: ${PAPER} }
  body { margin: 0; padding: 56px 48px 64px; font: 15px/1.45 -apple-system, "Segoe UI", system-ui, sans-serif; color: ${INK}; -webkit-font-smoothing: antialiased }
  h1 { font-size: 34px; letter-spacing: -0.02em; margin: 0 0 4px; font-weight: 600 }
  h1 span { color: ${GREY} }
  p.sub { color: ${GREY}; margin: 0 0 40px; font-size: 15px; max-width: 760px }
  table { border-collapse: collapse; width: 100% }
  tr { border-top: 1px solid ${HAIRLINE} }
  tr:last-child { border-bottom: 1px solid ${HAIRLINE} }
  td { padding: 16px 0; vertical-align: middle }
  td.marks { width: 310px; white-space: nowrap }
  td.marks svg { margin-right: 16px; vertical-align: middle; border-radius: 4px }
  h2 { font-size: 19px; margin: 0 0 4px; font-weight: 600; letter-spacing: -0.01em }
  h2 code { font: 400 14px/1 ui-monospace, "SF Mono", Menlo, monospace; color: ${GREY}; padding-left: 6px }
  td.meta p { margin: 0 0 12px; color: ${GREY}; max-width: 620px }
  .row { display: flex; align-items: center; gap: 16px }
  button { border: 0; border-radius: 10px; color: #fff; font: 500 15px/1 inherit; padding: 13px 18px; cursor: default }
  .ratio { font-variant-numeric: tabular-nums; font-size: 13px }
  .ratio.pass { color: ${INK} }
  .ratio.fail { color: ${GREY} }
  .verdict { margin-left: auto; font-size: 13px; color: ${GREY} }
  tr.shortlist .verdict { color: ${INK}; font-weight: 600 }
  tr.no { opacity: 0.55 }
</style>
<h1>Accent options <span>Both chosen marks, twelve hues.</span></h1>
<p class="sub">Paper, ink and the two greys do not change. The accent is the only variable, and it appears on one element per screen: this button, the streak cell for today, the runway dot. Contrast is white text on the accent, which is the one place DESIGN.md lets the accent carry type.</p>
<table>${rows}</table>
`,
);

execFileSync(
  CHROME,
  [
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--window-size=1200,2420",
    `--screenshot=${join(OUT, "contact-sheet.png")}`,
    join(OUT, "index.html"),
  ],
  { stdio: "ignore" },
);

for (const o of options) {
  const ratio = contrast(o.hex, WHITE).toFixed(1);
  console.log(`${o.hex}  ${ratio.padStart(4)}:1  ${o.name}`);
}
