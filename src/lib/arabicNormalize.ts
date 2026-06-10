// Arabic text normalization for diacritic-insensitive search
// Strips tashkeel and unifies hamza/alef/yaa/taa-marbuta forms.

const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;
const TATWEEL = /\u0640/g;

export const normalizeArabic = (input: string): string => {
  if (!input) return "";
  return input
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(/[إأآٱا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

export const tokenize = (input: string): string[] => {
  const n = normalizeArabic(input);
  if (!n) return [];
  return n.split(/[^\u0621-\u064Aa-z0-9]+/).filter((t) => t.length > 1);
};
