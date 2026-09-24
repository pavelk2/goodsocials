import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * The short white line across the middle of a post's picture, drawn by us after
 * the generator has finished.
 *
 * Drawn rather than prompted, because the image prompt forbids text for a
 * reason that still holds: a generator misspells, and a misspelled headline on
 * a post under a real name is worse than none. Satori sets the words from a
 * font file, so what the model wrote is what the feed shows, letter for
 * letter, in the same face as the app.
 *
 * Plain element objects rather than JSX, so lib/ stays free of a React import.
 * Satori reads the objects; it never needed React to build them.
 */

/** 4:3, the frame the generator draws. The photo is set to cover it. */
const WIDTH = 1200;
const HEIGHT = 900;

/** Longer than this and it is a sentence, which belongs in the post. */
export const HEADLINE_MAX = 48;

// Read once per instance. Listed in outputFileTracingIncludes so the file
// reaches the serverless bundle.
let font: Promise<Buffer> | null = null;
function geistSemiBold(): Promise<Buffer> {
  font ??= readFile(join(process.cwd(), "assets/fonts/Geist-SemiBold.ttf"));
  return font;
}

type Node = { type: string; props: Record<string, unknown>; key: null };
function el(type: string, props: Record<string, unknown>): Node {
  return { type, props, key: null };
}

/**
 * The headline, cleaned to the house rules, or null when there is nothing fit
 * to draw. Null is a picture without a line, never an error.
 */
export function cleanHeadline(raw: string | null | undefined): string | null {
  const text = (raw ?? "")
    .replace(/[—–]/g, ",")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.,;:]+$/, "");
  if (!text || text.length > HEADLINE_MAX) return null;
  return text;
}

export async function drawHeadline(opts: {
  bytes: Buffer;
  contentType: string;
  headline: string;
}): Promise<{ bytes: Buffer; contentType: string }> {
  const src = `data:${opts.contentType};base64,${opts.bytes.toString("base64")}`;

  const tree = el("div", {
    style: { width: "100%", height: "100%", display: "flex", position: "relative" },
    children: [
      el("img", {
        src,
        width: WIDTH,
        height: HEIGHT,
        style: { position: "absolute", top: 0, left: 0, objectFit: "cover" },
      }),
      // A scrim under the words, so a white line stays readable over a white
      // sky. Darkest behind the line and gone by the edges, so the corners
      // keep the picture's own light.
      el("div", {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEIGHT,
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 50% 50%, rgba(0,0,0,0.5), rgba(0,0,0,0))",
        },
      }),
      el("div", {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 120px",
          textAlign: "center",
          textWrap: "balance",
          color: "white",
          fontFamily: "Geist",
          fontWeight: 600,
          fontSize: 72,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          textShadow: "0 2px 24px rgba(0,0,0,0.35)",
        },
        children: opts.headline,
      }),
    ],
  });

  const response = new ImageResponse(tree as unknown as ConstructorParameters<typeof ImageResponse>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: [{ name: "Geist", data: await geistSemiBold(), weight: 600, style: "normal" }],
  });
  const out = Buffer.from(await response.arrayBuffer());
  if (out.length === 0) throw new Error("The headline render returned no bytes.");
  return { bytes: out, contentType: "image/png" };
}
