// Shared username policy for signup, availability checks and login.
// The backend normalizes usernames (lowercase, trim, collapse spaces, strip
// Arabic diacritics, unify alef/ya variants) in public.normalize_username
// before comparing, so the rules here must stay in sync with it.

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

// Arabic letters (0621-064A), Latin letters, Latin and Arabic-Indic digits,
// underscore and single spaces.
const USERNAME_CHARS = /^[ء-يa-zA-Z0-9٠-٩_ ]+$/;

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
    return { valid: false, reason: "المسموح: حروف عربية أو إنجليزية وأرقام وشرطة سفلية (_) فقط" };
  if (/  /.test(name))
    return { valid: false, reason: "لا يمكن استخدام مسافتين متتاليتين" };
  if (/^[0-9٠-٩_]/.test(name))
    return { valid: false, reason: "اسم المستخدم يجب أن يبدأ بحرف" };
  return { valid: true };
};
