import { describe, expect, it } from "vitest";
import { arabicCityName, preferredCityName } from "./cityNames";
describe("GPS city display", () => {
  it("translates cached and newly detected Cairo to القاهرة", () => {
    expect(arabicCityName("Cairo")).toBe("القاهرة");
    expect(arabicCityName(" cairo ")).toBe("القاهرة");
  });
  it("prefers a local Arabic result and never invents unknown cities", () => {
    expect(preferredCityName(["Unknown city", "مدينة عربية"])).toBe("مدينة عربية");
    expect(arabicCityName("Cairo Heights")).toBe("Cairo Heights");
  });
});