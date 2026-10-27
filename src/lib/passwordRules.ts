// "Letter" means an actual letter (Latin or Arabic), never a digit or symbol:
// the Arabic Unicode block 0600-06FF also contains Arabic-Indic digits
// (0660-0669), so the letter range is restricted to 0621-064A.
export const passwordRules = [
  { id: "length", label: "8 أحرف على الأقل", test: (p: string) => p.length >= 8 },
  { id: "letter", label: "حرف واحد على الأقل", test: (p: string) => /[A-Za-zء-ي]/.test(p) },
  { id: "number", label: "رقم واحد على الأقل", test: (p: string) => /[0-9٠-٩]/.test(p) },
  { id: "symbol", label: "رمز خاص واحد على الأقل (!@#...)", test: (p: string) => /[^A-Za-z0-9ء-ي٠-٩\s]/.test(p) },
];

export const isPasswordValid = (p: string) => passwordRules.every((r) => r.test(p));
