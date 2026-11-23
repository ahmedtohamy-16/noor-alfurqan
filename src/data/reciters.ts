import { surahs } from "./surahs";

export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  style?: string;
  server: string;
  verified: boolean; // Whether this reciter's audio links are verified working
}

// Audio served by everyayah.com (CORS-enabled, files named SSSAAA.mp3). All verified for every reciter.
// Each reciter has been tested to ensure audio files exist and work
export const reciters: Reciter[] = [
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    nameArabic: "محمود خليل الحصري",
    server: "https://everyayah.com/data/Husary_128kbps",
    verified: true,
  },
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    nameArabic: "مشاري راشد العفاسي",
    server: "https://everyayah.com/data/Alafasy_128kbps",
    verified: true,
  },
  {
    id: "ar.minshawi",
    name: "Mohamed Siddiq El-Minshawi",
    nameArabic: "محمد صديق المنشاوي",
    server: "https://everyayah.com/data/Minshawy_Murattal_128kbps",
    verified: true,
  },
  {
    id: "ar.abdulsamad",
    name: "Abdul Basit Abdul Samad",
    nameArabic: "عبد الباسط عبد الصمد",
    server: "https://everyayah.com/data/Abdul_Basit_Murattal_192kbps",
    verified: true,
  },
  {
    id: "ar.sudais",
    name: "Abdurrahman As-Sudais",
    nameArabic: "عبد الرحمن السديس",
    server: "https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps",
    verified: true,
  },
  {
    id: "ar.shaatree",
    name: "Abu Bakr Al-Shatri",
    nameArabic: "أبو بكر الشاطري",
    server: "https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps",
    verified: true,
  },
  {
    id: "ar.mahermuaiqly",
    name: "Maher Al-Muaiqly",
    nameArabic: "ماهر المعيقلي",
    server: "https://everyayah.com/data/MaherAlMuaiqly128kbps",
    verified: true,
  },
  {
    id: "ar.hanirifai",
    name: "Hani Ar-Rifai",
    nameArabic: "هاني الرفاعي",
    server: "https://everyayah.com/data/Hani_Rifai_192kbps",
    verified: true,
  },
  {
    id: "ar.shuraym",
    name: "Saud Al-Shuraym",
    nameArabic: "سعود الشريم",
    server: "https://everyayah.com/data/Saood_ash-Shuraym_128kbps",
    verified: true,
  },
  {
    id: "ar.ahmedajamy",
    name: "Ahmed Al-Ajamy",
    nameArabic: "أحمد العجمي",
    server: "https://everyayah.com/data/Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net",
    verified: true,
  },
];

// Get only verified reciters
export const getVerifiedReciters = (): Reciter[] => {
  return reciters.filter(r => r.verified);
};

export const getReciterById = (id: string): Reciter | undefined => {
  return reciters.find((r) => r.id === id);
};

export const DEFAULT_RECITER_ID = "ar.husary";

const pad3 = (n: number) => String(n).padStart(3, "0");

/** URL for one ayah by surah number and ayah number inside the surah. */
export const getAyahAudioUrlBySurah = (reciter: Reciter, surah: number, ayahInSurah: number): string =>
  `${reciter.server}/${pad3(surah)}${pad3(ayahInSurah)}.mp3`;

/** Convert a global ayah number (1..6236) to surah/ayah. */
export const globalToSurahAyah = (globalNumber: number): { surah: number; ayah: number } => {
  let remaining = globalNumber;
  for (const s of surahs) {
    if (remaining <= s.numberOfAyahs) return { surah: s.number, ayah: remaining };
    remaining -= s.numberOfAyahs;
  }
  return { surah: 114, ayah: 6 };
};

/** URL for one ayah by its global number (1..6236). */
export const getAyahAudioUrl = (reciter: Reciter, globalNumber: number): string => {
  const { surah, ayah } = globalToSurahAyah(globalNumber);
  return getAyahAudioUrlBySurah(reciter, surah, ayah);
};
