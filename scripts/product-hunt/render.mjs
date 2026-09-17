/**
 * Renders the Product Hunt launch assets from frames.html.
 *
 * One-off operator script. Not imported by app/, not part of the build.
 *   node scripts/product-hunt/render.mjs
 *
 * Output lands in scripts/product-hunt/out/ at 2x, which is what Product Hunt
 * wants for a gallery image (1270x760) and for the thumbnail (240x240).
 *
 * Chromium comes from the Playwright cache that is already on the machine, so
 * there is no npm dependency to add. Fonts are fetched once into fonts/ and
 * cached there, because the frames must not fall back to a system grotesque.
 */
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const build = path.join(here, "build");
const out = path.join(here, "out");
const fontsDir = path.join(here, "fonts");

/* headless_shell, not chrome: the full browser reserves window chrome, so a
   1270x760 window renders a 1270x673 viewport and every frame loses 87px off
   the bottom. The shell gives the viewport the size that was asked for. */
const CHROME = [
  process.env.CHROME_PATH,
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell",
  "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
].find((p) => p && existsSync(p));
if (!CHROME) throw new Error("No Chromium found. Set CHROME_PATH.");

const FONTS = [
  "Inter+Tight:wght@400;500;600;700",
  "Instrument+Serif:ital@0;1",
];

const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/** Google's CSS points at gstatic. Pull both down once and rewrite the urls. */
async function cacheFonts() {
  await mkdir(fontsDir, { recursive: true });
  if (existsSync(path.join(fontsDir, "fonts.css"))) return;
  let css = "";
  for (const family of FONTS) {
    const res = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&display=block`,
      { headers: { "User-Agent": UA } },
    );
    css += await res.text();
  }
  const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g))];
  for (const url of urls) {
    const name = url.split("/").pop();
    const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
    await writeFile(path.join(fontsDir, name), bin);
    css = css.split(url).join(name);
  }
  await writeFile(path.join(fontsDir, "fonts.css"), css);
}

/** The LinkedIn glyph, same path the board preview component draws. */
const LI_SVG = `<svg viewBox="0 0 448 512" fill="currentColor"><path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"/></svg>`;

/**
 * The example board. Same cards as components/board/board-preview.tsx, so the
 * launch image and the landing page cannot tell different stories.
 */
const COLUMNS = [
  {
    name: "Idea",
    count: 4,
    cards: [
      { text: "We cut one line from our job ad. The line asked for ten years of experience." },
      { text: "Our cheapest new customers came from answering support tickets in public." },
    ],
  },
  {
    name: "Draft",
    count: 2,
    cards: [
      {
        text: "Ever wondered why hiring is slow? Let&rsquo;s dive into the key factors that make all the difference.",
        comment: "Stop opening posts with a question. Lead with the number.",
      },
    ],
  },
  {
    name: "Scheduled",
    count: 6,
    cards: [
      { text: "Three years of invoices in one spreadsheet. Our pricing was wrong for one customer size.", meta: "15 Sep, 08:30" },
      { text: "The support ticket that changed our roadmap was eleven words long.", meta: "16 Sep, 08:30" },
    ],
  },
  {
    name: "Posted",
    count: 31,
    cards: [
      { text: "We stopped our weekly all-hands. Nobody has asked for it back.", meta: "12 Sep, 08:30" },
    ],
  },
];

const columnsHtml = (cols) => cols.map(
  (col) => `<section class="col">
            <div class="col-head"><h3>${col.name}</h3><span class="num">${col.count}</span></div>
            <div class="col-cards">${col.cards
              .map(
                (card) => `<article class="card">
                <p class="text">${card.text}</p>
                ${card.meta ? `<p class="meta num">${card.meta}</p>` : ""}
                ${
                  card.comment
                    ? `<div class="comment"><p class="label">Revise</p><p class="said">${card.comment}</p></div>`
                    : ""
                }
              </article>`,
              )
              .join("")}</div>
          </section>`,
).join("");

/**
 * The publishing frame shows the two columns the cron touches. Times are
 * 09:00 UTC because that is what lib/schedule.ts writes, and they are set in
 * tabular numerals because they align in a column.
 */
const SCHEDULE = [
  {
    name: "Scheduled",
    count: 6,
    cards: [
      { text: "Three years of invoices in one spreadsheet. Our pricing was wrong for one customer size.", meta: "18 Sep, 09:00" },
      { text: "The support ticket that changed our roadmap was eleven words long.", meta: "19 Sep, 09:00" },
      { text: "We cut one line from our job ad. The line asked for ten years of experience.", meta: "20 Sep, 09:00" },
      { text: "Our pricing page had eleven lines of feature comparison. Now it has three.", meta: "21 Sep, 09:00" },
    ],
  },
  {
    name: "Posted",
    count: 31,
    cards: [
      { text: "We stopped our weekly all-hands. Nobody has asked for it back.", meta: "17 Sep, 09:00" },
      { text: "Our cheapest new customers came from answering support tickets in public.", meta: "16 Sep, 09:00" },
      { text: "The first thing we built was the thing nobody uses. Here is what we kept.", meta: "15 Sep, 09:00" },
    ],
  },
];


const boardColumns = columnsHtml(COLUMNS);
const scheduleColumns = columnsHtml(SCHEDULE);

/** The three plans, from lib/legal.ts and app/page.tsx. */
const PLANS = [
  { name: "Pro", price: "100 USD", line: "One LinkedIn profile." },
  { name: "Agency", price: "1000 USD", line: "Up to 10 profiles, one board per client." },
  { name: "Consultancy", price: "2000 USD", line: "Up to 10 profiles, and a call with the founder every week." },
];

const priceCards = PLANS.map(
  (plan) => `<div style="background: var(--surface); border: 1px solid var(--hairline); border-radius: var(--r-lg); padding: 26px">
          <p style="font-size: 16px; font-weight: 600; letter-spacing: -0.01em">${plan.name}</p>
          <p class="num" style="margin-top: 28px; font-size: 44px; font-weight: 600; line-height: 1; letter-spacing: -0.03em">${plan.price}</p>
          <p style="margin-top: 8px; font-size: 16px; color: var(--ink-3)">a month</p>
          <p style="margin-top: 26px; border-top: 1px solid var(--hairline); padding-top: 22px; font-size: 16px; line-height: 1.4; color: var(--ink-2)">${plan.line}</p>
        </div>`,
).join("");

/** id, output name, and the size Product Hunt asks for. */
const FRAMES = [
  ["offer", "01-offer", 1270, 760],
  ["revision", "02-tell-it-once", 1270, 760],
  ["publish", "03-publishes-without-you", 1270, 760],
  ["actions", "04-three-actions", 1270, 760],
  ["pricing", "05-pricing", 1270, 760],
  ["permissions", "06-linkedin-permissions", 1270, 760],
  ["closer", "07-start", 1270, 760],
  ["thumb", "thumbnail", 240, 240],
];

await cacheFonts();
await mkdir(build, { recursive: true });
await mkdir(out, { recursive: true });

const html = (await readFile(path.join(here, "frames.html"), "utf8"))
  .split("BOARD_COLUMNS").join(boardColumns)
  .split("SCHEDULE_COLUMNS").join(scheduleColumns)
  .split("PRICE_CARDS").join(priceCards)
  .split("LI_SVG").join(LI_SVG);
await writeFile(path.join(build, "frames.html"), html);
await writeFile(
  path.join(build, "frames.css"),
  await readFile(path.join(here, "frames.css"), "utf8"),
);
await mkdir(path.join(build, "fonts"), { recursive: true });
for (const name of await readdir(fontsDir)) {
  await writeFile(
    path.join(build, "fonts", name),
    await readFile(path.join(fontsDir, name)),
  );
}

for (const [id, name, w, h] of FRAMES) {
  const file = path.join(out, `${name}.png`);
  await run(CHROME, [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-device-scale-factor=2",
    "--font-render-hinting=none",
    `--window-size=${w},${h}`,
    `--screenshot=${file}`,
    `file://${path.join(build, "frames.html")}#${id}`,
  ]);
  console.log(`${name}.png  ${w * 2}x${h * 2}`);
}
