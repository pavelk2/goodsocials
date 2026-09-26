import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { board as boardTable, card as cardTable } from "@/db/schema";
import { canPublish } from "@/lib/billing";
import { emptyFunnel } from "@/lib/funnel";
import { funnelActor } from "@/lib/funnel-context";
import { assertDebugSecret, htmlPage } from "@/lib/linkedin/debug-auth";

/**
 * Sends the signed in member's active profile back to the first onboarding
 * question, so a founder who is already registered can walk the funnel the
 * way a stranger does. Gated on LINKEDIN_DEBUG_SECRET like the other admin
 * routes, and on a session, so it only ever restarts the caller's own board.
 *
 * Nothing is deleted. The ideas waiting in the Idea column are marked
 * rejected, because the funnel writes a fresh seven and skips that step on a
 * column that already has cards. Drafts, scheduled and posted cards are left
 * alone, and billing is not touched: its columns have one writer, the Stripe
 * webhook. An account that already pays skips the paywall, which the page
 * below says, with the hand crank that makes it show.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const denied = assertDebugSecret(url);
  if (denied) return htmlPage("Blocked", `<h1>Blocked</h1><p>${denied}</p>`);

  const actor = await funnelActor();
  if (!actor) {
    return htmlPage(
      "Sign in first",
      "<h1>Sign in first</h1><p>Open goodsocials.co, sign in with LinkedIn, then load this link again.</p>",
    );
  }

  const db = getDb();
  const [brd] = await db
    .select({ id: boardTable.id })
    .from(boardTable)
    .where(eq(boardTable.profileId, actor.profile.id))
    .limit(1);
  if (!brd) return htmlPage("No board", "<h1>No board</h1><p>This profile has no board.</p>");

  const rejected = await db
    .update(cardTable)
    .set({ state: "rejected", updatedAt: new Date() })
    .where(and(eq(cardTable.boardId, brd.id), eq(cardTable.state, "idea")))
    .returning({ id: cardTable.id });

  await db.update(boardTable).set({ funnel: emptyFunnel() }).where(eq(boardTable.id, brd.id));

  const paying = canPublish(actor.account);
  const email = actor.account.email ?? "your email";

  return htmlPage(
    "Onboarding restarted",
    `<h1>Onboarding restarted.</h1>
<div class="row"><span>profile</span><span>${actor.profile.name ?? actor.profile.id}</span></div>
<div class="row"><span>ideas set aside</span><span>${rejected.length}</span></div>
<div class="row"><span>billing</span><span>${actor.account.subscriptionStatus}</span></div>
<p>${
      paying
        ? `This account can publish, so the paywall will be skipped. To see it, run <code>npx tsx scripts/set-plan.ts ${email} pro --stop</code> first, and <code>--paid</code> afterwards to restore.`
        : "This account has no active plan, so you will see the paywall. Stripe prices are live: the checkout starts a real 14 day trial, which you can cancel from settings for 0 USD."
    }</p>
<a class="btn" href="/onboarding">Open onboarding</a>`,
  );
}
