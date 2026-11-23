import { describe, expect, it } from "vitest";
import { arabicDigits, westernDigits, greetingForHour, greetingForTime } from "./displayFormat";

describe("Arabic display with numeric navigation", () => {
  it("formats all ten digits without changing time or timezone separators", () => {
    expect(arabicDigits("0123456789 GMT+2 80% 04:42")).toBe("٠١٢٣٤٥٦٧٨٩ GMT+٢ ٨٠% ٠٤:٤٢");
  });
  it("accepts an Arabic mushaf page number for internal navigation", () => {
    expect(Number(westernDigits("٦٠٤"))).toBe(604);
  });
});

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
