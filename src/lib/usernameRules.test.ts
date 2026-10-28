import { describe, it, expect } from "vitest";
import { validateUsername, usernameCandidates } from "./usernameRules";

describe("validateUsername", () => {
  it("accepts English usernames with digits and underscore", () => {
    expect(validateUsername("ahmed_2026").valid).toBe(true);
  });
  it("rejects Arabic usernames", () => {
    expect(validateUsername("أحمد").valid).toBe(false);
    expect(validateUsername("ahmed٩٩").valid).toBe(false);
  });
  it("rejects spaces and symbols", () => {
    expect(validateUsername("ahmed ali").valid).toBe(false);
    expect(validateUsername("ahmed@home").valid).toBe(false);
  });
  it("enforces length 3-30", () => {
    expect(validateUsername("ab").valid).toBe(false);
    expect(validateUsername("a".repeat(31)).valid).toBe(false);
  });
  it("must start with a letter", () => {
    expect(validateUsername("1ahmed").valid).toBe(false);
    expect(validateUsername("_ahmed").valid).toBe(false);
  });
  it("suggests only valid alternatives", () => {
    const c = usernameCandidates("ahmed");
    expect(c.length).toBeGreaterThan(0);
    c.forEach((n) => expect(validateUsername(n).valid).toBe(true));
  });
});
