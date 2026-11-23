import { describe, expect, it } from "vitest";
import { greetingForHour, greetingForTime } from "./displayFormat";

describe("time-aware greeting", () => {
  it("does not give a morning greeting at 2am", () => {
    expect(greetingForHour(2)).toBe("ليلة هانئة");
  });
  it("says good morning only after Fajr (Cairo 4:56)", () => {
    const fajr = 4 * 60 + 56;
    expect(greetingForTime(new Date(2026, 10, 23, 4, 30), fajr)).toBe("ليلة هانئة");
    expect(greetingForTime(new Date(2026, 10, 23, 4, 56), fajr)).toBe("صباح الخير");
  });
});
