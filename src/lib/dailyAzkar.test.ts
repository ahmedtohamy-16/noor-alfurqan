import { describe, expect, it } from "vitest";
import data from "@/data/adhkar.json";
import { separateDailyAzkar, EVENING_SECTION_ID } from "./dailyAzkar";
import { sectionProgress, sectionInFilter } from "./azkarRules";

const sections = separateDailyAzkar(data);
const morning = sections.find(s => s.id === 1);
const evening = sections.find(s => s.id === EVENING_SECTION_ID);

describe("separate morning and evening azkar", () => {
  it("creates two separate sections without reusing sleep's id", () => {
    expect(morning?.category).toBe("أذكار الصباح");
    expect(evening?.category).toBe("أذكار المساء");
    expect(sections.find(s => s.id === 2)?.category).toBe("أذكار النوم");
    expect(new Set(sections.map(s => s.id)).size).toBe(133);
  });
  it("keeps morning progress separate from evening progress", () => {
    if (!morning || !evening) throw new Error("Missing daily sections");
    expect(sectionProgress(morning, { "1_1": 1 }).done).toBe(1);
    expect(sectionProgress(evening, { "1_1": 1 }).done).toBe(0);
  });
  it("uses only the evening variants documented by the source", () => {
    expect(evening?.array.find(d => d.id === 3)?.text).toContain("أَمْسَيْنَا وَأَمْسَى");
    expect(evening?.array.find(d => d.id === 4)?.text).toContain("وإليك المصير");
    expect(evening?.array.find(d => d.id === 6)?.audio).toBe("");
    expect(evening?.array.some(d => [19,20,21].includes(d.id))).toBe(false);
    expect(morning?.array.some(d => d.id === 23)).toBe(false);
  });
  it("filters each daily section independently", () => {
    expect(sections.filter(s => sectionInFilter(s, "morning", [])).map(s => s.id)).toEqual([1]);
    expect(sections.filter(s => sectionInFilter(s, "evening", [])).map(s => s.id)).toEqual([133]);
  });
});