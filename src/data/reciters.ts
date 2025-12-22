export interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  style?: string;
  server: string;
}

export const reciters: Reciter[] = [
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    nameArabic: "مشاري راشد العفاسي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.alafasy",
  },
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    nameArabic: "محمود خليل الحصري",
    server: "https://cdn.islamic.network/quran/audio/128/ar.husary",
  },
  {
    id: "ar.minshawi",
    name: "Mohamed Siddiq El-Minshawi",
    nameArabic: "محمد صديق المنشاوي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.minshawi",
  },
  {
    id: "ar.abdulsamad",
    name: "Abdul Basit Abdul Samad",
    nameArabic: "عبد الباسط عبد الصمد",
    server: "https://cdn.islamic.network/quran/audio/128/ar.abdulsamad",
  },
  {
    id: "ar.sudais",
    name: "Abdurrahman As-Sudais",
    nameArabic: "عبد الرحمن السديس",
    server: "https://cdn.islamic.network/quran/audio/128/ar.sudais",
  },
  {
    id: "ar.shaatree",
    name: "Abu Bakr Al-Shatri",
    nameArabic: "أبو بكر الشاطري",
    server: "https://cdn.islamic.network/quran/audio/128/ar.shaatree",
  },
  {
    id: "ar.mahermuaiqly",
    name: "Maher Al-Muaiqly",
    nameArabic: "ماهر المعيقلي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.mahermuaiqly",
  },
];

export const getReciterById = (id: string): Reciter | undefined => {
  return reciters.find((r) => r.id === id);
};
