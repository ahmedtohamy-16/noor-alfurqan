import { describe, expect, it } from "vitest";
import { isStationaryTap } from "./tapGesture";

describe("ayah tap versus scroll", () => {
  it("accepts a stationary press with slight finger movement", () => {
    expect(isStationaryTap({ x: 100, y: 200 }, { x: 103, y: 204 })).toBe(true);
  });
  it("rejects upward page swipes", () => {
    expect(isStationaryTap({ x: 100, y: 200 }, { x: 100, y: 140 })).toBe(false);
  });
  it("rejects horizontal swipes", () => {
    expect(isStationaryTap({ x: 100, y: 200 }, { x: 145, y: 200 })).toBe(false);
  });
});