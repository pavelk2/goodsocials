import Link from "next/link";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { board as boardTable } from "@/db/schema";
import {
  billingLine,
  canManageBilling,
  canPublish,
  planOf,
  type Account,
} from "@/lib/billing";
import { loadAccess, seatName } from "@/lib/profiles";
import { readQuota } from "@/lib/quota";
import { listSources } from "@/lib/integrations/sources";
import { boardZone, spacingDays } from "@/lib/schedule";
import { PUBLISH_HOUR, allZones, dayKey, formatDay, offsetLabel } from "@/lib/time";
import { summarisePastPosts } from "@/lib/history-store";
import { PAST_POST_LIMIT } from "@/db/schema";
import { connectionLine, needsReconnect } from "@/lib/token-expiry";
import { AGENCY_SEATS } from "@/lib/legal";
import {
  PLAN_COOKIE,
  PRICE_AGENCY,
  PRICE_SOLO,
  planFromSlug,
  type Plan,
} from "@/lib/plans";
import { manageBilling, startPlanCheckout } from "@/app/billing/actions";
import { saveCadence, saveGoal, saveTimezone } from "@/app/settings/actions";
import { ChoiceRow } from "@/components/settings/choice-row";
import { DeleteAccount } from "@/components/settings/delete-account";
import { HistoryImport } from "@/components/settings/history-import";
import { ProfilePicker, type SeatRow } from "@/components/settings/profile-picker";

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

/**
 * What came back from Stripe. Checkout and the portal both leave the app and
 * come back, so the same rule as LINK_OUTCOME applies: one line each, saying
 * what happened, because the user has no other way to tell.
 *
 * There is no "you are now subscribed" line. The plan row below says that, and
 * it says it from the webhook rather than from a query parameter anyone could
 * type. A success line that disagreed with the row under it would be worse
 * than no line at all.
 */
const BILLING_OUTCOME: Record<string, string> = {
  started: "Stripe has your payment. The plan below updates the moment Stripe confirms it, usually within seconds.",
  cancelled: "Checkout closed. Nothing was charged.",
};

const GOAL_OPTIONS = [
  { value: "interesting", label: "Interesting content" },
  { value: "followers", label: "Grow followers" },
  { value: "traffic", label: "Grow website visits" },
  { value: "leads", label: "Leads" },
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
export async function SettingsBody({
  linked,
  billing,
  why,
}: {
  linked?: string;
  /** What Stripe came back with: `started`, `cancelled` or `error`. */
  billing?: string;
  /** The sentence a failed checkout or portal call wrote onto the URL. */
  why?: string;
}) {
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

  const [quota, sources] = await Promise.all([
    readQuota(profile.id),
    listSources(profile.id),
  ]);
  const gap = spacingDays(brd.targetCadence);
  const connectedSources = sources.filter((s) => s.connected !== null).length;
  const history = await summarisePastPosts(profile.id);

  // The whole IANA list from the runtime rather than a curated one, because a
  // curated list is a list somebody's city is missing from. A native select
  // already knows how to be typed into, which DESIGN.md calls the feature.
  const zone = boardZone(brd.timezone);
  const zoneOptions = allZones().map((name) => ({ value: name, label: name }));
  if (!zoneOptions.some((option) => option.value === zone)) {
    zoneOptions.unshift({ value: zone, label: zone });
  }

  const seats: SeatRow[] = access.seats.map((seat) => ({
    id: seat.profile.id,
    name: seatName(seat),
    connection: connectionLine(seat.connection),
    needsAttention: needsReconnect(seat.connection),
    active: seat.profile.id === profile.id,
  }));

  // The plan column and its seat limit are written by the Stripe webhook, so
  // what this screen says about the plan is what Stripe last said about the
  // subscription. The names and prices are lib/plans.ts, so a price written
  // once on the landing page is the price written here.
  const account = access.account;
  const plan = planOf(account);
  const multi = plan.seats > 1;
  const planLine = multi
    ? `All ${account.seatLimit} seats are in use.`
    : `${plan.name} covers one profile at ${PRICE_SOLO}. Agency is ${PRICE_AGENCY} for up to ${AGENCY_SEATS}.`;

  // Somebody who has never checked out sees the plan they picked on the way
  // in, carried in the cookie the sign in page wrote. That choice survived a
  // trip through LinkedIn and should not be asked for twice.
  const picked = await pickedPlan(plan);
  const outcome = billing === "error" ? why : BILLING_OUTCOME[billing ?? ""];

  return (
    <>
      {linked && LINK_OUTCOME[linked] ? (
        <p className="mb-6 max-w-[760px] text-[13px] text-ink" role="status">
          {LINK_OUTCOME[linked]}
        </p>
      ) : null}

      {outcome ? (
        <p className="mb-6 max-w-[760px] text-[13px] text-ink" role="status">
          {outcome}
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
          <ChoiceRow
            label="Time zone"
            value={zone}
            options={zoneOptions}
            save={saveTimezone}
          />
          <Row
            label="Posting time"
            value={`${gap === 1 ? "One a day" : `One every ${gap} days`} at ${String(
              PUBLISH_HOUR,
            ).padStart(2, "0")}:00, ${offsetLabel(zone)}`}
          />
          <Row
            label="Earlier posts"
            value={
              history.count === 0
                ? "None imported"
                : `${history.count} imported, newest ${formatDay(
                    dayKey(history.newest ?? new Date(), boardZone(brd.timezone)),
                    boardZone(brd.timezone),
                  )}`
            }
          />
          <Row
            label="Images this month"
            value={`${quota.used} of ${quota.cap}, resets ${quota.resetsOn}`}
          />
          <LinkRow
            label="Integrations"
            href="/integrations"
            value={
              connectedSources === 0
                ? `Nothing connected, ${sources.length} available`
                : `${connectedSources} of ${sources.length} connected`
            }
          />
          <Row
            label="Plan"
            value={
              // What this account is entitled to right now, which for a
              // cancelled one is nothing. Naming the plan they used to be on
              // next to a price they are not paying is the kind of row
              // somebody reads as still being charged.
              !canPublish(account)
                ? "None"
                : multi
                  ? `${plan.name}, ${account.seatLimit} profiles, ${plan.priceLine}`
                  : `${plan.name}, one profile, ${plan.priceLine}`
            }
          />
          <BillingRow account={account} picked={picked} />
        </ul>
      </section>

      {canPublish(account) ? null : (
        <p className="mt-6 max-w-[560px] text-[13px] leading-[1.4] text-ink-2">
          Approved posts stay where they are while billing is stopped. They
          publish at the times they already hold as soon as a plan is running.
        </p>
      )}

      <section className="mt-8 max-w-[760px]">
        <h2 className="text-[13px] font-medium text-ink-2">
          Posts already on LinkedIn
        </h2>
        <p className="mt-2 max-w-[560px] text-[13px] leading-[1.4] text-ink-2">
          The calendar can show what this profile posted before GoodSocials, so
          a month reads as the run it is. LinkedIn does not let an app read a
          member&apos;s posts, so it comes from your own copy of your data: in
          LinkedIn settings open Data privacy, then Get a copy of your data,
          pick Posts, and they email an archive within minutes. Upload
          Shares.csv from it. The most recent {PAST_POST_LIMIT} are kept, for
          reference only. Nothing imported is ever posted again.
        </p>

        <HistoryImport count={history.count} limit={PAST_POST_LIMIT} />
      </section>

      <p className="mt-8 max-w-[560px] text-[13px] leading-[1.4] text-ink-2">
        LinkedIn access tokens last 60 days and cannot be renewed in the
        background. We email you before yours runs out, and posting pauses
        rather than failing one post at a time.
      </p>

      <section className="mt-8 max-w-[760px]">
        <h2 className="text-[13px] font-medium text-ink-2">Your account</h2>
        <ul className="mt-2">
          <li className="flex items-baseline justify-between gap-6 border-b border-hairline py-[14px]">
            <span className="text-[13px] font-medium text-ink-2">Your data</span>
            {/* A plain link, so it downloads with no JavaScript and works
                with save link as. The route sets the file name. */}
            <a
              href="/api/account/export"
              download
              className="text-right text-[15px] text-ink underline"
            >
              {access.seats.length === 1
                ? "Download as JSON"
                : `Download all ${access.seats.length} profiles as JSON`}
            </a>
          </li>
          <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hairline py-[14px]">
            <span className="text-[13px] font-medium text-ink-2">Close account</span>
            <DeleteAccount
              profiles={access.seats.length}
              subscribed={canManageBilling(account)}
            />
          </li>
        </ul>
      </section>
    </>
  );
}

/**
 * The one row on this page that goes somewhere. The value is the link rather
 * than a chevron beside it, because the value is what the user came to read and
 * a second target for the same destination is a second thing to aim at.
 */
function LinkRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <li className="flex items-baseline justify-between gap-6 border-b border-hairline py-[14px]">
      <span className="text-[13px] font-medium text-ink-2">{label}</span>
      <Link href={href} className="num text-right text-[15px] text-ink underline">
        {value}
      </Link>
    </li>
  );
}

/**
 * The one row with a button in it. Which button depends on a column rather
 * than on a screen: an account with a Stripe customer manages its subscription
 * in the portal, and one without starts the plan it picked on the way in.
 *
 * Stripe hosts both destinations, which is why cancelling, upgrading and
 * updating a card are three flows this repo does not implement.
 */
function BillingRow({
  account,
  picked,
}: {
  account: Account;
  picked: Plan;
}) {
  const managing = canManageBilling(account);

  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-hairline py-[14px]">
      <span className="text-[13px] font-medium text-ink-2">Billing</span>
      <span className="flex flex-wrap items-baseline justify-end gap-x-4 gap-y-2 text-right">
        <span className="num text-[15px]">{billingLine(account)}</span>
        <form
          action={
            managing ? manageBilling : startPlanCheckout.bind(null, picked.slug)
          }
        >
          <button
            type="submit"
            className="shrink-0 text-[13px] text-ink-2 underline underline-offset-2"
          >
            {managing ? "Manage billing" : picked.cta}
          </button>
        </form>
      </span>
    </li>
  );
}

/**
 * The plan the visitor clicked on the way in, which the sign in page wrote to
 * a cookie so it would survive the trip through LinkedIn. Falls back to the
 * plan the account is already on, which for a new account is the entry plan.
 */
async function pickedPlan(current: Plan): Promise<Plan> {
  const chosen = (await cookies()).get(PLAN_COOKIE)?.value;
  return chosen ? planFromSlug(chosen) : current;
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
    <div className="max-w-[620px] py-6">
      <p className="text-[22px] font-semibold leading-[1.25] tracking-[-0.02em]">
        <span>No profile on this account.</span>{" "}
        <span className="text-ink-3">
          This LinkedIn profile is posted to from somebody else&apos;s
          GoodSocials account. Ask them for the board.
        </span>
      </p>
    </div>
  );
}
