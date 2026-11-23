export const RESEND_COOLDOWN_MS = 60_000;
export const RESEND_MAX_ATTEMPTS = 5;
export const RESEND_WINDOW_MS = 6 * 60 * 60 * 1000;
const KEY = "nf_otp_resend_attempts";

export type ResendState = { canResend: boolean; cooldownSeconds: number; locked: boolean; remaining: number };

/** attempts = timestamps (ms) of sends from this device, including the initial sign-up send. */
export function getResendState(attempts: number[], now: number): ResendState {
  const recent = attempts.filter((t) => now - t < RESEND_WINDOW_MS);
  const locked = recent.length >= RESEND_MAX_ATTEMPTS;
  const last = recent.length ? Math.max(...recent) : 0;
  const cooldownSeconds = recent.length ? Math.max(0, Math.ceil((last + RESEND_COOLDOWN_MS - now) / 1000)) : 0;
  return { canResend: !locked && cooldownSeconds === 0, cooldownSeconds, locked, remaining: Math.max(0, RESEND_MAX_ATTEMPTS - recent.length) };
}

export function loadAttempts(): number[] {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(v) ? v.filter((n) => typeof n === "number") : []; } catch { return []; }
}
export function recordAttempt(now = Date.now()): number[] {
  const list = [...loadAttempts().filter((t) => now - t < RESEND_WINDOW_MS), now];
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
