import { RouteSheet } from "@/components/ui/route-sheet";
import { TermsBody } from "@/components/legal/terms-body";
import { LAST_UPDATED } from "@/lib/legal";

/** The terms over whatever the reader was already looking at. See (.)privacy. */
export default function TermsSheet() {
  return (
    <RouteSheet title="Terms">
      <p className="num text-[13px] text-ink-2">Last updated {LAST_UPDATED}</p>

      {/* Section spacing is tuned for a 720px page with air around it. In a
          sheet that first 56px gap reads as a loading state, so the rhythm
          tightens here rather than in the shared component. */}
      <div className="[&_section]:mt-8 [&_section:first-child]:mt-6">
        <TermsBody />
      </div>
    </RouteSheet>
  );
}
