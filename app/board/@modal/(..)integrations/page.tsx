import { RouteSheet } from "@/components/ui/route-sheet";
import { IntegrationsBody } from "@/components/integrations/integrations-body";

/**
 * /integrations rendered over the board, the same way /settings is. `(..)` is
 * one segment above /board because `@modal` is a slot rather than a segment.
 *
 * `?open=` carries which of the five to put the connect form on, so a glyph in
 * the board header lands on the source it names instead of on a list the user
 * then has to read. The parameter is in the url, so that state survives a
 * reload and can be sent to whoever holds the key.
 */
export default async function IntegrationsSheet({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const { open } = await searchParams;

  return (
    <RouteSheet title="Integrations">
      <IntegrationsBody open={open} inSheet />
    </RouteSheet>
  );
}
