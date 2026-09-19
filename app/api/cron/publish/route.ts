import { runPublishQueue } from "@/lib/publish";

/**
 * The publish loop. LinkedIn has no scheduling endpoint, so this is what makes
 * a scheduled post a published one.
 *
 * Every 15 minutes rather than once at 09:00, because a daily cron that fails
 * loses the day. Slots are on the hour, so the run at :00 takes them and the
 * three after it are the retry. A run with nothing due is one query.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** A post with an image is four calls. Twenty-five of them need the room. */
export const maxDuration = 300;

export async function GET(request: Request) {
  const denied = authorize(request);
  if (denied) return Response.json({ error: denied }, { status: 401 });

  try {
    const run = await runPublishQueue();
    return Response.json(run);
  } catch (cause) {
    // A throw here is the cron dying silently, which is the failure mode the
    // whole product is built around. Say it in the response and in the log.
    const message = cause instanceof Error ? cause.message : String(cause);
    console.error("[cron/publish] run failed:", cause);
    return Response.json({ error: message }, { status: 500 });
  }
}

/**
 * Vercel sends CRON_SECRET as a bearer token. The debug key is the hand path,
 * for checking the queue from a browser without waiting for the quarter hour,
 * and it is a separate secret so the cron's own never appears in a URL or a
 * browser history.
 */
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
