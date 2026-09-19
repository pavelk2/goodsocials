/**
 * Exports the chosen mark: the streak grid, one cell per day, eighteen posted,
 * one cell in the accent for today.
 * One-off operator script. Not imported by app/.
 *
 *   npx tsx scripts/logo-export.ts
 *
 * Writes public/logo.svg, public/logo-tile.svg, public/avatar-400.png,
 * app/icon.svg, app/apple-icon.png and app/favicon.ico.
 */
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const INK = "#000000";
const HAIRLINE = "#E6E6E6";
const ACCENT = "#A61E4D";
const WHITE = "#FFFFFF";
const INK_EMPTY = "#262626";

const ROOT = process.cwd();
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const TMP = join(ROOT, ".logo-export");

const POS = [40, 70, 100, 130, 160];
const POSTED = 18; // days published this month
const TODAY = 18; // the accent cell

function dots(past: string, today: string, future: string): string {
  const out: string[] = [];
  let i = 0;
  for (const y of POS) {
    for (const x of POS) {
      const fill = i < POSTED ? past : i === TODAY ? today : future;
      out.push(`<circle cx="${x}" cy="${y}" r="9" fill="${fill}"/>`);
      i += 1;
    }
  }
  return out.join("");
}

/** On paper or any light ground. No background, so it drops onto anything. */
function light(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="GoodSocials"><title>GoodSocials</title>${dots(INK, ACCENT, HAIRLINE)}</svg>`;
}

/** On ink. rx 0 for anything the platform masks itself. */
function tile(rx: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="GoodSocials"><title>GoodSocials</title><rect width="200" height="200" rx="${rx}" fill="${INK}"/>${dots(WHITE, ACCENT, INK_EMPTY)}</svg>`;
}

function png(svg: string, size: number, out: string): void {
  const page = join(TMP, `${size}.html`);
  writeFileSync(
    page,
    `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;padding:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
  );
  execFileSync(
    CHROME,
    ["--disable-gpu", "--no-sandbox", "--hide-scrollbars", `--window-size=${size},${size}`, `--screenshot=${out}`, page],
    { stdio: "ignore" },
  );
}

/** A single 32px PNG wrapped in an ICO container, which is all a favicon needs. */
function ico(pngPath: string, out: string): void {
  const image = readFileSync(pngPath);
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(32, 6); // width
  header.writeUInt8(32, 7); // height
  header.writeUInt8(0, 8); // colours in palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(image.length, 14);
  header.writeUInt32LE(22, 18); // offset
  writeFileSync(out, Buffer.concat([header, image]));
}

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

writeFileSync(join(ROOT, "public", "logo.svg"), light());
writeFileSync(join(ROOT, "public", "logo-tile.svg"), tile(44));
writeFileSync(join(ROOT, "app", "icon.svg"), tile(44));

// LinkedIn and X both crop to a circle, so the avatar is full bleed.
png(tile(0), 400, join(ROOT, "public", "avatar-400.png"));
// iOS applies its own mask and its own corner radius.
png(tile(0), 180, join(ROOT, "app", "apple-icon.png"));

png(tile(6), 32, join(TMP, "favicon-32.png"));
ico(join(TMP, "favicon-32.png"), join(ROOT, "app", "favicon.ico"));

rmSync(TMP, { recursive: true, force: true });
console.log("public/logo.svg, public/logo-tile.svg, public/avatar-400.png");
console.log("app/icon.svg, app/apple-icon.png, app/favicon.ico");
