/**
 * Exports the pictures a link to goodsocials.co is shared with, and the
 * Product Hunt kit. One-off operator script. Not imported by app/.
 *
 *   npx tsx scripts/share-export.ts
 *   npx tsx scripts/share-export.ts --gallery http://localhost:3000
 *
 * Always writes:
 *   app/opengraph-image.png   1200x630, LinkedIn, Facebook, WhatsApp, Telegram, Slack, iMessage
 *   app/twitter-image.png     1200x630, X
 *   public/product-hunt/thumbnail-240.png
 *
 * With --gallery and a running server, also writes the Product Hunt gallery,
 * public/product-hunt/gallery-1.png to gallery-5.png at 1270x760, each one a
 * caption over a section of the landing page as the server renders it.
 *
 * Colours are read from the tokens in app/globals.css, so the accent stays
 * written once. The layout is centred on purpose: WhatsApp and iMessage show a
 * link as a square cut from the middle of the picture, and the mark and the
 * word LinkedIn survive that cut.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const CHROME = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const TMP = join(ROOT, ".share-export");
const FONT = pathToFileURL(
  join(ROOT, "node_modules/next/dist/next-devtools/server/font/geist-latin.woff2"),
).href;

function token(name: string): string {
  const css = readFileSync(join(ROOT, "app", "globals.css"), "utf8");
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`--${name} not found in app/globals.css`);
  return match[1];
}

const C = {
  paper: token("paper"),
  surface: token("surface"),
  ink: token("ink"),
  ink2: token("ink-2"),
  ink3: token("ink-3"),
  hairline: token("hairline"),
  accent: token("accent"),
};

/** The streak grid from scripts/logo-export.ts: eighteen posted, today in plum. */
function mark(size: number, onInk = false): string {
  const pos = [40, 70, 100, 130, 160];
  const cells: string[] = [];
  let i = 0;
  for (const y of pos) {
    for (const x of pos) {
      const fill =
        i < 18 ? (onInk ? C.surface : C.ink) : i === 18 ? C.accent : onInk ? C.ink2 : C.hairline;
      cells.push(`<circle cx="${x}" cy="${y}" r="9" fill="${fill}"/>`);
      i += 1;
    }
  }
  const ground = onInk ? `<rect width="200" height="200" fill="${C.ink}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">${ground}${cells.join("")}</svg>`;
}

function page(width: number, height: number, body: string): string {
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Geist;src:url(${FONT}) format("woff2");font-weight:100 900}
html,body{margin:0;padding:0}
body{width:${width}px;height:${height}px;overflow:hidden;background:${C.paper};color:${C.ink};font-family:Geist,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.accent{color:${C.accent}}
</style>${body}`;
}

function shoot(html: string, width: number, height: number, out: string, waitMs = 0): void {
  const file = join(TMP, `${width}x${height}-${Math.random().toString(36).slice(2)}.html`);
  writeFileSync(file, html);
  const args = [
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${width},${height}`,
    `--screenshot=${out}`,
  ];
  if (waitMs) args.push(`--virtual-time-budget=${waitMs}`);
  execFileSync(CHROME, [...args, pathToFileURL(file).href], { stdio: "ignore" });
}

/** 1200x630. The same picture for Open Graph and for X. */
function share(): string {
  return page(
    1200,
    630,
    `<div style="height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
  ${mark(112)}
  <div style="margin-top:36px;font-size:68px;font-weight:600;line-height:1.02;letter-spacing:-0.045em;max-width:15ch">AI social media manager for your <span class="accent">LinkedIn.</span></div>
  <div style="margin-top:24px;font-size:28px;font-weight:450;line-height:1.35;color:${C.ink2};max-width:40ch">Writes the posts, you approve them on a board, it publishes 5 times a week.</div>
  <div style="margin-top:36px;display:flex;gap:14px;align-items:center;font-size:22px;font-weight:500">
    <span style="background:${C.accent};color:${C.surface};border-radius:999px;padding:10px 22px">From $100 a month</span>
    <span style="color:${C.ink2}">goodsocials.co</span>
  </div>
</div>`,
  );
}

/** Product Hunt asks for 240x240. The ink tile, square, since they round it. */
function thumbnail(): string {
  return page(240, 240, mark(240, true));
}

/**
 * `skip` is how far down from the anchor the window starts, in page pixels at
 * 1440 wide, so the slide shows the picture under a section head rather than
 * repeating the head under the caption.
 */
const GALLERY: { anchor: string; skip: number; caption: string; line: string }[] = [
  {
    anchor: "",
    skip: 625,
    caption: "AI social media manager for your LinkedIn.",
    line: "It writes, you approve on a board, it publishes 5 times a week.",
  },
  {
    anchor: "#writes",
    skip: 320,
    caption: "Three kinds of posts. Nothing else.",
    line: "Market research, deep dives and your own numbers, each with its source named.",
  },
  {
    anchor: "#how",
    skip: 275,
    caption: "Drag a card to Scheduled. That is the whole job.",
    line: "It publishes at 09:00 in your timezone, and a comment on one card teaches every card after it.",
  },
  {
    anchor: "#who",
    skip: 330,
    caption: "Built for the person whose name is on the profile.",
    line: "Founders, consultants and operators at $100. Agencies with up to 10 profiles at $1,000.",
  },
  {
    anchor: "#pricing",
    skip: 330,
    caption: "$100 a month per profile. $1,000 for up to 10.",
    line: "14 days free, cancel any time.",
  },
];

/** 1270x760: a caption band over the live section, framed like a window. */
function slide(base: string, s: (typeof GALLERY)[number]): string {
  return page(
    1270,
    760,
    `<div style="height:760px;display:flex;flex-direction:column;align-items:center;padding-top:52px;box-sizing:border-box">
  <div style="font-size:44px;font-weight:600;letter-spacing:-0.035em;line-height:1.08;text-align:center;max-width:24ch">${s.caption}</div>
  <div style="margin-top:12px;font-size:21px;color:${C.ink2};text-align:center;max-width:60ch">${s.line}</div>
  <div style="margin-top:36px;width:1130px;flex:1;border:1px solid ${C.hairline};border-bottom:0;border-radius:20px 20px 0 0;overflow:hidden;background:${C.surface};box-shadow:0 20px 60px rgba(0,0,0,0.08)">
    <iframe src="${base}/${s.anchor}" style="border:0;width:1440px;height:${1400 + s.skip}px;transform:scale(${1130 / 1440}) translateY(-${s.skip}px);transform-origin:0 0"></iframe>
  </div>
</div>`,
  );
}

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
const PH = join(ROOT, "public", "product-hunt");
mkdirSync(PH, { recursive: true });

shoot(share(), 1200, 630, join(ROOT, "app", "opengraph-image.png"));
shoot(share(), 1200, 630, join(ROOT, "app", "twitter-image.png"));
shoot(thumbnail(), 240, 240, join(PH, "thumbnail-240.png"));

const at = process.argv.indexOf("--gallery");
if (at !== -1) {
  const base = (process.argv[at + 1] ?? "http://localhost:3000").replace(/\/$/, "");
  GALLERY.forEach((s, i) => {
    shoot(slide(base, s), 1270, 760, join(PH, `gallery-${i + 1}.png`), 15000);
  });
}

rmSync(TMP, { recursive: true, force: true });
console.log("Wrote the share images" + (at !== -1 ? " and the Product Hunt gallery." : "."));
