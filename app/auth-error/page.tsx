import Link from "next/link";
import { Footer } from "@/components/footer";

export const metadata = { title: "Sign in failed" };

/**
 * Auth.js sends every sign in failure to one page with one opaque code.
 * AccessDenied covers a member refusing consent and our own callback throwing,
 * which are nothing alike, so this page says what each one means and what to do.
 * CLAUDE.md: a user-facing failure says what happened and what to do next.
 */
const EXPLANATIONS: Record<string, { what: string; next: string }> = {
  AccessDenied: {
    what: "LinkedIn authorized you, but we could not finish setting up your board.",
    next: "Either you declined a permission on the LinkedIn screen, or something failed on our side while saving your account. Try once more. If it fails again, email us and we will look at the logs.",
  },
  Configuration: {
    what: "This deployment is missing something it needs to sign anyone in.",
    next: "That is our problem, not yours. Email us and we will fix it.",
  },
  Verification: {
    what: "That sign in link has already been used or has expired.",
    next: "Start again from the sign in page.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const detail = (error ? EXPLANATIONS[error] : undefined) ?? {
    what: "Sign in did not complete.",
    next: "Try again. If it keeps failing, email us and we will look at the logs.",
  };

  return (
    <>
      <main className="mx-auto max-w-[620px] px-6 py-24">
        <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em]">
          <span>Sign in did not finish.</span>{" "}
          <span className="text-ink-3">{detail.what}</span>
        </h1>
        <p className="mt-6 text-ink-2">{detail.next}</p>
        <div className="mt-10">
          <Link
            href="/signin"
            className="inline-block rounded-[14px] bg-ink px-6 py-[14px] text-[17px] font-semibold text-paper"
          >
            Try again
          </Link>
        </div>
        {error ? (
          <p className="mt-8 text-[13px] text-ink-3">
            Reference: <span className="num">{error}</span>
          </p>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
