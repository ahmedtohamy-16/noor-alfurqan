// Topic taxonomy → Arabic keywords used to filter hadiths by topic.
// Matching is done on the normalized hadith text (no diacritics, unified alef/yaa/taa-marbuta).
// Keywords are stored in normalized form so we can match without re-normalizing per row.

import { normalizeArabic } from "@/lib/arabicNormalize";

export interface HadithTopic {
  id: string;
  label: string;
  keywords: string[]; // normalized
}

const T = (raw: string[]): string[] => raw.map(normalizeArabic);

export const HADITH_TOPICS: HadithTopic[] = [
  { id: "iman",     label: "الإيمان",
    keywords: T(["إيمان", "آمن", "يؤمن", "تصديق", "الإسلام", "اسلام"]) },
  { id: "salah",    label: "الصلاة",
    keywords: T(["صلاة", "صلى", "ركع", "سجد", "وضوء", "أذان", "جماعة"]) },
  { id: "zakat",    label: "الزكاة",
    keywords: T(["زكاة", "صدقة", "أنفق", "إنفاق", "تصدق"]) },
  { id: "siyam",    label: "الصيام",
    keywords: T(["صوم", "صام", "أفطر", "رمضان", "صائم"]) },
  { id: "hajj",     label: "الحج",
    keywords: T(["حج", "عمرة", "طواف", "كعبة", "إحرام", "عرفة"]) },
  { id: "akhlaq",   label: "الأخلاق",
    keywords: T(["خلق", "صدق", "أمانة", "حياء", "تواضع", "حلم", "صبر"]) },
  { id: "athkar",   label: "الأذكار",
    keywords: T(["ذكر", "سبحان", "حمد", "لا إله إلا الله", "تسبيح", "استغفار"]) },
  { id: "dua",      label: "الدعاء",
    keywords: T(["دعاء", "اللهم", "ادع", "يدعو"]) },
  { id: "quran",    label: "القرآن",
    keywords: T(["قرآن", "تلاوة", "آية", "سورة", "حفظ"]) },
  { id: "family",   label: "الأسرة",
    keywords: T(["والد", "أم", "أب", "ابن", "أهل", "زوج", "زوجة", "رحم"]) },
  { id: "jihad",    label: "الجهاد",
    keywords: T(["جهاد", "شهيد", "غزوة", "سبيل الله"]) },
  { id: "ilm",      label: "العلم",
    keywords: T(["علم", "تعلم", "عالم", "فقه", "تفقه"]) },
  { id: "muamala",  label: "المعاملات",
    keywords: T(["بيع", "شراء", "ربا", "تجارة", "كسب", "مال"]) },
  { id: "manners",  label: "الآداب",
    keywords: T(["آداب", "سلام", "ضيف", "طعام", "شراب", "نوم"]) },
];

export const getTopicById = (id: string) =>
  HADITH_TOPICS.find((t) => t.id === id);
