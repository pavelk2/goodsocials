import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT, PRICE_SOLO } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Start | GoodSocials",
  description:
    "Sign in with LinkedIn, paste your website address, and approve the first post.",
};

/**
 * Where the landing page button goes. It is the sign-in entry point, and it
 * says so plainly while the LinkedIn app is still in review, because the one
 * button on the site should not open a page that pretends something works.
 *
 * Day 1 of the roadmap replaces the body of this page with the Auth.js
 * LinkedIn authorization, which asks for all four scopes in one consent.
 */
export default function Start() {
  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-24">
      <Link href="/" className="text-ink-2 underline underline-offset-4">
        GoodSocials
      </Link>

      <h1 className="type-head mt-10 max-w-[18ch]">
        <span>Sign in with LinkedIn.</span>{" "}
        <span className="cont">
          One authorization, then you paste your website address and the board
          fills with seven posts before you pay anything.
        </span>
      </h1>

      <p className="mt-10 max-w-[52ch] text-ink-2">
        Sign-in opens when LinkedIn finishes reviewing the app. Write to{" "}
        <a
          href={`mailto:${CONTACT}?subject=GoodSocials`}
          className="text-ink underline underline-offset-4"
        >
          {CONTACT}
        </a>{" "}
        and I will set your board up by hand in the meantime, at the same{" "}
        {PRICE_SOLO}.
      </p>
    </main>
  );
}
