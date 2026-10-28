// Shared username policy: English letters, digits and underscore only, starting
// with a letter. The backend compares through public.normalize_username
// (lowercase + trim), which this stays compatible with.
export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

const USERNAME_CHARS = /^[a-zA-Z0-9_]+$/;

export interface UsernameValidation {
  valid: boolean;
  reason?: string;
}

export const validateUsername = (raw: string): UsernameValidation => {
  const name = raw.trim();
  if (name.length < USERNAME_MIN)
    return { valid: false, reason: `اسم المستخدم يجب أن يكون ${USERNAME_MIN} أحرف على الأقل` };
  if (name.length > USERNAME_MAX)
    return { valid: false, reason: `اسم المستخدم يجب ألا يتجاوز ${USERNAME_MAX} حرفًا` };
  if (!USERNAME_CHARS.test(name))
    return { valid: false, reason: "المسموح: حروف إنجليزية وأرقام وشرطة سفلية (_) فقط، بدون مسافات" };
  if (!/^[a-zA-Z]/.test(name))
    return { valid: false, reason: "اسم المستخدم يجب أن يبدأ بحرف إنجليزي" };
  return { valid: true };
};

// Candidate alternatives for a taken name; availability is checked by the caller.
export const usernameCandidates = (raw: string): string[] => {
  const base = raw.trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24) || "user";
  const year = new Date().getFullYear();
  const rnd = () => Math.floor(10 + Math.random() * 990);
  return Array.from(new Set([`${base}${rnd()}`, `${base}_${year}`, `${base}_${rnd()}`, `the_${base}`, `${base}${rnd()}`]))
    .filter((n) => validateUsername(n).valid);
};
