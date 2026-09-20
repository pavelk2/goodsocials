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
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { deflateSync } from "node:zlib";
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

/**
 * The favicon, rasterised here instead of screenshotted.
 *
 * Chrome writes screenshots as PNGs with no alpha channel, and an ICO carrying
 * one of those is rejected by the decoder Next uses to build the icon route.
 * That failure is not confined to the icon: it fails the build and returns 500
 * on every page. The mark is twenty-five circles on a square, so drawing it
 * directly is less code than the workaround and the format is then ours.
 *
 * Returns straight RGBA pixels, eight samples per axis for the edges.
 */
function rasterIcon(size: number): Buffer {
  const SS = 8;
  const rx = 6; // the tile radius, in the 200 frame
  const out = Buffer.alloc(size * size * 4);
  const rgb = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const cells: { x: number; y: number; c: number[] }[] = [];
  let i = 0;
  for (const y of POS) {
    for (const x of POS) {
      const fill = i < POSTED ? WHITE : i === TODAY ? ACCENT : INK_EMPTY;
      cells.push({ x, y, c: rgb(fill) });
      i += 1;
    }
  }
  const ink = rgb(INK);

  /** Inside the rounded square, in the 200 frame. Corners only, so one test. */
  const inTile = (x: number, y: number) => {
    if (x < 0 || y < 0 || x > 200 || y > 200) return false;
    const cx = Math.min(Math.max(x, rx), 200 - rx);
    const cy = Math.min(Math.max(y, rx), 200 - rx);
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy <= rx * rx;
  };

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const ux = ((px + (sx + 0.5) / SS) / size) * 200;
          const uy = ((py + (sy + 0.5) / SS) / size) * 200;
          if (!inTile(ux, uy)) continue;
          let colour = ink;
          for (const cell of cells) {
            const dx = ux - cell.x;
            const dy = uy - cell.y;
            if (dx * dx + dy * dy <= 81) {
              colour = cell.c;
              break;
            }
          }
          r += colour[0];
          g += colour[1];
          b += colour[2];
          a += 255;
        }
      }
      const n = SS * SS;
      const o = (py * size + px) * 4;
      // Premultiplied average, so a partly covered edge pixel keeps its hue.
      const cover = a / (n * 255);
      out[o] = cover ? Math.round(r / (n * cover)) : 0;
      out[o + 1] = cover ? Math.round(g / (n * cover)) : 0;
      out[o + 2] = cover ? Math.round(b / (n * cover)) : 0;
      out[o + 3] = Math.round(a / n);
    }
  }
  return out;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** An 8-bit RGBA PNG. Colour type 6 is the one the ICO decoder accepts. */
function encodePng(pixels: Buffer, size: number): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y += 1) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** A single 32px PNG wrapped in an ICO container, which is all a favicon needs. */
function ico(image: Buffer, out: string): void {
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

ico(encodePng(rasterIcon(32), 32), join(ROOT, "app", "favicon.ico"));

rmSync(TMP, { recursive: true, force: true });
console.log("public/logo.svg, public/logo-tile.svg, public/avatar-400.png");
console.log("app/icon.svg, app/apple-icon.png, app/favicon.ico");
