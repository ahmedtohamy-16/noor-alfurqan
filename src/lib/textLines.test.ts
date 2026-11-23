import { describe, expect, it } from "vitest";
import { fullTextLines } from "./textLines";
describe("complete hadith exports", () => {
  it("keeps all words even when the hadith spans more than twelve lines", () => {
    const words = Array.from({ length: 180 }, (_, index) => `كلمة${index}`);
    const lines = fullTextLines(words.join(" "), 20, value => value.length);
    expect(lines.length).toBeGreaterThan(12);
    expect(lines.join(" ").split(/\s+/)).toEqual(words);
  });
});