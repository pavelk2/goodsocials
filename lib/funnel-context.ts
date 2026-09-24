import { asc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { brandPrinciple, theme as themeTable } from "@/db/schema";
import type { Principles } from "@/lib/agent/principles";
import { fetchSiteText, type SiteText } from "@/lib/agent/site";
import { loadAccess } from "@/lib/profiles";
import { readAnonId } from "@/lib/track";
import type { Funnel } from "@/lib/funnel";

/**
 * Who a funnel request is for, answered once for every route and action.
 * The profile is the active seat, not the member's own, so an agency walking a
 * client's board through onboarding writes to the client's board.
 */
export async function funnelActor() {
  const session = await auth();
  if (!session?.memberId) return null;
  const access = await loadAccess(session.memberId);
  const seat = access?.active;
  if (!access || !seat) return null;
  return {
    memberId: session.memberId,
    account: access.account,
    profile: seat.profile,
    distinctId: (await readAnonId()) ?? session.memberId,
  };
}

export type FunnelActor = NonNullable<Awaited<ReturnType<typeof funnelActor>>>;

/** Shortest description we will write a brand from. Two real sentences. */
export const MIN_DESCRIPTION = 60;

/**
 * The text research reads. A website is fetched; a member with no website
 * wrote two sentences instead, and those stand in for the page.
 */
export async function siteFor(
  site: Funnel["site"],
  personName: string | null,
): Promise<SiteText> {
  if (site?.url) return fetchSiteText(site.url);
  const text = site?.description?.trim() ?? "";
  if (text.length < MIN_DESCRIPTION) {
    return {
      ok: false,
      error: "Write two sentences about what you do and who it is for.",
    };
  }
  return { ok: true, url: "", title: personName ?? "What they do", text };
}

export async function readBrand(profileId: string) {
  const db = getDb();
  const [rows, themes] = await Promise.all([
    db.select().from(brandPrinciple).where(eq(brandPrinciple.profileId, profileId)),
    db
      .select()
      .from(themeTable)
      .where(eq(themeTable.profileId, profileId))
      .orderBy(asc(themeTable.position)),
  ]);
  const principles: Principles = { voice: "", visual: "", format: "", reader: "" };
  for (const row of rows) principles[row.kind] = row.text;
  return { principles, themes };
}
