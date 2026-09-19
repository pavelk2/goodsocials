import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import {
  account as accountTable,
  board as boardTable,
  linkedinConnection,
  profile as profileTable,
} from "@/db/schema";
import { readQuota } from "@/lib/quota";
import { spacingDays } from "@/lib/schedule";
import { expiryLine } from "@/lib/token-expiry";

export const metadata = { title: "Settings" };

/**
 * Rows, not cards. Label left, value right, tabular numerals, hairline between,
 * which is DESIGN.md section 4 and the reason this screen is thirty lines.
 *
 * Two numbers on this page are the ones that cost a customer money if nobody
 * looks at them: images used against the cap, and days until the LinkedIn
 * token dies. Day 4 emails about the second one. Until then it is at least on
 * a screen a user can reach.
 */
export default async function SettingsPage() {
  const session = await auth();
  if (!session?.memberId) redirect("/signin");

  const db = getDb();
  const [row] = await db
    .select({
      profile: profileTable,
      account: accountTable,
      board: boardTable,
      connection: linkedinConnection,
    })
    .from(profileTable)
    .innerJoin(accountTable, eq(profileTable.accountId, accountTable.id))
    .innerJoin(boardTable, eq(boardTable.profileId, profileTable.id))
    .leftJoin(
      linkedinConnection,
      eq(linkedinConnection.profileId, profileTable.id),
    )
    .where(eq(profileTable.linkedinMemberId, session.memberId))
    .limit(1);
  if (!row) redirect("/signin");

  const quota = await readQuota(row.profile.id);
  const gap = spacingDays(row.board.targetCadence);

  const rows: { label: string; value: string }[] = [
    { label: "Posting as", value: row.profile.name ?? row.profile.linkedinMemberId },
    {
      label: "Plan",
      value:
        row.account.plan === "agency"
          ? `Agency, ${row.account.seatLimit} profiles, $1,000 a month`
          : "Solo, one profile, $100 a month",
    },
    { label: "Goal", value: GOAL_LABEL[row.board.goal] },
    {
      label: "Cadence",
      value: `${row.board.targetCadence} posts a week, ${
        gap === 1 ? "one a day" : `one every ${gap} days`
      } at 09:00 UTC`,
    },
    {
      label: "Images this month",
      value: `${quota.used} of ${quota.cap}, resets ${quota.resetsOn}`,
    },
    {
      label: "LinkedIn connection",
      value: expiryLine(row.connection?.expiresAt ?? null),
    },
  ];

  return (
    <main className="px-6 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Settings</h1>
        <Link href="/board" className="text-[13px] text-ink-2 underline">
          Board
        </Link>
      </header>

      <ul className="max-w-[760px]">
        {rows.map((item) => (
          <li
            key={item.label}
            className="flex items-baseline justify-between gap-6 border-b border-hairline py-[14px]"
          >
            <span className="text-[13px] font-medium text-ink-2">{item.label}</span>
            <span className="num text-right text-[15px]">{item.value}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-[560px] text-[13px] leading-[1.4] text-ink-2">
        LinkedIn access tokens last 60 days and cannot be renewed in the
        background. We email you before yours runs out, and posting pauses
        rather than failing one post at a time.
      </p>
    </main>
  );
}

const GOAL_LABEL: Record<string, string> = {
  interesting: "Interesting content",
  followers: "Grow followers",
  traffic: "Grow website visits",
};
