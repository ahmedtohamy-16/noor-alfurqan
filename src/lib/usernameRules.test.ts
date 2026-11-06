import { describe, it, expect } from "vitest";
import { validateUsername, usernameCandidates, sanitizeUsernameInput, friendlyUsernameError } from "./usernameRules";

describe("validateUsername", () => {
  it("accepts lowercase letters, digits and underscore", () => {
    expect(validateUsername("ahmed_2026").valid).toBe(true);
    expect(validateUsername("1ahmed").valid).toBe(true);
  });
  it("rejects uppercase letters", () => {
    expect(validateUsername("Ahmed").valid).toBe(false);
  });
  it("rejects Arabic, spaces and symbols", () => {
    expect(validateUsername("أحمد").valid).toBe(false);
    expect(validateUsername("ahmed ali").valid).toBe(false);
    expect(validateUsername("ahmed@home").valid).toBe(false);
  });
  it("enforces length 3-20", () => {
    expect(validateUsername("ab").valid).toBe(false);
    expect(validateUsername("a".repeat(20)).valid).toBe(true);
    expect(validateUsername("a".repeat(21)).valid).toBe(false);
  });
  it("rejects reserved names", () => {
    for (const n of ["admin", "support", "root", "api", "settings", "login", "signup", "profile", "null", "undefined"]) {
      expect(validateUsername(n).valid).toBe(false);
    }
  });
  it("sanitizes typing to lowercase allowed chars", () => {
    expect(sanitizeUsernameInput("Ahmed Ali!")).toBe("ahmedali");
  });
  it("maps a duplicate error to a friendly message", () => {
    expect(friendlyUsernameError({ code: "23505" })).toBe("اسم المستخدم هذا مستخدم سابقًا، اختر اسمًا آخر");
  });
  it("suggests only valid alternatives", () => {
    const c = usernameCandidates("ahmed");
    expect(c.length).toBeGreaterThan(0);
    c.forEach((n) => expect(validateUsername(n).valid).toBe(true));
  });
});
