import { normalizeArabic } from "@/lib/arabicNormalize";

export interface AzkarDhikr { id: number; text: string; count: number; audio: string; filename: string }
export interface AzkarSection { id: number; category: string; audio: string; filename: string; array: AzkarDhikr[] }
export type AzkarFilter = "all" | "morning" | "sleep" | "prayer" | "fav";

export const AZKAR_FILTERS: { id: AzkarFilter; label: string }[] = [
  { id: "all", label: "الكل" },
  { id: "morning", label: "الصباح والمساء" },
  { id: "sleep", label: "النوم" },
  { id: "prayer", label: "بعد الصلاة والمسجد" },
  { id: "fav", label: "المفضلة" },
];

const has = (name: string, words: string[]) => {
  const n = normalizeArabic(name);
  return words.some((w) => n.includes(normalizeArabic(w)));
};

export function sectionInFilter(s: AzkarSection, f: AzkarFilter, favs: number[]): boolean {
  switch (f) {
    case "all": return true;
    case "fav": return favs.includes(s.id);
    case "morning": return has(s.category, ["الصباح", "المساء"]);
    case "sleep": return has(s.category, ["النوم", "تقلب ليلا", "الرؤيا"]);
    case "prayer": return has(s.category, ["الصلاة", "المسجد", "السلام من", "الوتر", "التشهد", "الركوع", "السجود", "السجدتين", "الاستفتاح", "الآذان", "الوضوء", "الاستخارة"]);
  }
}

/** Icon key per section — each maps to a distinct SVG icon in the UI. */
export function sectionIconKey(name: string): string {
  const rules: [string, string[]][] = [
    ["sun", ["الصباح"]], ["bed", ["النوم", "تقلب ليلا", "الرؤيا"]], ["sunrise", ["الاستيقاظ"]],
    ["mosque", ["المسجد", "الصلاة", "التشهد", "الركوع", "السجود", "السجدتين", "الاستفتاح", "الوتر", "الاستخارة"]],
    ["megaphone", ["الآذان"]], ["droplet", ["الوضوء", "الخلاء"]], ["home", ["المنزل", "بيت"]],
    ["shirt", ["الثوب"]], ["utensils", ["الطعام", "الصائم", "إفطار", "الثمر", "الشراب"]],
    ["heartPulse", ["المريض", "وجعا", "مبتلى"]], ["flower", ["الميت", "القبر", "المحتضر", "التعزية", "مصيبة", "القبور"]],
    ["cloudRain", ["المطر", "الاستسقاء", "الاستصحاء"]], ["wind", ["الريح"]], ["zap", ["الرعد"]], ["moon", ["الهلال", "المساء"]],
    ["plane", ["السفر", "المسافر", "الركوب", "المركوب", "القرية", "مترلا"]], ["store", ["السوق"]],
    ["kaaba", ["الحج", "المحرم", "الركن", "الصفا", "عرفة", "المشعر", "الجمار"]], ["baby", ["المولود", "الأولاد"]],
    ["users", ["المتزوج", "الزوجة", "اﻟﻤﺠلس", "السلام", "أحبك", "الضيف", "أهل بيت"]], ["cloudLightning", ["الهم", "الكرب", "الفزع", "الغضب"]],
    ["shield", ["العدو", "السلطان", "الشيطان", "الدجال", "الشرك", "خاف", "وسوسة", "الوسوسة", "بعينه", "الطيرة"]],
    ["coins", ["الدين", "ماله", "أقرض"]], ["refresh", ["الاستغفار", "أذنب"]], ["sparkles", ["التسبيح", "يسبح", "التكبير"]],
    ["handHeart", ["معروفا", "بارك", "غفر"]],
  ];
  for (const [key, words] of rules) if (has(name, words)) return key;
  return "handsPraying";
}

export interface AzkarSearchGroup { section: AzkarSection; matches: { index: number; text: string }[]; nameMatch: boolean }

/** Live search: results grouped by section, matching section names and dhikr text (diacritics ignored). */
export function searchAzkar(sections: AzkarSection[], query: string, perSection = 3): AzkarSearchGroup[] {
  const q = normalizeArabic(query.trim());
  if (!q) return [];
  const out: AzkarSearchGroup[] = [];
  for (const section of sections) {
    const nameMatch = normalizeArabic(section.category).includes(q);
    const matches = section.array
      .map((d, index) => ({ index, text: d.text }))
      .filter((d) => normalizeArabic(d.text).includes(q))
      .slice(0, perSection);
    if (nameMatch || matches.length) out.push({ section, matches, nameMatch });
  }
  return out;
}

export function sectionProgress(s: AzkarSection, progress: Record<string, number>) {
  let done = 0, total = 0;
  for (const d of s.array) { total += d.count; done += Math.min(d.count, progress[`${s.id}_${d.id}`] || 0); }
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
