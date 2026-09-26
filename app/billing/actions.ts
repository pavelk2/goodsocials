"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { canManageBilling, offeredPlan, openPortal, startCheckout } from "@/lib/billing";
import { funnelActor } from "@/lib/funnel-context";
import { loadAccess } from "@/lib/profiles";
import { PLAN_COOKIE, planFromSlug, type PlanSlug } from "@/lib/plans";
import { track } from "@/lib/track";

/**
 * The buttons that move money: start a plan, open the portal where changing
 * plan, updating the card and cancelling all live, or open it straight on the
 * switch or cancel page for the plan card that was pressed.
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
 * The board banner's button, for a member who passed on the offer or whose
 * plan ended. Same checkout as the offer, back to the board either way, and
 * the same checkout_started event so the pipeline counts the click.
 */
export async function startBoardCheckout(): Promise<void> {
  const actor = await funnelActor();
  if (!actor) redirect("/signin");

  const plan = offeredPlan((await cookies()).get(PLAN_COOKIE)?.value, actor.account);
  const result = await startCheckout({
    account: actor.account,
    plan: plan.slug,
    origin: await origin(),
    returnTo: { success: "/board?billing=started", cancel: "/board" },
  });

  await track("checkout_started", {
    distinctId: actor.distinctId,
    memberId: actor.memberId,
    plan: plan.slug,
    ok: result.ok,
    from: "board",
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
  // Nothing to manage means nothing to open. The prices are the right answer
  // for somebody who never subscribed and for somebody who cancelled.
  if (!canManageBilling(account)) redirect("/#pricing");

  const result = await openPortal({ account, origin: await origin() });
  if (!result.ok) redirect(failed(result.error));
  redirect(result.value);
}

/**
 * A plan card's button for somebody already paying: the confirm page for that
 * plan, with Stripe's proration on it. Upgrades apply now and downgrades at
 * the end of the period, which is the portal configuration's rule, not ours.
 *
 * A plan set to end has to be renewed before it can change, so that reader
 * lands on the portal's home screen, where the renew button is.
 */
export async function switchPlan(slug: PlanSlug): Promise<void> {
  const account = await signedInAccount();
  if (!account) redirect("/signin");
  if (!canManageBilling(account)) redirect(`/signin?plan=${slug}`);

  const result = await openPortal({
    account,
    origin: await origin(),
    flow: account.cancelAtPeriodEnd
      ? undefined
      : { kind: "switch", plan: planFromSlug(slug).slug },
  });
  if (!result.ok) redirect(failed(result.error));
  redirect(result.value);
}

/** The current plan's card: Stripe's cancel page, one click from ours. */
export async function cancelPlan(): Promise<void> {
  const account = await signedInAccount();
  if (!account) redirect("/signin");
  if (!canManageBilling(account)) redirect("/#pricing");

  const result = await openPortal({
    account,
    origin: await origin(),
    flow: account.cancelAtPeriodEnd ? undefined : { kind: "cancel" },
  });
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
