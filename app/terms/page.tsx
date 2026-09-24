import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { TermsBody } from "@/components/legal/terms-body";
import { LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms | GoodSocials",
  description:
    "What GoodSocials does for you, what it costs, what you are responsible for, and how to leave.",
};

/**
 * The terms of use URL LinkedIn asks for alongside the privacy policy. Public,
 * static, no auth. The prices come from lib/plans.ts and the image cap from
 * lib/legal.ts, so this page cannot disagree with the product.
 *
 * Same two audiences as the privacy policy, and the same answer: a footer click
 * opens the sheet at app/@modal, a direct URL renders this.
 */
export default function Terms() {
  return (
    <LegalPage
      title="Terms."
      summary="What we do for you, what it costs, what you are responsible for, and how to leave."
      lastUpdated={LAST_UPDATED}
    >
      <TermsBody />
    </LegalPage>
  );
}
