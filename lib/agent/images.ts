import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import Replicate from "replicate";
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
 * is not negotiable: claim the quota, then call Replicate. A claim that is
 * refused never reaches the model. A generation that fails after the claim
 * gives the image back, because a customer should not lose one of their 200 to
 * our outage.
 *
 * Replicate's output URLs expire in about an hour and LinkedIn needs the bytes
 * at publish time, which can be days later, so the image is copied to Vercel
 * Blob before the card is told about it.
 */

const REPLICATE_MODEL = "black-forest-labs/flux-1.1-pro";

/** USD per image for REPLICATE_MODEL. Update together with the model. */
const USD_PER_IMAGE = 0.04;

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

export type ImageResult =
  | { ok: true; url: string; prompt: string; quota: QuotaState }
  | { ok: false; error: string; quota: QuotaState };

function replicate(): Replicate {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("Missing environment variable: REPLICATE_API_TOKEN");
  }
  return new Replicate();
}

/** The SDK returns a FileOutput, an array of them, or a bare URL by version. */
async function firstUrl(output: unknown): Promise<string | null> {
  const candidate = Array.isArray(output) ? output[0] : output;
  if (typeof candidate === "string") return candidate;
  if (candidate && typeof (candidate as { url?: unknown }).url === "function") {
    return String(await (candidate as { url: () => unknown }).url());
  }
  return null;
}

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
      quota: claim.state,
      error: `You have used all ${claim.state.cap} images this month. The count resets on ${claim.state.resetsOn}.`,
    };
  }

  try {
    const prompt = await writePrompt(opts);
    const output = await replicate().run(REPLICATE_MODEL, {
      input: {
        prompt,
        aspect_ratio: "4:3",
        output_format: "jpg",
        safety_tolerance: 2,
      },
    });

    const sourceUrl = await firstUrl(output);
    if (!sourceUrl) throw new Error("Replicate returned no image URL.");

    const response = await fetch(sourceUrl);
    if (!response.ok) {
      throw new Error(`Fetching the generated image returned ${response.status}.`);
    }

    // Randomised suffix on, so a regeneration cannot be served from a cache
    // holding the picture the user just rejected.
    const blob = await put(
      `cards/${opts.cardId}.jpg`,
      await response.arrayBuffer(),
      { access: "public", contentType: "image/jpeg", addRandomSuffix: true },
    );

    recordImageSpend(opts.profileId);
    return { ok: true, url: blob.url, prompt, quota: claim.state };
  } catch (cause) {
    await releaseImage(opts.profileId);
    console.error("[images] generation failed:", cause);
    return {
      ok: false,
      quota: await readQuota(opts.profileId),
      error: "The image did not generate. Try again, and it will not count against your cap.",
    };
  }
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

/** Same shape as recordSpend in client.ts, for the same PostHog query. */
function recordImageSpend(profileId: string): void {
  console.log(
    JSON.stringify({
      event: "image_spend",
      profile_id: profileId,
      operation: "image",
      usd: USD_PER_IMAGE,
      model: REPLICATE_MODEL,
    }),
  );
}
