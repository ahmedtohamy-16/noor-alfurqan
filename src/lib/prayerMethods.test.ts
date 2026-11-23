import { describe, it, expect } from "vitest";
import { recommendedPrayerMethod } from "./prayerMethods";

describe("recommendedPrayerMethod", () => {
  it("uses the Egyptian General Authority of Survey for Egypt", () => {
    expect(recommendedPrayerMethod("EG")).toBe(5);
  });
  it("uses Umm al-Qura for Saudi Arabia", () => {
    expect(recommendedPrayerMethod("SA")).toBe(4);
  });
});
