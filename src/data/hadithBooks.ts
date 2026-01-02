export interface HadithBook {
  id: string;
  name: string;
  nameAr: string;
  author: string;
  authorAr: string;
  totalHadiths: number;
  description: string;
  color: string;
}

export const hadithBooks: HadithBook[] = [
  {
    id: 'bukhari',
    name: 'Sahih Al-Bukhari',
    nameAr: 'صحيح البخاري',
    author: 'Imam Al-Bukhari',
    authorAr: 'الإمام البخاري',
    totalHadiths: 7563,
    description: 'أصح كتاب بعد كتاب الله تعالى',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'muslim',
    name: 'Sahih Muslim',
    nameAr: 'صحيح مسلم',
    author: 'Imam Muslim',
    authorAr: 'الإمام مسلم',
    totalHadiths: 3032,
    description: 'ثاني أصح كتب الحديث',
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'abudawud',
    name: 'Sunan Abu Dawud',
    nameAr: 'سنن أبي داود',
    author: 'Imam Abu Dawud',
    authorAr: 'الإمام أبو داود',
    totalHadiths: 3998,
    description: 'من الكتب الستة',
    color: 'from-purple-500 to-violet-600'
  },
  {
    id: 'tirmidhi',
    name: 'Jami At-Tirmidhi',
    nameAr: 'جامع الترمذي',
    author: 'Imam At-Tirmidhi',
    authorAr: 'الإمام الترمذي',
    totalHadiths: 3956,
    description: 'الجامع الصحيح',
    color: 'from-orange-500 to-amber-600'
  },
  {
    id: 'nasai',
    name: 'Sunan An-Nasai',
    nameAr: 'سنن النسائي',
    author: 'Imam An-Nasai',
    authorAr: 'الإمام النسائي',
    totalHadiths: 5758,
    description: 'المجتبى من السنن',
    color: 'from-cyan-500 to-sky-600'
  },
  {
    id: 'ibnmajah',
    name: 'Sunan Ibn Majah',
    nameAr: 'سنن ابن ماجه',
    author: 'Imam Ibn Majah',
    authorAr: 'الإمام ابن ماجه',
    totalHadiths: 4342,
    description: 'من الكتب الستة',
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: 'malik',
    name: 'Muwatta Malik',
    nameAr: 'موطأ مالك',
    author: 'Imam Malik',
    authorAr: 'الإمام مالك بن أنس',
    totalHadiths: 1594,
    description: 'أول كتاب حديث مرتب',
    color: 'from-lime-500 to-green-600'
  },
  {
    id: 'ahmad',
    name: 'Musnad Ahmad',
    nameAr: 'مسند أحمد',
    author: 'Imam Ahmad',
    authorAr: 'الإمام أحمد بن حنبل',
    totalHadiths: 26363,
    description: 'أكبر دواوين السنة',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'darimi',
    name: 'Sunan Ad-Darimi',
    nameAr: 'سنن الدارمي',
    author: 'Imam Ad-Darimi',
    authorAr: 'الإمام الدارمي',
    totalHadiths: 3503,
    description: 'المسند الجامع',
    color: 'from-fuchsia-500 to-purple-600'
  }
];

export interface Hadith {
  id: number;
  hadith_id: number;
  book: string;
  hadith_english: string;
  hadith_arabic: string;
  chapter_english?: string;
  chapter_arabic?: string;
  narrator_english?: string;
  narrator_arabic?: string;
}
