import { describe, expect, it } from "vitest";
import Papa from "papaparse";
import fixture from "./fixtures/bukhari-first-two.csv?raw";
import { mapHadithRows } from "../../supabase/functions/_shared/hadithRows";

const clean = (text: string) => text.replace(/[\u064B-\u065F\u0670\u200f]/g, "").replace(/\s+/g, " ").trim();
describe("original hadith source", () => {
  const source = Papa.parse<string[]>(fixture, { skipEmptyLines: true });
  const hadiths = mapHadithRows(source.data, "bukhari");
  it("preserves the headerless first hadith", () => {
    expect(hadiths[0].hadithNumber).toBe(1);
    expect(clean(hadiths[0].text)).toContain("إنما الأعمال بالنيات");
  });
  it("Bukhari 2 contains Aisha's revelation narration, not commentary", () => {
    const second = hadiths[1];
    expect(second.hadithNumber).toBe(2);
    expect(clean(second.text)).toContain("عائشة أم المؤمنين");
    expect(clean(second.text)).toContain("مثل صلصلة الجرس");
    expect(second.text).toBe(source.data[1][1].trim());
    expect(second.elaboration).toBe(source.data[1][2].trim());
    expect(second).not.toHaveProperty("narrator");
  });
  it("preserves quoted commas, semicolons, quotes and multiline commentary", () => {
    const rows = Papa.parse<string[]>('"2","متن، صحيح","شرح; فاصلة, واقتباس ""صحيح""\nسطر ثان"', { skipEmptyLines: true }).data;
    expect(mapHadithRows(rows, "bukhari")[0].elaboration).toBe('شرح; فاصلة, واقتباس "صحيح"\nسطر ثان');
  });
  it("supports two-column collections without a fabricated explanation", () => {
    expect(mapHadithRows([["1", "النص الأصلي"]], "ahmad")[0]).toEqual({ id: 1, bookId: "ahmad", hadithNumber: 1, text: "النص الأصلي", contentVersion: 2 });
  });
});