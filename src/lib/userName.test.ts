import { describe, expect, it } from "vitest";
import { firstName } from "./userName";
describe("home greeting", () => {
  it("uses only the first part of a four-part name", () => {
    expect(firstName("  أحمد محمد علي حسن  ")).toBe("أحمد");
    expect(firstName(null)).toBe("");
  });
});