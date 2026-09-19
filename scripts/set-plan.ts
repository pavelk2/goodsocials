/**
 * Move an account onto the agency plan before Stripe exists to do it.
 *
 * The seat limit is what lets a second LinkedIn profile be connected, and until
 * the Day 4 webhook sets it, every account is solo with one seat. This is the
 * operator hand crank for that one column, so the profile switcher can be used
 * on a real account this week.
 *
 *   npx tsx scripts/set-plan.ts pavel@example.com agency
 *   npx tsx scripts/set-plan.ts pavel@example.com solo
 *
 * It is not imported by app/ and it is not a substitute for the webhook.
 */
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { account as accountTable } from "../db/schema";

const SEATS = { solo: 1, agency: 12 } as const;

async function main() {
  const [email, plan] = process.argv.slice(2);

  if (!email || (plan !== "solo" && plan !== "agency")) {
    console.error("Usage: npx tsx scripts/set-plan.ts <account email> <solo|agency>");
    process.exit(1);
  }

  const db = getDb();
  const updated = await db
    .update(accountTable)
    .set({ plan, seatLimit: SEATS[plan] })
    .where(eq(accountTable.email, email))
    .returning();

  if (updated.length === 0) {
    console.error(`No account with email ${email}.`);
    process.exit(1);
  }

  for (const row of updated) {
    console.log(`${row.email}: ${row.plan}, ${row.seatLimit} seats`);
  }
}

main().catch((cause) => {
  console.error(cause);
  process.exit(1);
});
