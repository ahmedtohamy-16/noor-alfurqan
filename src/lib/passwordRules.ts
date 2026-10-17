export const passwordRules = [
  { id: "length", label: "8 أحرف على الأقل", test: (p: string) => p.length >= 8 },
  { id: "letter", label: "حرف واحد على الأقل", test: (p: string) => /[A-Za-z\u0600-\u06FF]/.test(p) },
  { id: "number", label: "رقم واحد على الأقل", test: (p: string) => /[0-9\u0660-\u0669]/.test(p) },
  { id: "symbol", label: "رمز واحد على الأقل (!@#...)", test: (p: string) => /[^A-Za-z0-9\u0600-\u06FF\s]/.test(p) },
];

export const isPasswordValid = (p: string) => passwordRules.every((r) => r.test(p));
