import Anthropic from "@anthropic-ai/sdk";

/**
 * Every call to Claude goes through here, for the same reason every LinkedIn
 * call goes through lib/linkedin/client.ts: one place that knows the model, one
 * place that counts what it costs.
 */

export const MODEL = "claude-opus-5";

/** USD per million tokens for MODEL. Update together with MODEL. */
const INPUT_PER_MTOK = 5;
const OUTPUT_PER_MTOK = 25;

export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing environment variable: ANTHROPIC_API_KEY");
  }
  return new Anthropic();
}

type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

export function usdFor(usage: Usage): number {
  const cachedIn = usage.cache_read_input_tokens ?? 0;
  const writtenIn = usage.cache_creation_input_tokens ?? 0;
  const input =
    usage.input_tokens + writtenIn * 1.25 + cachedIn * 0.1;
  return (
    (input / 1_000_000) * INPUT_PER_MTOK +
    (usage.output_tokens / 1_000_000) * OUTPUT_PER_MTOK
  );
}

/**
 * CLAUDE.md wants cost per customer visible in PostHog from launch day.
 * PostHog is wired on Day 4. Until then this is one structured line per call,
 * which Vercel keeps and which becomes the PostHog payload unchanged.
 */
export function recordSpend(opts: {
  profileId: string;
  operation: string;
  usage: Usage;
}): void {
  console.log(
    JSON.stringify({
      event: "llm_spend",
      profile_id: opts.profileId,
      operation: opts.operation,
      input_tokens: opts.usage.input_tokens,
      output_tokens: opts.usage.output_tokens,
      cached_input_tokens: opts.usage.cache_read_input_tokens ?? 0,
      usd: Number(usdFor(opts.usage).toFixed(5)),
      model: MODEL,
    }),
  );
}
