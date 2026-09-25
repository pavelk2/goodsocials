import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { account as accountTable, profile as profileTable } from "@/db/schema";
import { billingLine, canManageBilling, canPublish } from "@/lib/billing";
import { planForColumn, type Plan } from "@/lib/plans";

/**
 * Who is signed in, for the app header and nothing else.
 *
 * Deliberately not lib/entry.ts. That resolver answers where a request belongs
 * and costs a board read; the header only needs a name, a face and a plan, and
 * it renders on every signed in screen. One indexed lookup on the owner's
 * member id, joined to their own profile row for the name LinkedIn gave us.
 *
 * The owner's profile can sit on somebody else's account, which is the agency
 * case in lib/profiles.ts. The join is by member id, so the name and picture
 * are still theirs while the plan stays the one they pay for.
 *
 * The billing fields are the settings row's words, from the same functions, so
 * the menu and the settings screen cannot disagree about what somebody pays.
 */
export type Viewer = {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  plan: Plan;
  /** Null when nothing is running, so a cancelled plan is never named as current. */
  planLabel: string | null;
  /** billingLine(), the sentence the settings billing row shows. */
  billing: string;
  /** A live subscription, so the menu opens the portal rather than the prices. */
  managing: boolean;
};

export async function loadViewer(): Promise<Viewer | null> {
  const session = await auth();
  if (!session?.memberId) return null;

  const db = getDb();
  const [row] = await db
    .select({
      name: profileTable.name,
      email: profileTable.email,
      avatarUrl: profileTable.avatarUrl,
      account: accountTable,
    })
    .from(accountTable)
    .leftJoin(
      profileTable,
      eq(profileTable.linkedinMemberId, accountTable.ownerMemberId),
    )
    .where(eq(accountTable.ownerMemberId, session.memberId))
    .limit(1);
  if (!row) return null;

  const plan = planForColumn(row.account.plan);
  return {
    name: row.name ?? row.account.email ?? "Your account",
    email: row.email ?? row.account.email,
    avatarUrl: row.avatarUrl,
    plan,
    planLabel: canPublish(row.account) ? `${plan.name} plan` : null,
    billing: billingLine(row.account),
    managing: canManageBilling(row.account),
  };
}

/**
 * Whether this request carries a session, without touching the database.
 *
 * What the landing page needs and all it needs. loadViewer costs an indexed
 * read for a name, a face and a plan, and the marketing page has no slot for
 * any of them: the only thing it changes on is whether the reader has a board
 * to go back to. The cookie read makes the page dynamic, so keeping the query
 * out of it is the difference between a render and a render plus a round trip
 * to Neon on every visit.
 */
export async function isSignedIn(): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.memberId);
}

/**
 * The signed in reader's account, for the plan cards on the landing page and
 * nothing else. One indexed read, and only when there is a session, so a
 * stranger's visit still costs no round trip to Neon.
 */
export async function loadViewerAccount(): Promise<
  typeof accountTable.$inferSelect | null
> {
  const session = await auth();
  if (!session?.memberId) return null;

  const [row] = await getDb()
    .select()
    .from(accountTable)
    .where(eq(accountTable.ownerMemberId, session.memberId))
    .limit(1);
  return row ?? null;
}
