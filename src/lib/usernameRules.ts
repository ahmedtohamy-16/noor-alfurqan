// Shared username policy — must match the database rules on public.profiles:
// 3–20 chars, lowercase a-z, digits 0-9 and underscore only, not a reserved name.
// Availability is checked server-side via the check_username_available RPC.
import { z } from "zod";

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

export const RESERVED_USERNAMES = [
  "admin", "support", "root", "api", "settings", "login",
  "signup", "profile", "u", "null", "undefined",
] as const;

export const usernameSchema = z
  .string()
  .trim()
  .min(USERNAME_MIN, `اسم المستخدم يجب أن يكون ${USERNAME_MIN} أحرف على الأقل`)
  .max(USERNAME_MAX, `اسم المستخدم يجب ألا يتجاوز ${USERNAME_MAX} حرفًا`)
  .regex(/^[a-z0-9_]+$/, "المسموح: حروف إنجليزية صغيرة (a-z) وأرقام وشرطة سفلية (_) فقط")
  .refine((n) => !(RESERVED_USERNAMES as readonly string[]).includes(n), "هذا الاسم محجوز، اختر اسمًا آخر");

export interface UsernameValidation {
  valid: boolean;
  reason?: string;
}

export const validateUsername = (raw: string): UsernameValidation => {
  const r = usernameSchema.safeParse(raw);
  return r.success ? { valid: true } : { valid: false, reason: r.error.issues[0]?.message };
};

/** Lowercases and strips characters the username rules don't allow (for live typing). */
export const sanitizeUsernameInput = (raw: string): string =>
  raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, USERNAME_MAX);

// Candidate alternatives for a taken name; availability is checked by the caller.
export const usernameCandidates = (raw: string): string[] => {
  const base = sanitizeUsernameInput(raw).slice(0, 14) || "user";
  const year = new Date().getFullYear();
  const rnd = () => Math.floor(10 + Math.random() * 990);
  return Array.from(new Set([`${base}${rnd()}`, `${base}_${year}`, `${base}_${rnd()}`, `the_${base}`, `${base}${rnd()}`]))
    .filter((n) => validateUsername(n).valid);
};

/** Maps any database error on a username save to a friendly Arabic message. */
export const friendlyUsernameError = (err: { code?: string; message?: string } | null | undefined): string => {
  if (err?.code === "23505") return "اسم المستخدم هذا مستخدم سابقًا، اختر اسمًا آخر";
  if (err?.code === "23514") return "اسم المستخدم غير صالح";
  return "تعذر حفظ اسم المستخدم، حاول مرة أخرى";
};
