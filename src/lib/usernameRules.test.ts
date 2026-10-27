import { describe, it, expect } from "vitest";
import { validateUsername } from "./usernameRules";

describe("validateUsername", () => {
  it("accepts Arabic usernames", () => {
    expect(validateUsername("أحمد محمد").valid).toBe(true);
  });

  it("accepts Latin usernames with digits and underscore", () => {
    expect(validateUsername("ahmed_2026").valid).toBe(true);
  });

  it("accepts Arabic-Indic digits inside the name", () => {
    expect(validateUsername("زائر النور ٩٩").valid).toBe(true);
  });

  it("rejects names shorter than 3 characters", () => {
    const r = validateUsername("ab");
    expect(r.valid).toBe(false);
    expect(r.reason).toContain("3");
  });

  it("rejects names longer than 30 characters", () => {
    expect(validateUsername("a".repeat(31)).valid).toBe(false);
  });

  it("rejects unsupported symbols", () => {
    const r = validateUsername("ahmed@home");
    expect(r.valid).toBe(false);
    expect(r.reason).toContain("المسموح");
  });

  it("rejects double spaces", () => {
    expect(validateUsername("ahmed  ali").valid).toBe(false);
  });

  it("rejects names starting with a digit or underscore", () => {
    expect(validateUsername("1ahmed").valid).toBe(false);
    expect(validateUsername("_ahmed").valid).toBe(false);
  });
});
