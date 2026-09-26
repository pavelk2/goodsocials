import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { board as boardTable, brandPrinciple, theme as themeTable } from "@/db/schema";
import { generatePrinciples } from "@/lib/agent/principles";
import { generateThemes } from "@/lib/agent/themes";
import type { SiteText } from "@/lib/agent/site";

export type IntakeResult =
  | { ok: true; themes: string[] }
  | { ok: false; error: string };

/**
 * Brand intake: the three principles and the four themes, written in parallel
 * from one read of a site, and the site's address stored beside them. Called
 * by onboarding and by the website row in settings, so a corrected address
 * rewrites everything the wrong one wrote and nothing else.
 *
 * `url` is null for a member with no website, who wrote two sentences instead.
 */
export async function writeBrand(opts: {
  profileId: string;
  personName: string | null;
  site: Extract<SiteText, { ok: true }>;
  url: string | null;
}): Promise<IntakeResult> {
  const { profileId, personName, site, url } = opts;

  let principles;
  let themes;
  try {
    [principles, themes] = await Promise.all([
      generatePrinciples({ site, profileId, personName }),
      generateThemes({ site, profileId, personName }),
    ]);
  } catch (cause) {
    console.error("[brand-intake] research failed:", cause);
    return { ok: false, error: "We could not read enough from that page. Try your homepage." };
  }

  const db = getDb();

  await Promise.all(
    (["voice", "visual", "format"] as const).map((kind) =>
      db
        .insert(brandPrinciple)
        .values({ profileId, kind, text: principles[kind] })
        .onConflictDoUpdate({
          target: [brandPrinciple.profileId, brandPrinciple.kind],
          set: { text: principles[kind], updatedAt: new Date() },
        }),
    ),
  );

  // Replaced, not added to. A second read means the site changed, and themes
  // from the old one beside themes from the new one is a board with no subject.
  await db.delete(themeTable).where(eq(themeTable.profileId, profileId));
  await db.insert(themeTable).values(
    themes.map((t, position) => ({
      profileId,
      title: t.title,
      description: t.description,
      position,
    })),
  );

  await db.update(boardTable).set({ siteUrl: url }).where(eq(boardTable.profileId, profileId));

  return { ok: true, themes: themes.map((t) => t.title) };
}
