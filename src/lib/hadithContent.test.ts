import { describe, expect, it } from "vitest";
import { safeHadithSnapshot } from "./hadithContent";
describe("legacy saved hadiths", () => {
  it("preserves Bukhari 2 identity but never displays its old commentary as text", () => {
    const saved = safeHadithSnapshot({ bookId: "bukhari", hadithNumber: 2, text: "شرح الإسماعيلي", narrator: "شرح الكرماني" });
    expect(saved.bookId).toBe("bukhari");
    expect(saved.hadithNumber).toBe(2);
    expect(saved.text).toBe("");
    expect(saved.narrator).toBeUndefined();
  });
});