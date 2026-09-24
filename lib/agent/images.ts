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
import { readFunnel } from "@/lib/funnel";
import { imageStyleFor, type ImageStyle } from "./image-styles";
import { cleanHeadline, drawHeadline, HEADLINE_MAX } from "./headline";

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
      "The image prompt. Concrete nouns, stated as a scene rather than as a brief. Names the subject, the lighting, the framing and the treatment.",
    ),
  headline: z
    .string()
    .describe(
      `The line we set in white across the top of the picture. Two to six words, at most ${HEADLINE_MAX} characters, sentence case, no full stop.`,
    ),
});

const PROMPT_SYSTEM = `You write one image prompt for the picture that will sit beside a LinkedIn post.

You are given the post and the author's visual principle, and sometimes a house style the author picked.

With a house style: carry its treatment into your prompt close to word for word, because the style is what makes a year of posts look like one feed. Its subject rule says what the post may decide inside the style. The visual principle holds the author's corrections, so where it disagrees with the style, the principle wins.

Without a house style: the visual principle wins on treatment, palette, and subject matter, and the post decides what the picture is of. The picture illustrates the specific thing the post is about. A post about a pricing decision gets a picture of the thing being priced, not a stock metaphor for decisions.

Never ask for text, words, letters, numbers, logos, charts with labels, or UI with readable copy in the image. Generators render text badly and a misspelled word on a post under a real name is worse than no picture.

Never ask for a clear, frontal, fully lit face. A recognisable invented face published under a real person's byline reads as a stock photo at best and a deepfake at worst. Where a person belongs in the picture, they are turned away, in profile, or mostly in shadow.

Banned because they are the visual equivalent of the words we ban: glowing blue neural networks, robot hands touching human hands, floating holograms, rocket ships, light bulbs as ideas, chess pieces, people in suits shaking hands, arrows going up and to the right.

Separately from the prompt, write the headline we set across the top of the picture ourselves, in our own font. It names what the post is about the way a magazine names a feature: "Scheduling tools in 2026", "Why booking pages lose people", "What we charge for SMS". Two to six words, sentence case, no full stop, no question to the reader, no em dash, no buzzwords. A year or a number only when the post states it. It labels the post; it does not summarise the argument or tease it. Because the line sits over the top of the frame, the prompt keeps the top third quiet: sky, haze, dark space or a soft background, never the subject's detail.

Write the prompt as a description of a photograph or a made object, not as instructions to an artist. No lists, no negative prompt section. The picture is a 4:3 landscape frame, so never ask for a vertical composition.`;

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
    // The style lives on the funnel answer rather than in the principle, so a
    // revise comment that rewrites the principle cannot delete the recipe.
    const funnel = await readFunnel(opts.profileId);
    const style = imageStyleFor(funnel?.answers.image?.choice);
    const { prompt, headline } = await writePrompt({ ...opts, style });
    const drawn = await draw(prompt);
    const { bytes, contentType } = await withHeadline(drawn, headline);

    // Randomised suffix on, so a regeneration cannot be served from a cache
    // holding the picture the user just rejected.
    const extension = contentType === "image/png" ? "png" : "jpg";
    const blob = await put(`cards/${opts.cardId}.${extension}`, bytes, {
      access: "public",
      contentType,
      addRandomSuffix: true,
    });

    recordImageSpend(opts.profileId, drawn.cost);
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

/**
 * The generation is paid for by the time this runs, so a headline that fails
 * to render costs the line and not the picture: the card keeps the image the
 * member was charged a quota slot for.
 */
async function withHeadline(
  drawn: { bytes: Buffer; contentType: string },
  raw: string,
): Promise<{ bytes: Buffer; contentType: string }> {
  const headline = cleanHeadline(raw);
  if (!headline) return drawn;
  try {
    return await drawHeadline({ ...drawn, headline });
  } catch (cause) {
    console.error("[images] headline render failed, keeping the plain image:", cause);
    return drawn;
  }
}

async function writePrompt(opts: {
  profileId: string;
  postText: string;
  visualPrinciple: string;
  style: ImageStyle | null;
}): Promise<{ prompt: string; headline: string }> {
  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 2000,
    system: PROMPT_SYSTEM,
    output_config: { format: zodOutputFormat(PromptSchema) },
    messages: [
      {
        role: "user",
        content: [
          ...(opts.style
            ? [
                "House style:",
                opts.style.recipe,
                "",
                "What the post decides inside the style:",
                opts.style.subject,
                "",
              ]
            : []),
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
  return response.parsed_output;
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
