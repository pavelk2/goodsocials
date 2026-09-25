"use server";

import { signOut } from "@/auth";
import { anonId, track } from "@/lib/track";
import { isSignedIn } from "@/lib/viewer";

/**
 * Ending the session, from the one control in the app that offers it.
 *
 * Lands on the landing page rather than /signin. A member who just signed out
 * and is dropped on a LinkedIn button is one click from being signed back in,
 * which reads as a sign out that did not take.
 */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/**
 * A stranger opened the landing page. The top of the admin pipeline, and the
 * first moment the gs_aid cookie can be set, so the same id follows them to
 * sign in. Signed in readers are left out: they are not arriving.
 */
export async function trackLanding(referrer: string, search: string): Promise<void> {
  if (await isSignedIn()) return;
  const params = new URLSearchParams(search.slice(0, 500));
  let from: string | null = null;
  try {
    from = referrer ? new URL(referrer).host.slice(0, 120) : null;
  } catch {
    from = null;
  }
  await track("landing_viewed", {
    distinctId: await anonId(),
    referrer: from,
    utm_source: params.get("utm_source")?.slice(0, 80) ?? null,
    utm_campaign: params.get("utm_campaign")?.slice(0, 80) ?? null,
  });
}
