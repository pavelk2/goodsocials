import { describe, expect, it } from "vitest";
import { credentialError, messageFrom } from "../http";

/**
 * The bodies below are the real ones, copied from live calls made with a
 * deliberately wrong key on 19 September 2026. Four APIs put their message in
 * four different places, and the day this file stops matching them is the day
 * a user sees "Stripe refused it." with nothing after it.
 */

describe("messageFrom", () => {
  it("reads Stripe, which nests it under error", () => {
    expect(
      messageFrom({
        error: { message: "Invalid API Key provided: sk_test_***", type: "invalid_request_error" },
      }),
    ).toBe("Invalid API Key provided: sk_test_***");
  });

  it("reads Notion and GitHub, which put it at the top", () => {
    expect(messageFrom({ code: "unauthorized", message: "API token is invalid." })).toBe(
      "API token is invalid.",
    );
    expect(messageFrom({ message: "Bad credentials", status: "401" })).toBe(
      "Bad credentials",
    );
  });

  it("reads PostHog, which calls it detail", () => {
    expect(
      messageFrom({
        type: "authentication_error",
        detail: "Personal API key found in request Authorization header is invalid.",
      }),
    ).toBe("Personal API key found in request Authorization header is invalid.");
  });

  it("reads Plausible, where error is a bare string", () => {
    expect(messageFrom({ error: "Invalid API key or site ID" })).toBe(
      "Invalid API key or site ID",
    );
  });

  it("takes a plain string body, which is what an HTML error page gives", () => {
    expect(messageFrom("Service Unavailable")).toBe("Service Unavailable");
  });

  it("returns null when there is nothing to say", () => {
    expect(messageFrom(null)).toBeNull();
    expect(messageFrom("   ")).toBeNull();
    expect(messageFrom({ error: { type: "invalid_request_error" } })).toBeNull();
    expect(messageFrom({ message: "" })).toBeNull();
  });

  it("caps a message that arrives as an essay", () => {
    expect(messageFrom({ message: "x".repeat(500) })).toHaveLength(300);
  });
});

describe("credentialError", () => {
  /**
   * The status code cannot tell a mistyped key from a key missing a scope:
   * Stripe, Notion and Plausible answer 401 and PostHog answers 403 for the
   * same mistake. So the API's own sentence leads and ours only frames it.
   */
  it("leads with their sentence on both refusal codes", () => {
    expect(credentialError("PostHog", 403, "Personal API key is invalid.")).toBe(
      "PostHog refused that key. Personal API key is invalid.",
    );
    expect(credentialError("Stripe", 401, "Invalid API Key provided.")).toBe(
      "Stripe refused that key. Invalid API Key provided.",
    );
  });

  it("says something useful when they say nothing", () => {
    expect(credentialError("Notion", 401, "")).toBe(
      "Notion refused that key. Check you pasted all of it.",
    );
  });

  it("separates a wrong address from a wrong key", () => {
    expect(credentialError("Plausible", 404, "Site could not be found.")).toBe(
      "Plausible has nothing at that address. Site could not be found.",
    );
  });

  it("tells a rate limit to wait rather than blaming the key", () => {
    expect(credentialError("GitHub", 429, "whatever they said")).toBe(
      "GitHub is rate limiting us. Try again in a few minutes.",
    );
  });
});
