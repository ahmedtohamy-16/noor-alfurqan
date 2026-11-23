import { describe, expect, it } from "vitest";
import { parseQuranReference, validQuranReference } from "./quranReferenceRules";
describe("shared Quran reference navigation", () => {
  it("accepts Ayat Al-Kursi in Eastern or Western digits without changing its numeric identity", () => {
    expect(parseQuranReference("٢:٢٥٥")).toEqual({ surah: 2, ayah: 255 });
    expect(validQuranReference(parseQuranReference("2:255"))).toBe(true);
  });
  it("rejects nonexistent surahs and verses, including Baqarah 287", () => {
    expect(validQuranReference(parseQuranReference("115:1"))).toBe(false);
    expect(validQuranReference(parseQuranReference("2:287"))).toBe(false);
    expect(validQuranReference(parseQuranReference("1:0"))).toBe(false);
    expect(parseQuranReference("2:255junk")).toBeNull();
  });
});