import { RouteSheet } from "@/components/ui/route-sheet";
import { SettingsBody } from "@/components/settings/settings-body";

/**
 * /settings rendered over the board. `(..)` is one route segment above
 * /board, which is the app root, because `@modal` is a slot and not a segment.
 */
export default async function SettingsSheet({
  searchParams,
}: {
  searchParams: Promise<{ linked?: string; billing?: string; why?: string }>;
}) {
  const { linked, billing, why } = await searchParams;

  return (
    <RouteSheet title="Settings">
      <SettingsBody linked={linked} billing={billing} why={why} />
    </RouteSheet>
  );
}
