import { describe, expect, it } from "vitest";
import data from "@/data/adhkar.json";
import { searchAzkar, sectionIconKey, sectionInFilter, sectionProgress, type AzkarSection } from "./azkarRules";

const sections = data as AzkarSection[];

describe("azkar sections", () => {
  it("filters are real: each returns sections, favorites only the starred ones", () => {
    for (const f of ["morning", "sleep", "prayer"] as const)
      expect(sections.filter((s) => sectionInFilter(s, f, [])).length).toBeGreaterThan(0);
    expect(sections.filter((s) => sectionInFilter(s, "fav", [2])).map((s) => s.id)).toEqual([2]);
    expect(sections.filter((s) => sectionInFilter(s, "all", [])).length).toBe(132);
  });
  it("search finds dhikr text ignoring diacritics, grouped by section", () => {
    const res = searchAzkar(sections, "سبحان الله");
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((g) => g.nameMatch || g.matches.length > 0)).toBe(true);
    expect(searchAzkar(sections, "")).toEqual([]);
  });
  it("sections get distinct icons", () => {
    expect(sectionIconKey("أذكار الصباح والمساء")).toBe("sun");
    expect(sectionIconKey("أذكار النوم")).toBe("bed");
    expect(sectionIconKey("دعاء دخول المسجد")).toBe("mosque");
    expect(sectionIconKey("الذكر عند دخول المنزل")).toBe("home");
  });
  it("progress caps each dhikr at its count", () => {
    const s = sections[1];
    const d = s.array[0];
    expect(sectionProgress(s, { [`${s.id}_${d.id}`]: d.count + 50 }).done).toBe(d.count);
  });
});
