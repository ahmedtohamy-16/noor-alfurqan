// Password policy: English letters, digits and symbols only — Arabic characters
// (including Arabic-Indic digits) are rejected outright. The Arabic check is
// internal (not shown in the visible checklist).
export const hasArabic = (p: string) => /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(p);

export const passwordRules = [
  { id: "length", label: "8 أحرف على الأقل", test: (p: string) => p.length >= 8 },
  { id: "letter", label: "حرف واحد على الأقل", test: (p: string) => /[A-Za-z]/.test(p) },
  { id: "number", label: "رقم واحد على الأقل", test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol", label: "رمز خاص واحد على الأقل", test: (p: string) => /[^A-Za-z0-9\s\u0600-\u06FF]/.test(p) },
];

export const isPasswordValid = (p: string) => !hasArabic(p) && passwordRules.every((r) => r.test(p));
