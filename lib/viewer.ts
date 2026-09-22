import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { account as accountTable, profile as profileTable } from "@/db/schema";
import { planFromSlug, type Plan } from "@/lib/plans";

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
 */
export type Viewer = {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  plan: Plan;
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
      accountEmail: accountTable.email,
      plan: accountTable.plan,
    })
    .from(accountTable)
    .leftJoin(
      profileTable,
      eq(profileTable.linkedinMemberId, accountTable.ownerMemberId),
    )
    .where(eq(accountTable.ownerMemberId, session.memberId))
    .limit(1);
  if (!row) return null;

  return {
    name: row.name ?? row.accountEmail ?? "Your account",
    email: row.email ?? row.accountEmail,
    avatarUrl: row.avatarUrl,
    plan: planFromSlug(row.plan === "agency" ? "agency" : "pro"),
  };
}
