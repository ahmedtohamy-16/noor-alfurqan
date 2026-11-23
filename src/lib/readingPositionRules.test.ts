import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { QuranAyah } from "@/data/quranAyats";
import { readingAyahIndex } from "./readingPositionRules";

const corpus: QuranAyah[] = JSON.parse(readFileSync("public/data/quranAyats.json", "utf8"));
const baqarah = corpus.filter(ayah => ayah.sura_id === 2);

describe("visible ayah Mushaf page", () => {
  it("starts Al-Fatiha on page 1 and Al-Baqarah on page 2", () => {
    expect(corpus.find(ayah => ayah.sura_id === 1)?.page_number).toBe(1);
    const index = readingAyahIndex([{ index: 0, top: 180, bottom: 230 }], 120);
    expect(baqarah[index].page_number).toBe(2);
  });

  it("changes from page 2 to page 3 at Al-Baqarah ayah 6", () => {
    const index = readingAyahIndex([
      { index: 4, top: 30, bottom: 110 },
      { index: 5, top: 110, bottom: 240 },
    ], 120);
    expect(baqarah[index].ayat_number_in_sura).toBe(6);
    expect(baqarah[index].page_number).toBe(3);
  });

  it("returns to page 2 when scrolling back", () => {
    const index = readingAyahIndex([
      { index: 4, top: 100, bottom: 190 },
      { index: 5, top: 190, bottom: 320 },
    ], 120);
    expect(baqarah[index].page_number).toBe(2);
  });

  it("keeps a long ayah's page until its last line passes", () => {
    expect(readingAyahIndex([
      { index: 5, top: -450, bottom: 180 },
      { index: 6, top: 180, bottom: 260 },
    ], 120)).toBe(5);
  });

  it("retains the final ayah after scrolling below the surah", () => {
    expect(readingAyahIndex([{ index: 285, top: -100, bottom: 0 }], 120)).toBe(285);
  });
});