import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { Footer } from "@/components/footer";
import { BLOCK_LINE, resolveEntry, type EntryBlock } from "@/lib/entry";
import { PLAN_COOKIE, TRIAL_LINE, planFromSlug } from "@/lib/plans";

export const metadata = {
  title: "Sign in with LinkedIn",
  description:
    "Connect your LinkedIn profile so GoodSocials can write posts for your approval and publish the ones you approve.",
};

/**
 * Replaces the Auth.js default page. The stock page is an unbranded button
 * naming a major platform on a domain with no content, which is the exact
 * shape of a credential harvester and is what got goodsocials.co flagged by
 * Google Safe Browsing. So the page still says who we are, what LinkedIn is
 * about to ask for, and what we never do, but in four lines instead of two
 * screens. The long version lives on the landing page and in the terms.
 *
 * Each plan arrives here with its own ?plan=, so the page states the price the
 * visitor clicked, and the choice survives the trip through LinkedIn in a
 * cookie that checkout reads. An unknown or missing slug falls back to the
 * entry plan rather than blocking the flow.
 *
 * A member who is already signed in never sees this page as a stranger would.
 * Either their board opens, or the page names what is stopping it. Sending
 * them back through LinkedIn with nothing said is what turned one broken row
 * into a redirect loop: consent takes a blink the second time, so the bounce
 * came straight back here and looked like a sign in that would not take.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; stuck?: string }>;
}) {
  const params = await searchParams;
  const plan = planFromSlug(params.plan);
  const entry = await resolveEntry();

  if (entry.at === "board") redirect("/board");
  if (entry.at === "onboarding") redirect("/onboarding");
  if (entry.at === "no-seat") redirect("/settings");

  // Live state, not the ?stuck= that sent them here. The parameter is there so
  // the reason survives in a screenshot and in the log; the sentence comes
  // from what is true now.
  const blocked: Exclude<EntryBlock, "signed-out"> | null =
    entry.at === "signed-out" ? null : entry.at;

  return (
    <>
      {/* One lifted card on the warm ground, the same object the landing page
          is built out of. DESIGN.md section 7. */}
      <main className="mx-auto max-w-[480px] px-6 py-20">
        <div className="card-lift rounded-[var(--r-xl)] p-8 sm:p-10">
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-[-0.03em]">
            {blocked ? "Finish connecting." : "Connect your LinkedIn profile."}
          </h1>
          <p className="mt-3 text-ink-2">
            {blocked
              ? BLOCK_LINE[blocked]
              : "GoodSocials writes the posts, you approve them, we publish at the time you set."}
          </p>

          <div className="mt-10 flex items-baseline justify-between gap-6 border-y border-hairline py-[14px]">
            <span>
              <span className="font-medium">{plan.name}</span>{" "}
              <span className="text-ink-2">{plan.line}</span>
            </span>
            <Link className="shrink-0 text-ink-2 underline" href="/#pricing">
              Change
            </Link>
          </div>

          <form
            className="mt-8"
            action={async () => {
              "use server";
              const store = await cookies();
              store.set(PLAN_COOKIE, plan.slug, {
                httpOnly: true,
                sameSite: "lax",
                secure: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 30,
              });
              await signIn("linkedin", { redirectTo: "/board" });
            }}
          >
            <button
              type="submit"
              className="pill btn-ink w-full bg-ink px-6 py-[14px] text-[17px] text-paper"
            >
              {blocked ? "Connect again" : "Continue with LinkedIn"}
            </button>
            <p className="num mt-3 text-center text-[13px] text-ink-2">
              {TRIAL_LINE} Then {plan.priceLine}.
            </p>
          </form>

          {blocked ? (
            // The only way out of a session that cannot open a board. Without it
            // the member is holding a cookie they have no control over.
            <form
              className="mt-6 text-center"
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/signin" });
              }}
            >
              <button
                type="submit"
                className="text-[13px] text-ink-2 underline"
              >
                Sign out and start again
              </button>
            </form>
          ) : null}

          <ul className="mt-12 text-[13px] text-ink-2">
            <li className="border-t border-hairline py-[12px]">
              LinkedIn asks you to allow your name and email, and posting as
              you.
            </li>
            <li className="border-y border-hairline py-[12px]">
              We never see your password, and nothing publishes without your
              approval.
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
