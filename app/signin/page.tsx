import Link from "next/link";
import { signIn } from "@/auth";
import { Footer } from "@/components/footer";

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
 */
export default function SignInPage() {
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

        <form
          className="mt-10"
          action={async () => {
            "use server";
            await signIn("linkedin", { redirectTo: "/board" });
          }}
        >
          <button
            type="submit"
            className="rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper"
          >
            Continue with LinkedIn
          </button>
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
