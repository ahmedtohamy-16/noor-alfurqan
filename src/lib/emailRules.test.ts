import { describe, it, expect } from "vitest";
import { validateEmail } from "./emailRules";

describe("validateEmail", () => {
  it("rejects incomplete emails", () => { expect(validateEmail("tham").valid).toBe(false); });
  it("rejects unknown providers", () => { expect(validateEmail("a@randomxyz.com").valid).toBe(false); });
  it("accepts gmail and yahoo", () => {
    expect(validateEmail("a@gmail.com").valid).toBe(true);
    expect(validateEmail("A@Yahoo.com ").valid).toBe(true);
  });
});
