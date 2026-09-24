import { describe, expect, it } from "vitest";
import { addUp, amountOf, monthlyFactor } from "../adapters/stripe";

/**
 * MRR is the reading customers will put in a post with their own name on it,
 * so every way it can be quietly wrong gets a case here. None of these fail
 * loudly in production: an annual plan counted twelve times over still renders
 * as a clean number in a sentence.
 */

const price = (over: Partial<{
  unit_amount: number | null;
  unit_amount_decimal: string | null;
  currency: string;
  recurring: { interval: string; interval_count: number } | null;
}> = {}) => ({
  unit_amount: 10_000,
  unit_amount_decimal: null,
  currency: "usd",
  recurring: { interval: "month", interval_count: 1 },
  ...over,
});

const sub = (...prices: ReturnType<typeof price>[]) => ({
  items: { data: prices.map((p) => ({ quantity: 1, price: p })) },
});

describe("monthlyFactor", () => {
  it("passes a monthly plan through", () => {
    expect(monthlyFactor("month", 1)).toBe(1);
  });

  it("spreads a yearly plan over twelve months", () => {
    expect(monthlyFactor("year", 1)).toBeCloseTo(1 / 12, 10);
  });

  it("counts a weekly plan as 52/12, not 4", () => {
    // Four weeks to a month is 4 percent light over a year, which is a
    // revenue figure that is wrong in a way nobody would catch.
    expect(monthlyFactor("week", 1)).toBeCloseTo(52 / 12, 10);
    expect(monthlyFactor("week", 1)).not.toBeCloseTo(4, 2);
  });

  it("handles a daily plan", () => {
    expect(monthlyFactor("day", 1)).toBeCloseTo(365 / 12, 10);
  });

  it("divides by the interval count", () => {
    expect(monthlyFactor("month", 3)).toBeCloseTo(1 / 3, 10);
    expect(monthlyFactor("year", 2)).toBeCloseTo(1 / 24, 10);
  });

  it("treats a zero or missing count as one", () => {
    expect(monthlyFactor("month", 0)).toBe(1);
  });

  it("returns null for an interval it does not know", () => {
    expect(monthlyFactor("fortnight", 1)).toBeNull();
  });
});

describe("amountOf", () => {
  it("prefers unit_amount", () => {
    expect(amountOf(price({ unit_amount: 4_250 }))).toBe(4_250);
  });

  it("falls back to the decimal string on a fractional price", () => {
    expect(
      amountOf(price({ unit_amount: null, unit_amount_decimal: "0.4" })),
    ).toBe(0.4);
  });

  it("returns null rather than NaN on junk", () => {
    expect(
      amountOf(price({ unit_amount: null, unit_amount_decimal: "abc" })),
    ).toBeNull();
    expect(
      amountOf(price({ unit_amount: null, unit_amount_decimal: null })),
    ).toBeNull();
  });
});

describe("addUp", () => {
  it("adds monthly subscriptions at face value", () => {
    const total = addUp([sub(price()), sub(price())]);
    expect(total).toEqual({ mrrMinor: 20_000, currency: "usd" });
  });

  it("counts a yearly plan at a twelfth", () => {
    const yearly = price({
      unit_amount: 120_000,
      recurring: { interval: "year", interval_count: 1 },
    });
    expect(addUp([sub(yearly)]).mrrMinor).toBeCloseTo(10_000, 6);
  });

  it("multiplies by quantity", () => {
    const rows = [{ items: { data: [{ quantity: 12, price: price() }] } }];
    expect(addUp(rows).mrrMinor).toBe(120_000);
  });

  it("treats a null quantity as one", () => {
    const rows = [{ items: { data: [{ quantity: null, price: price() }] } }];
    expect(addUp(rows).mrrMinor).toBe(10_000);
  });

  it("ignores a one-off price with no recurring block", () => {
    expect(addUp([sub(price({ recurring: null }))]).mrrMinor).toBe(0);
  });

  it("locks to the first currency and leaves the others out", () => {
    // Adding EUR to USD would produce a number that is not money in either.
    const total = addUp([sub(price()), sub(price({ currency: "eur" }))]);
    expect(total).toEqual({ mrrMinor: 10_000, currency: "usd" });
  });

  it("carries the currency across pages", () => {
    const total = addUp([sub(price({ currency: "eur" }))], "usd");
    expect(total).toEqual({ mrrMinor: 0, currency: "usd" });
  });

  it("is zero on an empty account rather than throwing", () => {
    expect(addUp([])).toEqual({ mrrMinor: 0, currency: "" });
    expect(addUp([{ items: { data: [] } }]).mrrMinor).toBe(0);
  });
});
