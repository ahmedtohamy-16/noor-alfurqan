// Topic taxonomy → Arabic keywords used to filter hadiths by topic.
// Matching is done on the normalized hadith text (no diacritics, unified alef/yaa/taa-marbuta).
// Keywords are stored in normalized form so we can match without re-normalizing per row.

import { normalizeArabic } from "@/lib/arabicNormalize";

export interface HadithTopic {
  id: string;
  label: string;
  keywords: string[]; // normalized
  emoji?: string;
}

const T = (raw: string[]): string[] => raw.map(normalizeArabic);

export const HADITH_TOPICS: HadithTopic[] = [
  { id: "iman",     label: "الإيمان", emoji: "☪️",
    keywords: T(["إيمان", "آمن", "يؤمن", "تصديق", "الإسلام", "اسلام"]) },
  { id: "salah",    label: "الصلاة", emoji: "🕌",
    keywords: T(["صلاة", "صلى", "ركع", "سجد", "وضوء", "أذان", "جماعة"]) },
  { id: "zakat",    label: "الزكاة", emoji: "💰",
    keywords: T(["زكاة", "صدقة", "أنفق", "إنفاق", "تصدق"]) },
  { id: "siyam",    label: "الصيام", emoji: "🌙",
    keywords: T(["صوم", "صام", "أفطر", "رمضان", "صائم"]) },
  { id: "hajj",     label: "الحج", emoji: "🕋",
    keywords: T(["حج", "عمرة", "طواف", "كعبة", "إحرام", "عرفة"]) },
  { id: "akhlaq",   label: "الأخلاق", emoji: "🤝",
    keywords: T(["خلق", "صدق", "أمانة", "حياء", "تواضع", "حلم", "صبر"]) },
  { id: "athkar",   label: "الأذكار", emoji: "📿",
    keywords: T(["ذكر", "سبحان", "حمد", "لا إله إلا الله", "تسبيح", "استغفار"]) },
  { id: "dua",      label: "الدعاء", emoji: "🤲",
    keywords: T(["دعاء", "اللهم", "ادع", "يدعو"]) },
  { id: "quran",    label: "القرآن", emoji: "📖",
    keywords: T(["قرآن", "تلاوة", "آية", "سورة", "حفظ"]) },
  { id: "family",   label: "الأسرة", emoji: "👨‍👩‍👧",
    keywords: T(["والد", "أم", "أب", "ابن", "أهل", "زوج", "زوجة", "رحم"]) },
  { id: "jihad",    label: "الجهاد", emoji: "🛡️",
    keywords: T(["جهاد", "شهيد", "غزوة", "سبيل الله"]) },
  { id: "ilm",      label: "العلم", emoji: "📚",
    keywords: T(["علم", "تعلم", "عالم", "فقه", "تفقه"]) },
  { id: "muamala",  label: "المعاملات", emoji: "🤲",
    keywords: T(["بيع", "شراء", "ربا", "تجارة", "كسب", "مال"]) },
  { id: "manners",  label: "الآداب", emoji: "✨",
    keywords: T(["آداب", "سلام", "ضيف", "طعام", "شراب", "نوم"]) },
];

export const getTopicById = (id: string) =>
  HADITH_TOPICS.find((t) => t.id === id);
