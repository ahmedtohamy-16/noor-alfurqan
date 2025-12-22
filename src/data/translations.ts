export interface Translation {
  id: string;
  name: string;
  language: string;
  languageArabic: string;
}

export const translations: Translation[] = [
  // English
  { id: "en.sahih", name: "Sahih International", language: "English", languageArabic: "الإنجليزية" },
  { id: "en.pickthall", name: "Pickthall", language: "English", languageArabic: "الإنجليزية" },
  { id: "en.yusufali", name: "Yusuf Ali", language: "English", languageArabic: "الإنجليزية" },
  
  // Urdu
  { id: "ur.jalandhry", name: "فتح محمد جالندھری", language: "Urdu", languageArabic: "الأردو" },
  { id: "ur.kanzuliman", name: "أحمد رضا خان", language: "Urdu", languageArabic: "الأردو" },
  { id: "ur.maududi", name: "أبو الأعلى المودودي", language: "Urdu", languageArabic: "الأردو" },
  
  // Indonesian (Bahasa Indonesia)
  { id: "id.indonesian", name: "وزارة الشؤون الدينية الإندونيسية", language: "Bahasa Indonesia", languageArabic: "الإندونيسية" },
  { id: "id.muntakhab", name: "المختصر في تفسير القرآن", language: "Bahasa Indonesia", languageArabic: "الإندونيسية" },
  
  // Turkish (Türkçe)
  { id: "tr.diyanet", name: "مديرية الشؤون الدينية التركية", language: "Türkçe", languageArabic: "التركية" },
  { id: "tr.yazir", name: "محمد حمدي يازر", language: "Türkçe", languageArabic: "التركية" },
  { id: "tr.ates", name: "سليمان آتش", language: "Türkçe", languageArabic: "التركية" },
  
  // French (Français)
  { id: "fr.hamidullah", name: "محمد حميد الله", language: "Français", languageArabic: "الفرنسية" },
  
  // Chinese
  { id: "zh.majian", name: "ما جيان", language: "Chinese", languageArabic: "الصينية" },
  { id: "zh.jian", name: "SAWA", language: "Chinese", languageArabic: "الصينية" },
  
  // Persian
  { id: "fa.makarem", name: "مكارم شيرازي", language: "Persian", languageArabic: "الفارسية" },
  
  // German
  { id: "de.aburida", name: "أبو رضا", language: "German", languageArabic: "الألمانية" },
  
  // Spanish
  { id: "es.cortes", name: "خوليو كورتيس", language: "Spanish", languageArabic: "الإسبانية" },
  
  // Russian
  { id: "ru.kuliev", name: "إلمير كولييف", language: "Russian", languageArabic: "الروسية" },
];

// Group translations by language
export const getTranslationsByLanguage = () => {
  const grouped: Record<string, Translation[]> = {};
  translations.forEach((t) => {
    if (!grouped[t.language]) {
      grouped[t.language] = [];
    }
    grouped[t.language].push(t);
  });
  return grouped;
};
