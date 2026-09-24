import { describe, expect, it } from "vitest";
import {
  ago,
  atLeast,
  day,
  duration,
  minorUnitsPerMajor,
  money,
  percent,
  series,
} from "../format";

/**
 * The money tests are the ones that matter. Every other function here fails
 * visibly, in a sentence somebody reads before approving. A currency mistake
 * does not: "4,210 EUR" and "421,000 EUR" are both plausible sentences, and
 * only one of them is the user's revenue.
 */

describe("minorUnitsPerMajor", () => {
  it("is 100 for the currencies that have cents", () => {
    expect(minorUnitsPerMajor("usd")).toBe(100);
    expect(minorUnitsPerMajor("EUR")).toBe(100);
    expect(minorUnitsPerMajor("gbp")).toBe(100);
  });

  it("is 1 for the zero-decimal currencies", () => {
    expect(minorUnitsPerMajor("jpy")).toBe(1);
    expect(minorUnitsPerMajor("KRW")).toBe(1);
    expect(minorUnitsPerMajor("vnd")).toBe(1);
  });
});

describe("money", () => {
  it("divides by 100 and says the code", () => {
    expect(money(421_000, "eur")).toBe("4,210 EUR");
  });

  it("leaves a zero-decimal currency alone", () => {
    // 421000 JPY is 421,000 yen. Dividing it would report a hundredth of the
    // real number, which is the failure this test exists for.
    expect(money(421_000, "jpy")).toBe("421,000 JPY");
  });

  it("keeps the cents on a small amount and drops them on a large one", () => {
    expect(money(4_250, "usd")).toBe("42.50 USD");
    expect(money(1_234_567, "usd")).toBe("12,346 USD");
  });

  it("handles zero and a negative", () => {
    expect(money(0, "usd")).toBe("0 USD");
    expect(money(-4_250, "usd")).toBe("-42.50 USD");
  });
});

describe("atLeast", () => {
  it("says so when the API truncated the list", () => {
    expect(atLeast(100, true)).toBe("100 or more");
    expect(atLeast(37, false)).toBe("37");
  });
});

describe("percent and duration", () => {
  it("rounds a fraction to whole percent", () => {
    expect(percent(0.4237)).toBe("42%");
    expect(percent(1)).toBe("100%");
  });

  it("reads seconds as minutes and seconds", () => {
    expect(duration(134)).toBe("2m 14s");
    expect(duration(45)).toBe("45s");
    expect(duration(120)).toBe("2m 0s");
  });
});

describe("day and ago", () => {
  it("writes a date the way it is read aloud", () => {
    expect(day(new Date("2026-09-04T00:00:00Z"))).toBe("4 September 2026");
  });

  it("refuses to invent a date it cannot parse", () => {
    expect(day("not a date")).toBe("an unknown date");
    expect(ago("not a date")).toBe("at an unknown time");
  });

  it("counts back in days and gives up at a month", () => {
    const now = new Date("2026-09-24T12:00:00Z");
    expect(ago(new Date("2026-09-24T09:00:00Z"), now)).toBe("today");
    expect(ago(new Date("2026-09-23T09:00:00Z"), now)).toBe("yesterday");
    expect(ago(new Date("2026-09-18T09:00:00Z"), now)).toBe("6 days ago");
    expect(ago(new Date("2026-06-01T09:00:00Z"), now)).toBe("1 June 2026");
  });
});

describe("series", () => {
  it("cuts at three and joins with commas, no and", () => {
    expect(series(["/pricing", "/", "/blog/why-we-moved", "/about"])).toBe(
      "/pricing, /, /blog/why-we-moved",
    );
  });
});
