import { describe, expect, it } from "vitest";
import { arabicCityName, preferredCityName, arabicCityLabel, hasLocationCoordinates } from "./cityNames";
describe("GPS city display", () => {
  it("translates cached and newly detected Cairo to القاهرة", () => {
    expect(arabicCityName("Cairo")).toBe("القاهرة");
    expect(arabicCityName(" cairo ")).toBe("القاهرة");
  });
  it("keeps an unknown saved city intact instead of inventing an Arabic city", () => {
    expect(arabicCityName("Cairo Heights")).toBe("Cairo Heights");
    expect(arabicCityLabel("Cairo Heights")).toBe("موقعك الحالي");
    expect(arabicCityLabel("Cairo")).toBe("القاهرة");
  });
  it("accepts real zero coordinates and rejects missing or invalid ones", () => {
    expect(hasLocationCoordinates(0, 31.2357)).toBe(true);
    expect(hasLocationCoordinates(30.0444, 0)).toBe(true);
    expect(hasLocationCoordinates(null, 31.2357)).toBe(false);
    expect(hasLocationCoordinates(Infinity, 0)).toBe(false);
  });
  it("prefers a local Arabic result and never invents unknown cities", () => {
    expect(preferredCityName(["Unknown city", "مدينة عربية"])).toBe("مدينة عربية");
    expect(arabicCityName("Cairo Heights")).toBe("Cairo Heights");
  });
});