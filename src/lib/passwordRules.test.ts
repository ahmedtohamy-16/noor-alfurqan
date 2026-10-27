import { describe, it, expect } from "vitest";
import { passwordRules, isPasswordValid } from "./passwordRules";

const rule = (id: string) => passwordRules.find((r) => r.id === id)!;

describe("passwordRules", () => {
  it("requires at least 8 characters", () => {
    expect(rule("length").test("Ab1!xyz")).toBe(false);
    expect(rule("length").test("Ab1!xyzw")).toBe(true);
  });

  it("requires a real letter, not only digits or symbols", () => {
    expect(rule("letter").test("1234!@#$")).toBe(false);
    expect(rule("letter").test("1234!@#a")).toBe(true);
    expect(rule("letter").test("1234!@#أ")).toBe(true);
  });

  it("does not count Arabic-Indic digits as letters", () => {
    expect(rule("letter").test("١٢٣٤٥٦٧٨")).toBe(false);
    expect(rule("number").test("١٢٣٤٥٦٧٨")).toBe(true);
  });

  it("requires a digit", () => {
    expect(rule("number").test("Abcdef!g")).toBe(false);
    expect(rule("number").test("Abcdef!1")).toBe(true);
  });

  it("requires a special symbol", () => {
    expect(rule("symbol").test("Abcdef12")).toBe(false);
    expect(rule("symbol").test("Abcdef1!")).toBe(true);
  });

  it("validates a fully compliant password", () => {
    expect(isPasswordValid("Noor@2026")).toBe(true);
    expect(isPasswordValid("نورالفرقان١٢٣!")).toBe(true);
    expect(isPasswordValid("short1!")).toBe(false);
  });
});
