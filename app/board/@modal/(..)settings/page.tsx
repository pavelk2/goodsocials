import { RouteSheet } from "@/components/ui/route-sheet";
import { SettingsBody } from "@/components/settings/settings-body";

/**
 * /settings rendered over the board. `(..)` is one route segment above
 * /board, which is the app root, because `@modal` is a slot and not a segment.
 */
export default async function SettingsSheet({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string }>;
}) {
  const linked = (await searchParams).linked;

  return (
    <RouteSheet title="Settings">
      <SettingsBody linked={linked} />
    </RouteSheet>
  );
}
