"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { openPortal, startCheckout } from "@/lib/billing";
import { loadAccess } from "@/lib/profiles";
import { planFromSlug, type PlanSlug } from "@/lib/plans";

/**
 * The two buttons that move money: start a plan, or open the portal where
 * changing plan, updating the card and cancelling all live.
 *
 * There is no billing form in this repo and there will not be one. Stripe
 * hosts both pages, which means no card ever reaches our servers and the
 * upgrade, downgrade and cancel flows are ones we do not have to get right.
 *
 * Both actions end in a redirect, and both put the reason on the settings
 * screen when they cannot. A button that silently does nothing is the one
 * outcome worse than a failed checkout.
 */

/** Bound to a plan at the call site: `startPlanCheckout.bind(null, "pro")`. */
export async function startPlanCheckout(slug: PlanSlug): Promise<void> {
  const account = await signedInAccount();
  if (!account) redirect("/signin");

  const result = await startCheckout({
    account,
    plan: planFromSlug(slug).slug,
    origin: await origin(),
  });

  if (!result.ok) redirect(failed(result.error));
  redirect(result.value);
}

/**
 * The portal, or the pricing page for somebody who has never checked out.
 * Both are the right answer to "change my plan", and which one it is depends
 * on a column rather than on which screen the button was pressed from.
 */
export async function manageBilling(): Promise<void> {
  const account = await signedInAccount();
  if (!account) redirect("/signin");
  if (!account.stripeCustomerId) redirect("/#pricing");

  const result = await openPortal({ account, origin: await origin() });
  if (!result.ok) redirect(failed(result.error));
  redirect(result.value);
}

async function signedInAccount() {
  const session = await auth();
  if (!session?.memberId) return null;
  const access = await loadAccess(session.memberId);
  return access?.account ?? null;
}

/**
 * This deployment's own origin, so a preview checks out against itself and
 * comes back to itself. No host is written down anywhere in this repo.
 */
async function origin(): Promise<string> {
  const head = await headers();
  const host = head.get("x-forwarded-host") ?? head.get("host");
  if (host) {
    return `${head.get("x-forwarded-proto") ?? "https"}://${host}`;
  }
  return process.env.AUTH_URL ?? "https://goodsocials.co";
}

/** The sentence travels back on the URL, because it is one of ours. */
function failed(error: string): string {
  return `/settings?billing=error&why=${encodeURIComponent(error.slice(0, 200))}`;
}
