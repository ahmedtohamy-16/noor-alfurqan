import { describe, it, expect } from "vitest";
import { getResendState } from "./otpResendRules";
const H = 3600_000;
describe("otp resend rules", () => {
  it("blocks resend for 60 seconds after a send", () => {
    expect(getResendState([0], 30_000)).toMatchObject({ canResend: false, cooldownSeconds: 30 });
    expect(getResendState([0], 60_000).canResend).toBe(true);
  });
  it("locks after 5 sends within 6 hours", () => {
    const a = [0, 1, 2, 3, 4].map((i) => i * 120_000);
    expect(getResendState(a, 10 * 60_000)).toMatchObject({ locked: true, canResend: false });
  });
  it("unlocks once the 6 hour window passes", () => {
    const a = [0, 1, 2, 3, 4].map((i) => i * 1000);
    expect(getResendState(a, 6 * H + 5000).canResend).toBe(true);
  });
});
