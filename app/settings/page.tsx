import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { board as boardTable } from "@/db/schema";
import { loadAccess, seatName } from "@/lib/profiles";
import { readQuota } from "@/lib/quota";
import { spacingDays } from "@/lib/schedule";
import { connectionLine, needsReconnect } from "@/lib/token-expiry";
import { AGENCY_SEATS } from "@/lib/legal";
import { PRICE_AGENCY, PRICE_SOLO, planFromSlug } from "@/lib/plans";
import { saveCadence, saveGoal } from "./actions";
import { ChoiceRow } from "@/components/settings/choice-row";
import { ProfilePicker, type SeatRow } from "@/components/settings/profile-picker";

export const metadata = { title: "Settings" };

/**
 * What came back from LinkedIn after connecting a profile. One line each,
 * saying what happened and what to do, because the flow leaves the app and
 * comes back and the user has no other way to tell how it went.
 */
const LINK_OUTCOME: Record<string, string> = {
  added: "Connected. This board is now that profile's.",
  renewed: "Renewed. That profile has another 60 days.",
  full: "No seats left on this plan.",
  taken: "That LinkedIn profile is connected to a different GoodSocials account.",
  refused: "LinkedIn did not authorize it. Nothing changed.",
  stale: "That link had expired. Start again from this page.",
  failed: "LinkedIn accepted the sign in but we could not read the profile. Try again.",
  misconfigured: "LinkedIn is not configured on this deployment.",
};

const GOAL_OPTIONS = [
  { value: "interesting", label: "Interesting content" },
  { value: "followers", label: "Grow followers" },
  { value: "traffic", label: "Grow website visits" },
];

const CADENCE_OPTIONS = [1, 2, 3, 4, 5, 6, 7].map((n) => ({
  value: String(n),
  label: n === 1 ? "1 post a week" : `${n} posts a week`,
}));

/**
 * Rows, not cards. Label left, value right, tabular numerals, hairline between,
 * which is DESIGN.md section 4.
 *
 * Three things on this page cost a customer money if nobody looks at them:
 * images used against the cap, days until a LinkedIn token dies, and which
 * profile the posts are going to. The last one is why the profile list is at
 * the top rather than buried: an agency approving a week of posts onto the
 * wrong client's feed is the worst thing this product can do.
 */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string }>;
}) {
  const linked = (await searchParams).linked;
  const session = await auth();
  if (!session?.memberId) redirect("/signin");

  const access = await loadAccess(session.memberId);
  if (!access) redirect("/signin");
  if (!access.active) return <NoProfile />;

  const profile = access.active.profile;
  const db = getDb();
  const [brd] = await db
    .select()
    .from(boardTable)
    .where(eq(boardTable.profileId, profile.id))
    .limit(1);
  if (!brd) redirect("/signin");

  const quota = await readQuota(profile.id);
  const gap = spacingDays(brd.targetCadence);

  const seats: SeatRow[] = access.seats.map((seat) => ({
    id: seat.profile.id,
    name: seatName(seat),
    connection: connectionLine(seat.connection),
    needsAttention: needsReconnect(seat.connection),
    active: seat.profile.id === profile.id,
  }));

  // The plan column is solo or agency; the names and prices are lib/plans.ts,
  // so a price written once on the landing page is the price written here.
  const agency = access.account.plan === "agency";
  const plan = planFromSlug(agency ? "agency" : "pro");
  const planLine = agency
    ? `All ${access.account.seatLimit} seats are in use.`
    : `${plan.name} covers one profile at ${PRICE_SOLO}. Agency is ${PRICE_AGENCY} for up to ${AGENCY_SEATS}.`;

  return (
    <main className="px-6 py-10">
      <header className="mb-8 flex items-baseline justify-between">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em]">Settings</h1>
        <Link href="/board" className="text-[13px] text-ink-2 underline">
          Board
        </Link>
      </header>

      {linked && LINK_OUTCOME[linked] ? (
        <p className="mb-6 max-w-[760px] text-[13px] text-ink" role="status">
          {LINK_OUTCOME[linked]}
        </p>
      ) : null}

      <ProfilePicker
        seats={seats}
        seatsLeft={access.seatsLeft}
        planLine={planLine}
      />

      <section className="max-w-[760px]">
        <h2 className="text-[13px] font-medium text-ink-2">
          {seatName(access.active)}
        </h2>
        <ul className="mt-2">
          <ChoiceRow
            label="Goal"
            value={brd.goal}
            options={GOAL_OPTIONS}
            save={saveGoal}
          />
          <ChoiceRow
            label="Cadence"
            value={String(brd.targetCadence)}
            options={CADENCE_OPTIONS}
            save={saveCadence}
          />
          <Row
            label="Posting time"
            value={`${gap === 1 ? "One a day" : `One every ${gap} days`} at 09:00 UTC`}
          />
          <Row
            label="Images this month"
            value={`${quota.used} of ${quota.cap}, resets ${quota.resetsOn}`}
          />
          <Row
            label="Plan"
            value={
              agency
                ? `${plan.name}, ${access.account.seatLimit} profiles, ${plan.priceLine}`
                : `${plan.name}, one profile, ${plan.priceLine}`
            }
          />
        </ul>
      </section>

      <p className="mt-6 max-w-[560px] text-[13px] leading-[1.4] text-ink-2">
        LinkedIn access tokens last 60 days and cannot be renewed in the
        background. We email you before yours runs out, and posting pauses
        rather than failing one post at a time.
      </p>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-baseline justify-between gap-6 border-b border-hairline py-[14px]">
      <span className="text-[13px] font-medium text-ink-2">{label}</span>
      <span className="num text-right text-[15px]">{value}</span>
    </li>
  );
}

/**
 * The account exists but has no profile, which happens to a member whose
 * LinkedIn profile an agency connected to their own account. Saying so beats
 * bouncing them back to sign in, which would sign them straight back in here.
 */
function NoProfile() {
  return (
    <main className="mx-auto max-w-[620px] px-6 py-20">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em]">
        <span>No profile on this account.</span>{" "}
        <span className="text-ink-3">
          This LinkedIn profile is posted to from somebody else&apos;s
          GoodSocials account. Ask them for the board.
        </span>
      </h1>
    </main>
  );
}
