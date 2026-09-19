import Link from "next/link";
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import { Footer } from "@/components/footer";
import { PLAN_COOKIE, planFromSlug } from "@/lib/plans";

export const metadata = {
  title: "Sign in with LinkedIn",
  description:
    "Connect your LinkedIn profile so GoodSocials can write posts for your approval and publish the ones you approve.",
};

/**
 * Replaces the Auth.js default page. The stock page is an unbranded button
 * naming a major platform on a domain with no content, which is the exact
 * shape of a credential harvester and is what got goodsocials.co flagged by
 * Google Safe Browsing. Saying plainly who we are, what we ask for, and what
 * we never do is both honest and the thing that clears a review.
 *
 * Each plan arrives here with its own ?plan=, so the page states the price the
 * visitor clicked, and the choice survives the trip through LinkedIn in a
 * cookie that checkout reads. An unknown or missing slug falls back to the
 * entry plan rather than blocking the flow.
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const plan = planFromSlug((await searchParams).plan);

  return (
    <>
      <main className="mx-auto max-w-[620px] px-6 py-20">
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em]">
          <span>Connect your LinkedIn profile.</span>{" "}
          <span className="text-ink-3">
            GoodSocials writes posts, you approve them, we publish the ones you
            approve at the time you set.
          </span>
        </h1>

        <ul className="mt-10 max-w-[420px]">
          <li className="flex items-baseline justify-between gap-6 border-b border-hairline py-[14px]">
            <span className="font-medium">{plan.name}</span>
            <span className="num text-ink-2">{plan.priceLine}</span>
          </li>
          <li className="flex items-baseline justify-between gap-6 border-b border-hairline py-[14px]">
            <span className="text-ink-2">{plan.line}</span>
            <Link className="shrink-0 underline" href="/#pricing">
              Change plan
            </Link>
          </li>
        </ul>

        <form
          className="mt-10"
          action={async () => {
            "use server";
            const store = await cookies();
            store.set(PLAN_COOKIE, plan.slug, {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 60 * 24 * 30,
            });
            await signIn("linkedin", { redirectTo: "/board" });
          }}
        >
          <button
            type="submit"
            className="rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper"
          >
            Continue with LinkedIn
          </button>
          <p className="mt-3 text-[13px] text-ink-2">
            Nothing is charged now. Your board fills first, you pay when you
            want it published.
          </p>
        </form>

        <section className="mt-14">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
            What LinkedIn will ask you to allow
          </h2>
          <ul className="mt-4">
            <li className="border-b border-hairline py-[14px]">
              <p className="font-medium">Your name, photo, and email</p>
              <p className="mt-1 text-ink-2">
                So we know whose board this is and where to send the
                reconnection reminder.
              </p>
            </li>
            <li className="border-b border-hairline py-[14px]">
              <p className="font-medium">Permission to post as you</p>
              <p className="mt-1 text-ink-2">
                Used only for posts you have approved, at the time you
                scheduled. Nothing publishes without your approval.
              </p>
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-[20px] font-semibold tracking-[-0.01em]">
            What we never do
          </h2>
          <ul className="mt-4">
            {[
              "Ask for your LinkedIn password. We never see it. LinkedIn handles sign in and hands us a token.",
              "Read your inbox, your connections, or your feed.",
              "Post anything you have not approved.",
              "Sell or share your data.",
            ].map((line) => (
              <li
                key={line}
                className="border-b border-hairline py-[14px] text-ink-2"
              >
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[13px] text-ink-2">
            LinkedIn access lasts 60 days and cannot be renewed silently, so we
            email you before it runs out and ask you to reconnect. You can
            disconnect at any time from LinkedIn settings.{" "}
            <Link className="underline" href="/privacy">
              Privacy
            </Link>{" "}
            and{" "}
            <Link className="underline" href="/terms">
              Terms
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
