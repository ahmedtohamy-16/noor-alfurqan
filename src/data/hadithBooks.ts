export interface HadithBook {
  id: string;
  name: string;
  nameAr: string;
  folder: string; // GitHub folder name
  fileWithDiacritics: string; // CSV file with diacritics
  fileWithoutDiacritics: string; // CSV file without diacritics
  author: string;
  authorAr: string;
  totalHadiths: number;
  description: string;
  color: string;
  hasElaboration: boolean;
}

export const hadithBooks: HadithBook[] = [
  {
    id: 'bukhari',
    name: 'Sahih Al-Bukhari',
    nameAr: 'صحيح البخاري',
    folder: 'Sahih_Al-Bukhari',
    fileWithDiacritics: 'sahih_al-bukhari_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sahih_al-bukhari_ahadith.utf8.csv',
    author: 'Imam Al-Bukhari',
    authorAr: 'الإمام البخاري',
    totalHadiths: 7563,
    description: 'أصح كتاب بعد كتاب الله تعالى',
    color: 'from-emerald-500 to-teal-600',
    hasElaboration: true
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    nameAr: 'صحيح مسلم',
    folder: 'Sahih_Muslim',
    fileWithDiacritics: 'sahih_muslim_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sahih_muslim_ahadith.utf8.csv',
    author: 'Imam Muslim',
    authorAr: 'الإمام مسلم',
    totalHadiths: 5362,
    description: 'ثاني أصح كتب الحديث',
    color: 'from-blue-500 to-indigo-600',
    hasElaboration: true
  },
  {
    id: 'abudawud',
    name: 'Sunan Abu Dawud',
    nameAr: 'سنن أبي داود',
    folder: 'Sunan_Abu-Dawud',
    fileWithDiacritics: 'sunan_abi_dawud_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_abi_dawud_ahadith.utf8.csv',
    author: 'Imam Abu Dawud',
    authorAr: 'الإمام أبو داود',
    totalHadiths: 5274,
    description: 'من الكتب الستة',
    color: 'from-purple-500 to-violet-600',
    hasElaboration: true
  },
  {
    id: 'tirmidhi',
    name: 'Jami At-Tirmidhi',
    nameAr: 'جامع الترمذي',
    folder: 'Sunan_Al-Tirmidhi',
    fileWithDiacritics: 'sunan_al-tirmizi_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-tirmizi_ahadith.utf8.csv',
    author: 'Imam At-Tirmidhi',
    authorAr: 'الإمام الترمذي',
    totalHadiths: 3956,
    description: 'الجامع الصحيح',
    color: 'from-orange-500 to-amber-600',
    hasElaboration: true
  },
  {
    id: 'nasai',
    name: 'Sunan An-Nasai',
    nameAr: 'سنن النسائي',
    folder: 'Sunan_Al-Nasai',
    fileWithDiacritics: 'sunan_al-nasai_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-nasai_ahadith.utf8.csv',
    author: 'Imam An-Nasai',
    authorAr: 'الإمام النسائي',
    totalHadiths: 5758,
    description: 'المجتبى من السنن',
    color: 'from-cyan-500 to-sky-600',
    hasElaboration: true
  },
  {
    id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    nameAr: 'سنن ابن ماجه',
    folder: 'Sunan_Ibn-Maja',
    fileWithDiacritics: 'sunan_ibn_maja_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_ibn_maja_ahadith.utf8.csv',
    author: 'Imam Ibn Majah',
    authorAr: 'الإمام ابن ماجه',
    totalHadiths: 4341,
    description: 'من الكتب الستة',
    color: 'from-rose-500 to-pink-600',
    hasElaboration: true
  },
  {
    id: 'malik',
    name: 'Muwatta Malik',
    nameAr: 'موطأ مالك',
    folder: 'Maliks_Muwataa',
    fileWithDiacritics: 'mawtta_malik_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'mawtta_malik_ahadith.utf8.csv',
    author: 'Imam Malik',
    authorAr: 'الإمام مالك بن أنس',
    totalHadiths: 1832,
    description: 'أول كتاب حديث مرتب',
    color: 'from-lime-500 to-green-600',
    hasElaboration: true
  },
  {
    id: 'ahmad',
    name: 'Musnad Ahmad',
    nameAr: 'مسند أحمد',
    folder: 'Musnad_Ahmad_Ibn-Hanbal',
    fileWithDiacritics: 'musnad_ahmad_ibn-hanbal_ahadith_mushakkala.utf8.csv',
    fileWithoutDiacritics: 'musnad_ahmad_ibn-hanbal_ahadith.utf8.csv',
    author: 'Imam Ahmad',
    authorAr: 'الإمام أحمد بن حنبل',
    totalHadiths: 27647,
    description: 'أكبر دواوين السنة',
    color: 'from-amber-500 to-yellow-600',
    hasElaboration: false
  },
  {
    id: 'darimi',
    name: 'Sunan Ad-Darimi',
    nameAr: 'سنن الدارمي',
    folder: 'Sunan_Al-Darimi',
    fileWithDiacritics: 'sunan_al-darimi_ahadith_mushakkala_mufassala.utf8.csv',
    fileWithoutDiacritics: 'sunan_al-darimi_ahadith.utf8.csv',
    author: 'Imam Ad-Darimi',
    authorAr: 'الإمام الدارمي',
    totalHadiths: 3503,
    description: 'المسند الجامع',
    color: 'from-fuchsia-500 to-purple-600',
    hasElaboration: true
  }
];

export interface Hadith {
  id: number;
  bookId: string;
  hadithNumber: number;
  text: string; // النص بالتشكيل
  textClean?: string; // النص بدون تشكيل للبحث
  narrator?: string;
  elaboration?: string;
  grade?: string;
}

export const getBookById = (id: string): HadithBook | undefined => {
  return hadithBooks.find(book => book.id === id);
};
