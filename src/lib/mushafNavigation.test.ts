import { describe, expect, it } from "vitest";
import { pageForJuz } from "./mushafNavigation";

describe("direct juz navigation", () => {
  it("opens juz 30 at mushaf page 582", () => {
    expect(pageForJuz("30")).toBe(582);
  });
  it("rejects invalid juz numbers", () => {
    expect(pageForJuz("31")).toBeNull();
    expect(pageForJuz("0")).toBeNull();
  });
});