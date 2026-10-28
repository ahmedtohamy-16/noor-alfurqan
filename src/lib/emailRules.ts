// Sign-up email must be well-formed and belong to a known mail provider.
export const ALLOWED_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "ymail.com",
  "outlook.com", "hotmail.com", "live.com", "msn.com", "icloud.com", "me.com",
  "mac.com", "aol.com", "proton.me", "protonmail.com", "zoho.com", "yandex.com",
  "gmx.com", "mail.com",
];

const FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type EmailCheck = { valid: boolean; reason?: string };

export function validateEmail(raw: string): EmailCheck {
  const email = raw.trim().toLowerCase();
  if (!FORMAT.test(email)) return { valid: false, reason: "أدخل بريدًا إلكترونيًا صحيحًا مثل name@gmail.com" };
  const domain = email.split("@")[1];
  if (!ALLOWED_EMAIL_DOMAINS.includes(domain))
    return { valid: false, reason: "استخدم بريدًا من مزود معروف مثل Gmail أو Yahoo أو Outlook" };
  return { valid: true };
}
