import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { put } from "@vercel/blob";
import { anthropic, MODEL, recordSpend } from "./client";
import {
  claimImage,
  readQuota,
  releaseImage,
  type QuotaState,
} from "@/lib/quota";

/**
 * Every generated image costs money on a fixed subscription, so the order here
 * is not negotiable: claim the quota, then call the provider. A claim that is
 * refused never reaches the model. A generation that fails after the claim
 * gives the image back, because a customer should not lose one of their 200 to
 * our outage.
 *
 * OpenRouter rather than a direct provider, for one reason that matters and one
 * that is convenient. The one that matters: the response reports what the call
 * actually cost, so cost per customer comes from the provider instead of from a
 * constant in this file that goes stale the first time anyone reprices.
 * The convenient one: the model is a string, so trying a different one is a
 * deploy rather than an integration.
 *
 * Text generation does not go through here. It calls Anthropic directly,
 * because the structured output and adaptive thinking we rely on are first
 * party features and an OpenAI-compatible gateway does not carry them.
 */

const ENDPOINT = "https://openrouter.ai/api/v1/images";

/**
 * FLUX.2 Pro charges 0.03 USD for the first megapixel and 0.015 for each one
 * after it. A 4:3 image at the 1K tier is 0.79 MP, so it stays in the first
 * bucket and the 200 cap costs at most 6 USD a month against a 100 USD
 * subscription. Raising the resolution tier changes that arithmetic.
 */
const IMAGE_MODEL = "black-forest-labs/flux.2-pro";
const RESOLUTION = "1K";
const ASPECT_RATIO = "4:3";

const PromptSchema = z.object({
  prompt: z
    .string()
    .describe(
      "The image prompt. One paragraph, concrete nouns, stated as a scene rather than as a brief. Names the subject, the lighting, the framing and the treatment.",
    ),
});

const PROMPT_SYSTEM = `You write one image prompt for the picture that will sit beside a LinkedIn post.

You are given the post and the author's visual principle. The visual principle wins on treatment, palette, and subject matter. The post decides what the picture is of.

The picture illustrates the specific thing the post is about. A post about a pricing decision gets a picture of the thing being priced, not a stock metaphor for decisions.

Never ask for text, words, letters, numbers, logos, charts with labels, or UI with readable copy in the image. Generators render text badly and a misspelled word on a post under a real name is worse than no picture.

Never ask for people's faces. A recognisable invented face published under a real person's byline reads as a stock photo at best and a deepfake at worst.

Banned because they are the visual equivalent of the words we ban: glowing blue neural networks, robot hands touching human hands, floating holograms, rocket ships, light bulbs as ideas, chess pieces, people in suits shaking hands, arrows going up and to the right.

Write the prompt as a description of a photograph or a made object, not as instructions to an artist. One paragraph, no lists, no negative prompt section.`;

/**
 * The two failures are not the same failure and the board must not treat them
 * alike. `cap` is the product working: the customer has spent their 200 and the
 * card carries on without a picture. `failed` is us broken, and a broken
 * provider that silently schedules a post without an image looks to the user
 * like the agent decided it did not want one.
 */
export type ImageResult =
  | { ok: true; url: string; prompt: string; quota: QuotaState }
  | { ok: false; reason: "cap" | "failed"; error: string; quota: QuotaState };

type ImageResponse = {
  data?: { b64_json?: string; media_type?: string }[];
  usage?: { cost?: number };
  error?: { message?: string };
};

export async function generateImage(opts: {
  profileId: string;
  cardId: string;
  postText: string;
  visualPrinciple: string;
}): Promise<ImageResult> {
  const claim = await claimImage(opts.profileId);
  if (!claim.ok) {
    return {
      ok: false,
      reason: "cap",
      quota: claim.state,
      error: `You have used all ${claim.state.cap} images this month. The count resets on ${claim.state.resetsOn}.`,
    };
  }

  try {
    const prompt = await writePrompt(opts);
    const { bytes, contentType, cost } = await draw(prompt);

    // Randomised suffix on, so a regeneration cannot be served from a cache
    // holding the picture the user just rejected.
    const blob = await put(`cards/${opts.cardId}.jpg`, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });

    recordImageSpend(opts.profileId, cost);
    return { ok: true, url: blob.url, prompt, quota: claim.state };
  } catch (cause) {
    await releaseImage(opts.profileId);
    console.error("[images] generation failed:", cause);
    return {
      ok: false,
      reason: "failed",
      quota: await readQuota(opts.profileId),
      error:
        "The image did not generate, so this card stayed in Draft. It did not count against your cap.",
    };
  }
}

async function draw(prompt: string): Promise<{
  bytes: Buffer;
  contentType: string;
  cost: number | null;
}> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("Missing environment variable: OPENROUTER_API_KEY");
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      // Attribution, so the spend is identifiable in their dashboard.
      "HTTP-Referer": "https://goodsocials.co",
      "X-Title": "GoodSocials",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      prompt,
      n: 1,
      aspect_ratio: ASPECT_RATIO,
      resolution: RESOLUTION,
      output_format: "jpeg",
    }),
    // A generation takes tens of seconds. Left unbounded it would sit on a
    // serverless function until the platform kills it with no error of ours.
    signal: AbortSignal.timeout(120_000),
  });

  const raw = await response.text();
  let parsed: ImageResponse;
  try {
    parsed = JSON.parse(raw) as ImageResponse;
  } catch {
    throw new Error(`Image provider returned ${response.status}: ${raw.slice(0, 300)}`);
  }

  if (!response.ok) {
    throw new Error(
      `Image provider returned ${response.status}: ${parsed.error?.message ?? raw.slice(0, 300)}`,
    );
  }

  const image = parsed.data?.[0];
  if (!image?.b64_json) throw new Error("Image provider returned no image data.");

  return {
    bytes: Buffer.from(image.b64_json, "base64"),
    contentType: image.media_type ?? "image/jpeg",
    cost: typeof parsed.usage?.cost === "number" ? parsed.usage.cost : null,
  };
}

async function writePrompt(opts: {
  profileId: string;
  postText: string;
  visualPrinciple: string;
}): Promise<string> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 2000,
    system: PROMPT_SYSTEM,
    output_config: { format: zodOutputFormat(PromptSchema) },
    messages: [
      {
        role: "user",
        content: [
          "Visual principle:",
          opts.visualPrinciple,
          "",
          "The post:",
          opts.postText,
        ].join("\n"),
      },
    ],
  });

  recordSpend({
    profileId: opts.profileId,
    operation: "image_prompt",
    usage: response.usage,
  });

  if (!response.parsed_output) {
    throw new Error("The model did not return an image prompt.");
  }
  return response.parsed_output.prompt;
}

/**
 * Same shape as recordSpend in client.ts, for the same PostHog query. The cost
 * is what the provider charged rather than what we assumed it would charge, so
 * there is no constant here to go stale.
 */
function recordImageSpend(profileId: string, cost: number | null): void {
  console.log(
    JSON.stringify({
      event: "image_spend",
      profile_id: profileId,
      operation: "image",
      usd: cost,
      model: IMAGE_MODEL,
    }),
  );
}
