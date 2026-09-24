import { describe, expect, it } from "vitest";
import { FACT_SHELF_LIFE_DAYS, factsBrief, isStale, type FactRow } from "../facts";

const NOW = new Date("2026-09-24T09:00:00Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000);

const row = (over: Partial<FactRow> = {}): FactRow => ({
  kind: "stripe",
  key: "mrr",
  label: "Monthly recurring revenue",
  value: "4,210 EUR",
  detail: null,
  period: "last 30 days",
  observedAt: daysAgo(1),
  ...over,
});

describe("isStale", () => {
  it("passes a reading from a healthy daily sync", () => {
    expect(isStale(daysAgo(0), NOW)).toBe(false);
    expect(isStale(daysAgo(2), NOW)).toBe(false);
    expect(isStale(daysAgo(FACT_SHELF_LIFE_DAYS - 1), NOW)).toBe(false);
  });

  it("fails a reading that sat through a week of failed syncs", () => {
    expect(isStale(daysAgo(FACT_SHELF_LIFE_DAYS + 1), NOW)).toBe(true);
    expect(isStale(daysAgo(40), NOW)).toBe(true);
  });
});

describe("factsBrief", () => {
  it("puts a fresh reading in front of the model with its period", () => {
    const brief = factsBrief([row()], NOW);
    expect(brief).toContain("4,210 EUR");
    expect(brief).toContain("last 30 days");
    expect(brief).toContain("Stripe, read");
  });

  /**
   * The one that matters. A revoked key leaves its last reading in the table
   * so the settings screen can show it, and this is what keeps that reading
   * out of a post that goes out under the user's own name six weeks later.
   */
  it("drops a stale reading even when the caller passes it", () => {
    expect(factsBrief([row({ observedAt: daysAgo(40) })], NOW)).toBe("");
  });

  it("keeps the fresh ones when only some have aged out", () => {
    const brief = factsBrief(
      [
        row({ key: "mrr", observedAt: daysAgo(40) }),
        row({ kind: "github", key: "merged", label: "Merged", value: "12", observedAt: daysAgo(1) }),
      ],
      NOW,
    );
    expect(brief).not.toContain("4,210 EUR");
    expect(brief).toContain("12");
  });

  it("says nothing at all when nothing is connected", () => {
    expect(factsBrief([], NOW)).toBe("");
  });

  it("tells the model not to round, which is the whole point of the block", () => {
    const brief = factsBrief([row()], NOW);
    expect(brief).toContain("Never round one for effect");
  });

  it("cuts Notion excerpts before it cuts numbers", () => {
    const notes = Array.from({ length: 30 }, (_, i) =>
      row({
        kind: "notion",
        key: `note:${i}`,
        label: `Note ${i}`,
        value: "x".repeat(200),
      }),
    );
    const brief = factsBrief([...notes, row({ key: "mrr" })], NOW);
    expect(brief).toContain("4,210 EUR");
    expect(brief.length).toBeLessThan(3_400);
  });
});
