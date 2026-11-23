import { describe, expect, it } from "vitest";
import { safeHadithSnapshot, preserveSavedHadiths, hasVerifiedHadithContent } from "./hadithContent";
type SavedRecord = { bookId: string; hadithNumber: number; text: string; narrator?: string; contentVersion?: number; savedAt: string };
describe("legacy saved hadiths", () => {
  it("preserves Bukhari 2 identity but never displays its old commentary as text", () => {
    const saved = safeHadithSnapshot({ bookId: "bukhari", hadithNumber: 2, text: "شرح الإسماعيلي", narrator: "شرح الكرماني" });
    expect(saved.bookId).toBe("bukhari");
    expect(saved.hadithNumber).toBe(2);
    expect(saved.text).toBe("");
    expect(saved.narrator).toBeUndefined();
  });
  it("adding a bookmark leaves the saved Bukhari 2 record exactly unchanged", () => {
    const original = { bookId: "bukhari", hadithNumber: 2, text: "old snapshot", narrator: "old field", savedAt: "2026-11-20" };
    const display = { ...original, text: "resolved display", narrator: undefined, contentVersion: 2 };
    const added = { bookId: "bukhari", hadithNumber: 1, text: "verified", savedAt: "2026-11-23", contentVersion: 2 };
    const result = preserveSavedHadiths<SavedRecord>([added, display], [original]);
    expect(result[1]).toBe(original);
    expect(result[0]).toBe(added);
  });
  it("removing one bookmark cannot save a blank refresh over another original", () => {
    const original = { bookId: "bukhari", hadithNumber: 2, text: "stored snapshot", savedAt: "2026-11-20" };
    expect(preserveSavedHadiths([safeHadithSnapshot(original)], [original])[0]).toEqual(original);
  });
  it("daily and pinned caches reject old content and falsely promoted narrator fields", () => {
    expect(hasVerifiedHadithContent({ text: "old cache" })).toBe(false);
    expect(hasVerifiedHadithContent({ text: "old cache", contentVersion: 2, narrator: "old commentary field" })).toBe(false);
    expect(hasVerifiedHadithContent({ text: "source text", contentVersion: 2 })).toBe(true);
  });
});