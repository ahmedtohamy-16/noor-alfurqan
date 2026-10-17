import { describe, it, expect } from "vitest";
import { isPasswordValid } from "./passwordRules";

describe("password rules", () => {
  it("rejects missing number", () => expect(isPasswordValid("abcdefg!")).toBe(false));
  it("rejects missing symbol", () => expect(isPasswordValid("abcdefg1")).toBe(false));
  it("rejects missing letter", () => expect(isPasswordValid("1234567!")).toBe(false));
  it("rejects shorter than 8", () => expect(isPasswordValid("ab1!")).toBe(false));
  it("accepts letters+numbers+symbols", () => expect(isPasswordValid("noor2026!")).toBe(true));
});
