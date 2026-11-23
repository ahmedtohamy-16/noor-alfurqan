import { describe, expect, it } from "vitest";
import { greetingForHour } from "./displayFormat";

describe("time-aware greeting", () => {
  it("does not give a morning greeting at 2am", () => {
    expect(greetingForHour(2)).toBe("ليلة هانئة");
  });
});