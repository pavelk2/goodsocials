/**
 * Draws the three pictures on the onboarding question "What visual content
 * do you like?", one per option, into public/onboarding/.
 *
 *   OPENROUTER_API_KEY=... npx tsx scripts/onboarding-styles.ts
 *
 * Same model and tier the product uses, so the pictures are an honest preview
 * of what a post gets and not a better-looking promise. Run once, commit the
 * three files, run again only if a recipe in lib/agent/image-styles.ts
 * changes. About 0.09
 * USD a run.
 *
 * Until it has been run the question still works: each tile shows its label.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { IMAGE_QUESTION } from "../lib/funnel-steps";
import { imageStyleFor } from "../lib/agent/image-styles";

async function draw(prompt: string): Promise<Buffer> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Set OPENROUTER_API_KEY.");
  const response = await fetch("https://openrouter.ai/api/v1/images", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "black-forest-labs/flux.2-pro",
      prompt,
      n: 1,
      aspect_ratio: "4:3",
      resolution: "1K",
      output_format: "jpeg",
    }),
  });
  const body = (await response.json()) as { data?: { b64_json?: string }[]; error?: { message?: string } };
  const data = body.data?.[0]?.b64_json;
  if (!response.ok || !data) throw new Error(body.error?.message ?? `OpenRouter returned ${response.status}`);
  return Buffer.from(data, "base64");
}

async function main() {
  await mkdir("public/onboarding", { recursive: true });
  for (const option of IMAGE_QUESTION.options) {
    const style = imageStyleFor(option.id);
    if (!option.preview || !style) continue;
    const prompt = `${style.example} ${style.recipe}`;
    const bytes = await draw(prompt);
    await writeFile(`public${option.preview}`, bytes);
    console.log(`wrote public${option.preview}`);
  }
}

main().catch((cause) => {
  console.error(cause);
  process.exit(1);
});
