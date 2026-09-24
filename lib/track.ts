import { cookies } from "next/headers";

/**
 * Funnel events, sent to PostHog from the server.
 *
 * Server side because the events that matter are the ones a request proves:
 * research finished, a sample was written, Stripe says the checkout completed.
 * An ad blocker cannot drop them, and there is no client library to add.
 *
 * One person is one id from the first page to the board. The id is a random
 * cookie set before sign in, so a visitor who reads the sign in page and never
 * connects is the first drop off in the same funnel as everybody who paid.
 * The member id rides along as a property once there is one.
 *
 * Every event is also one JSON log line, the same shape recordSpend writes, so
 * the funnel is readable in Vercel logs on a deployment with no PostHog key.
 */

export const ANON_COOKIE = "gs_aid";

/** Every event the funnel sends. A name not on this list is refused. */
export const FUNNEL_EVENTS = [
  "signin_viewed",
  "signin_started",
  "onboarding_step_viewed",
  "onboarding_step_completed",
  "research_finished",
  "research_failed",
  "sample_ready",
  "sample_failed",
  "checkout_started",
  "checkout_completed",
  "checkout_cancelled",
  "offer_skipped",
  "onboarding_finished",
] as const;

export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];

export function isFunnelEvent(value: string): value is FunnelEvent {
  return (FUNNEL_EVENTS as readonly string[]).includes(value);
}

type Props = Record<string, string | number | boolean | null | undefined>;

/**
 * The id this browser is tracked under. Created on first use. Only callable
 * where cookies can be written: a route handler or a server action.
 */
export async function anonId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(ANON_COOKIE)?.value;
  if (existing) return existing;
  const id = crypto.randomUUID();
  store.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

/** Reads the id without creating one, for server components that cannot set cookies. */
export async function readAnonId(): Promise<string | null> {
  return (await cookies()).get(ANON_COOKIE)?.value ?? null;
}

export async function track(
  event: FunnelEvent,
  props: Props & { distinctId: string; memberId?: string | null },
): Promise<void> {
  const { distinctId, memberId, ...rest } = props;
  const properties = { ...rest, member_id: memberId ?? undefined };

  console.log(JSON.stringify({ event, distinct_id: distinctId, ...properties }));

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  const host = (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com").replace(
    /\/$/,
    "",
  );

  // Never allowed to break the step it is measuring. A lost event is a gap in
  // a chart; a thrown one is a member stuck on a screen.
  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event,
        distinct_id: distinctId,
        properties: { ...properties, $process_person_profile: Boolean(memberId) },
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3_000),
    });
  } catch (cause) {
    console.error("[track] PostHog capture failed:", cause);
  }
}
