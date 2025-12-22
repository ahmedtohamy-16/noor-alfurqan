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
  {
    id: "ar.hani_rifai",
    name: "Hani Ar-Rifai",
    nameArabic: "هاني الرفاعي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.hanirifai",
  },
  {
    id: "ar.ayyoub",
    name: "Muhammad Ayyoub",
    nameArabic: "محمد أيوب",
    server: "https://cdn.islamic.network/quran/audio/128/ar.muhammadayyoub",
  },
  {
    id: "ar.parhizgar",
    name: "Ibrahim Al-Akhdar",
    nameArabic: "إبراهيم الأخضر",
    server: "https://cdn.islamic.network/quran/audio/128/ar.ibrahimakhdar",
  },
  {
    id: "ar.shuraym",
    name: "Saud Al-Shuraym",
    nameArabic: "سعود الشريم",
    server: "https://cdn.islamic.network/quran/audio/128/ar.shuraym",
  },
  {
    id: "ar.ahmedajamy",
    name: "Ahmed Al-Ajamy",
    nameArabic: "أحمد العجمي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.ahmedajamy",
  },
  {
    id: "ar.alialhuthaify",
    name: "Ali Al-Huthaify",
    nameArabic: "علي الحذيفي",
    server: "https://cdn.islamic.network/quran/audio/128/ar.alialhuthaify",
  },
  {
    id: "ar.abdulbari",
    name: "Abdullah Basfar",
    nameArabic: "عبد الله بصفر",
    server: "https://cdn.islamic.network/quran/audio/128/ar.abdullahbasfar",
  },
  {
    id: "ar.abdullahawwad",
    name: "Abdullah Awwad Al-Juhani",
    nameArabic: "عبد الله عواد الجهني",
    server: "https://cdn.islamic.network/quran/audio/128/ar.abdullahawwad",
  },
];

export const getReciterById = (id: string): Reciter | undefined => {
  return reciters.find((r) => r.id === id);
};
