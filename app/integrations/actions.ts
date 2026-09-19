"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { source as sourceTable } from "@/db/schema";
import { resolveActor, type Actor } from "@/lib/profiles";
import { CATALOG, isSourceKind } from "@/lib/integrations/catalog";
import { connectSource, disconnectSource } from "@/lib/integrations/sources";
import { syncSource } from "@/lib/integrations/sync";

/**
 * Three actions, and none of them takes a profile id from the client. The
 * profile is whichever seat the cookie says is active, resolved server side,
 * for the reason lib/profiles.ts exists: an agency with twelve boards must not
 * be able to connect a client's Stripe key to the wrong one by editing a form.
 */

export type SourceResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

async function actor(): Promise<Actor | null> {
  const session = await auth();
  if (!session?.memberId) return null;
  return resolveActor(session.memberId);
}

function refreshViews(): void {
  revalidatePath("/integrations");
  revalidatePath("/settings");
  // The board reads facts on every draft, so a new source changes what the next
  // card says. Nothing on the board renders a fact directly, but the runway
  // notice and the card list are cached alongside it.
  revalidatePath("/board");
}

export async function connect(
  kind: string,
  values: { credential: string; handle?: string; host?: string },
): Promise<SourceResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };
  if (!isSourceKind(kind)) return { ok: false, error: "No such integration." };

  const result = await connectSource({
    profileId: who.profileId,
    kind,
    credential: values.credential ?? "",
    handle: values.handle ?? null,
    host: values.host ?? null,
  });
  if (!result.ok) return result;

  refreshViews();
  const name = CATALOG[kind].name;
  if (result.warning) return { ok: true, message: result.warning };
  return {
    ok: true,
    message:
      result.facts === 1
        ? `${name} is connected. One reading so far.`
        : `${name} is connected. ${result.facts} readings.`,
  };
}

/** Reading now, rather than waiting for the 04:00 cron. */
export async function refresh(kind: string): Promise<SourceResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };
  if (!isSourceKind(kind)) return { ok: false, error: "No such integration." };

  const [row] = await getDb()
    .select()
    .from(sourceTable)
    .where(
      and(eq(sourceTable.profileId, who.profileId), eq(sourceTable.kind, kind)),
    )
    .limit(1);
  if (!row) return { ok: false, error: `${CATALOG[kind].name} is not connected.` };

  const report = await syncSource(row);
  refreshViews();
  if (!report.ok) {
    return { ok: false, error: report.error ?? "That read did not land." };
  }
  return {
    ok: true,
    message:
      report.facts === 1 ? "Read one reading." : `Read ${report.facts} readings.`,
  };
}

export async function disconnect(kind: string): Promise<SourceResult> {
  const who = await actor();
  if (!who) return { ok: false, error: "Sign in first." };
  if (!isSourceKind(kind)) return { ok: false, error: "No such integration." };

  await disconnectSource(who.profileId, kind);
  refreshViews();
  return {
    ok: true,
    message: `${CATALOG[kind].name} is disconnected and its readings are deleted.`,
  };
}
