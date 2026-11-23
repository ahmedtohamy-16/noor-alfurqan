import { describe, it, expect } from "vitest";
import { estimateSurahMB } from "./reciterSizeEstimate";
describe("reciter size estimate", () => {
  it("differs between reciters for the same surah", () => {
    const husary = estimateSurahMB("ar.husary", "https://x/Husary_128kbps", 286);
    const sudais = estimateSurahMB("ar.sudais", "https://x/Sudais_192kbps", 286);
    expect(Math.abs(husary - sudais)).toBeGreaterThan(1);
  });
  it("grows with surah length", () => {
    expect(estimateSurahMB("ar.husary", "x_128kbps", 286)).toBeGreaterThan(estimateSurahMB("ar.husary", "x_128kbps", 7));
  });
});
