import { syncDue } from "@/lib/integrations/sync";

/**
 * Reads every connected source that has not been read in 20 hours.
 *
 * Once a day at 04:00 UTC, which is early enough that the numbers are today's
 * by the time anybody approves a card and late enough that a Stripe day has
 * closed. None of these APIs charge us, so the ceiling is wall clock rather
 * than money, and the run is bounded on both ends: stalest sources first, four
 * at a time, and it stops claiming new ones before the function's 300 seconds
 * run out. `skipped` in the response is how many were due and not reached,
 * which is the number that says this cron has outgrown one run a day.
 *
 * A refused source is not a failed run. It writes its own `last_error` and goes
 * on showing the reading it had, the way a paused scheduled_post keeps its
 * attempt count, and the response says which ones.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = authorize(request);
  if (denied) return Response.json({ error: denied }, { status: 401 });

  try {
    const { reports, skipped } = await syncDue();
    return Response.json({
      read: reports.filter((r) => r.ok).length,
      refused: reports.filter((r) => !r.ok).length,
      skipped,
      facts: reports.reduce((sum, r) => sum + r.facts, 0),
      sources: reports,
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error("[cron/sync-sources] run failed:", cause);
    return Response.json({ error: message }, { status: 500 });
  }
}

/** The same two doors as the publish cron: Vercel's bearer, or the debug key. */
function authorize(request: Request): string | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return "CRON_SECRET is not set on this deployment.";

  const header = request.headers.get("authorization");
  if (header === `Bearer ${cronSecret}`) return null;

  const debugSecret = process.env.LINKEDIN_DEBUG_SECRET;
  const key = new URL(request.url).searchParams.get("k");
  if (debugSecret && key === debugSecret) return null;

  return "Wrong or missing key.";
}
