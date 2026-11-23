import { describe, it, expect } from "vitest";
import { shouldFireWirdReminder } from "./wirdReminderRules";
const at = (h: number, m: number) => new Date(2026, 10, 23, h, m);
const base = { enabled: true, permission: "granted", time: "06:00:00", lastFiredDate: null };
describe("wird reminder", () => {
  it("fires at the chosen time", () => expect(shouldFireWirdReminder({ ...base, now: at(6, 0) })).toBe(true));
  it("does not fire before the time", () => expect(shouldFireWirdReminder({ ...base, now: at(5, 59) })).toBe(false));
  it("fires once per day", () => expect(shouldFireWirdReminder({ ...base, now: at(6, 5), lastFiredDate: "2026-11-23" })).toBe(false));
  it("does not fire when switched off", () => expect(shouldFireWirdReminder({ ...base, enabled: false, now: at(6, 0) })).toBe(false));
  it("does not fire without permission", () => expect(shouldFireWirdReminder({ ...base, permission: "denied", now: at(6, 0) })).toBe(false));
});
