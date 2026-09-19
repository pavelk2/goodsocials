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

/**
 * USD per web search, billed on top of the tokens the results cost to read.
 * Only lib/agent/research.ts makes any, and it caps them per post.
 */
const SEARCH_USD = 0.01;

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
  /**
   * Web searches this call made. Billed per search on top of tokens, so a
   * research pass costs more than its token count says and the number has to
   * be in the line or the cost per customer is wrong.
   */
  searches?: number;
}): void {
  const searches = opts.searches ?? 0;
  console.log(
    JSON.stringify({
      event: "llm_spend",
      profile_id: opts.profileId,
      operation: opts.operation,
      input_tokens: opts.usage.input_tokens,
      output_tokens: opts.usage.output_tokens,
      cached_input_tokens: opts.usage.cache_read_input_tokens ?? 0,
      searches,
      usd: Number(
        (usdFor(opts.usage) + searches * SEARCH_USD).toFixed(5),
      ),
      model: MODEL,
    }),
  );
}
