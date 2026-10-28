import { describe, it, expect } from "vitest";
import { passwordRules, isPasswordValid } from "./passwordRules";

const rule = (id: string) => passwordRules.find((r) => r.id === id)!;

describe("passwordRules", () => {
  it("requires at least 8 characters", () => {
    expect(rule("length").test("Ab1!xyz")).toBe(false);
    expect(rule("length").test("Ab1!xyzw")).toBe(true);
  });
  it("requires an English letter", () => {
    expect(rule("letter").test("1234!@#$")).toBe(false);
    expect(rule("letter").test("1234!@#a")).toBe(true);
  });
  it("requires a digit and a symbol", () => {
    expect(rule("number").test("Abcdef!g")).toBe(false);
    expect(rule("symbol").test("Abcdef12")).toBe(false);
  });
  it("rejects any Arabic character", () => {
    expect(rule("noArabic").test("Noor@2026أ")).toBe(false);
    expect(isPasswordValid("Noor@2026أ")).toBe(false);
    expect(isPasswordValid("Noor@٢٠٢٦a")).toBe(false);
  });
  it("accepts a compliant English password", () => {
    expect(isPasswordValid("Noor@2026")).toBe(true);
  });
});
