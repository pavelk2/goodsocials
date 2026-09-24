import type { Metadata } from "next";
import { LegalPage } from "@/components/legal";
import { PrivacyBody } from "@/components/legal/privacy-body";
import { LAST_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy | GoodSocials",
  description:
    "What GoodSocials collects from your LinkedIn account, why, who else touches it, and how to delete it.",
};

/**
 * The privacy policy URL LinkedIn asks for during app verification. It has to
 * be reachable without signing in, so this page is static and sits outside any
 * auth group. The facts it states live in lib/legal.ts.
 *
 * Clicked from a footer inside the app it opens as a sheet instead, intercepted
 * at app/@modal. Typed, linked from Stripe, or handed to a reviewer, it renders
 * here as the full page, which is the only way those two audiences can both be
 * served by one URL.
 */
export default function Privacy() {
  return (
    <LegalPage
      title="Privacy."
      summary="What we collect from your LinkedIn account, why, who else touches it, and how to delete it."
      lastUpdated={LAST_UPDATED}
    >
      <PrivacyBody />
    </LegalPage>
  );
}
