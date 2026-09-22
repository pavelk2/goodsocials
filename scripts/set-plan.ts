/**
 * Put an account on a plan by hand, without Stripe.
 *
 * Stripe's webhook owns these columns in normal operation. This is the
 * operator hand crank for the two cases it does not cover: a comped account,
 * and a founder testing agency mode before a real subscription exists.
 *
 *   npx tsx scripts/set-plan.ts pavel@example.com agency
 *   npx tsx scripts/set-plan.ts pavel@example.com pro --paid
 *   npx tsx scripts/set-plan.ts pavel@example.com pro --stop
 *
 * Without a flag only the plan and seat limit move, and billing is left as
 * Stripe last set it. `--paid` writes the status the publish loop needs to
 * post, which is what makes an account comped. `--stop` takes it away.
 *
 * The next webhook for a real subscription overwrites all of this, which is
 * correct: Stripe is the source of truth and this file is a crank.
 *
 * It is not imported by app/ and it is not a substitute for the webhook.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { account as accountTable } from "../db/schema";
import { PLANS, columnForSlug, planFromSlug, type PlanSlug } from "../lib/plans";

const SLUGS = PLANS.map((plan) => plan.slug);

function usage(): never {
  console.error(
    `Usage: npx tsx scripts/set-plan.ts <account email> <${SLUGS.join("|")}> [--paid|--stop]`,
  );
  process.exit(1);
}

async function main() {
  const [email, slug, flag] = process.argv.slice(2);

  if (!email || !slug || !SLUGS.includes(slug as PlanSlug)) usage();
  if (flag && flag !== "--paid" && flag !== "--stop") usage();

  const plan = planFromSlug(slug);
  const billing =
    flag === "--paid"
      ? { subscriptionStatus: "active" as const, cancelAtPeriodEnd: false }
      : flag === "--stop"
        ? { subscriptionStatus: "canceled" as const }
        : {};

  const db = getDb();
  const updated = await db
    .update(accountTable)
    .set({
      plan: columnForSlug(plan.slug),
      seatLimit: plan.seats,
      ...billing,
    })
    .where(eq(accountTable.email, email))
    .returning();

  if (updated.length === 0) {
    console.error(`No account with email ${email}.`);
    process.exit(1);
  }

  for (const row of updated) {
    console.log(
      `${row.email}: ${plan.name}, ${row.seatLimit} seats, billing ${row.subscriptionStatus}`,
    );
  }
}

main().catch((cause) => {
  console.error(cause);
  process.exit(1);
});
