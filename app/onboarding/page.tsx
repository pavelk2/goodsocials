import { redirect } from "next/navigation";
import { resolveEntry, signInHref } from "@/lib/entry";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Set up your board" };

export default async function OnboardingPage() {
  const entry = await resolveEntry();

  if (entry.at === "signed-out") redirect(signInHref("signed-out"));
  if (entry.at === "no-account") redirect(signInHref("no-account"));
  if (entry.at === "no-board") redirect(signInHref("no-board"));
  if (entry.at === "no-seat") redirect("/settings");
  if (entry.at === "board") redirect("/board");

  return (
    <main className="mx-auto max-w-[760px] px-6 py-20">
      <h1 className="max-w-[20ch] text-[clamp(32px,5vw,56px)] font-semibold leading-[1.02] tracking-[-0.03em]">
        <span>Paste your website.</span>{" "}
        <span className="text-ink-3">
          We read it once, write three brand principles from it, and put seven
          posts on your board.
        </span>
      </h1>
      <OnboardingForm />
    </main>
  );
}
