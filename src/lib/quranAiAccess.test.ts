import { describe, expect, it } from "vitest";
import { hasPaidAccess } from "../../supabase/functions/quran-topic-suggestions/access";
describe("Paid Quran AI access", () => {
  it("denies free users", () => expect(hasPaidAccess(null)).toBe(false));
  it("denies trials", () => expect(hasPaidAccess({ status: "active", source: "trial", expires_at: null })).toBe(false));
  it("allows active paid subscription", () => expect(hasPaidAccess({ status: "active", source: "subscription", expires_at: null })).toBe(true));
  it("denies expired subscriptions", () => expect(hasPaidAccess({ status: "active", source: "subscription", expires_at: "2026-01-01" }, Date.parse("2026-10-19"))).toBe(false));
});