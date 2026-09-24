import { RouteSheet } from "@/components/ui/route-sheet";
import { PrivacyBody } from "@/components/legal/privacy-body";
import { LAST_UPDATED } from "@/lib/legal";

/**
 * The privacy policy over whatever the reader was already looking at.
 *
 * Intercepted at the app root because the footer that links to it is on the
 * landing page, the sign in page and every screen behind them, and somebody
 * checking what we do with their LinkedIn account before they click Continue
 * should not lose the page that convinced them to read it.
 *
 * The URL is unchanged, which is the point: a reviewer at LinkedIn, a crawler,
 * and the link in Stripe's checkout all still get the full page.
 */
export default function PrivacySheet() {
  return (
    <RouteSheet title="Privacy">
      <p className="num text-[13px] text-ink-2">Last updated {LAST_UPDATED}</p>

      {/* Section spacing is tuned for a 720px page with air around it. In a
          sheet that first 56px gap reads as a loading state, so the rhythm
          tightens here rather than in the shared component. */}
      <div className="[&_section]:mt-8 [&_section:first-child]:mt-6">
        <PrivacyBody />
      </div>
    </RouteSheet>
  );
}
