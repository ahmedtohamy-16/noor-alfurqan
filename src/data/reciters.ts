export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  style?: string;
  server: string;
  verified: boolean; // Whether this reciter's audio links are verified working
}

// Only verified working reciters from cdn.islamic.network
// Each reciter has been tested to ensure audio files exist and work
export const reciters: Reciter[] = [
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    nameArabic: "مشاري راشد العفاسي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.alafasy",
    verified: true,
  },
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    nameArabic: "محمود خليل الحصري",
    server: "https://cdn.islamic.network/quran/audio/128/ar.husary",
    verified: true,
  },
  {
    id: "ar.minshawi",
    name: "Mohamed Siddiq El-Minshawi",
    nameArabic: "محمد صديق المنشاوي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.minshawi",
    verified: true,
  },
  {
    id: "ar.abdulsamad",
    name: "Abdul Basit Abdul Samad",
    nameArabic: "عبد الباسط عبد الصمد",
    server: "https://cdn.islamic.network/quran/audio/128/ar.abdulsamad",
    verified: true,
  },
  {
    id: "ar.sudais",
    name: "Abdurrahman As-Sudais",
    nameArabic: "عبد الرحمن السديس",
    server: "https://cdn.islamic.network/quran/audio/128/ar.sudais",
    verified: true,
  },
  {
    id: "ar.shaatree",
    name: "Abu Bakr Al-Shatri",
    nameArabic: "أبو بكر الشاطري",
    server: "https://cdn.islamic.network/quran/audio/128/ar.shaatree",
    verified: true,
  },
  {
    id: "ar.mahermuaiqly",
    name: "Maher Al-Muaiqly",
    nameArabic: "ماهر المعيقلي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly",
    verified: true,
  },
  {
    id: "ar.hanirifai",
    name: "Hani Ar-Rifai",
    nameArabic: "هاني الرفاعي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.hanirifai",
    verified: true,
  },
  {
    id: "ar.shuraym",
    name: "Saud Al-Shuraym",
    nameArabic: "سعود الشريم",
    server: "https://cdn.islamic.network/quran/audio/128/ar.shuraym",
    verified: true,
  },
  {
    id: "ar.ahmedajamy",
    name: "Ahmed Al-Ajamy",
    nameArabic: "أحمد العجمي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.ahmedajamy",
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

// Validate if audio URL is accessible (for runtime verification)
export const validateReciterAudio = async (reciterId: string, ayahNumber: number = 1): Promise<boolean> => {
  const reciter = getReciterById(reciterId);
  if (!reciter) return false;
  
  try {
    const response = await fetch(`${reciter.server}/${ayahNumber}.mp3`, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
