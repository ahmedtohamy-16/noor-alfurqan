// Quran Ayats Data - Offline Static Data
// Total: 6236 ayahs across 114 surahs

export interface QuranAyah {
  id: number;
  sura_id: number;
  ayat_number_in_sura: number;
  text_uthmani: string;
  juz_number: number;
  page_number: number;
  hizb_number: number;
}

// Import the JSON data
import ayatsData from './quranAyats.json';

export const quranAyats: QuranAyah[] = ayatsData as QuranAyah[];

// Helper functions for working with the data

/**
 * Get all ayahs for a specific surah
 */
export const getAyahsBySurah = (surahNumber: number): QuranAyah[] => {
  return quranAyats.filter(ayah => ayah.sura_id === surahNumber);
};

/**
 * Get all ayahs for a specific page
 */
export const getAyahsByPage = (pageNumber: number): QuranAyah[] => {
  return quranAyats.filter(ayah => ayah.page_number === pageNumber);
};

/**
 * Get all ayahs for a specific juz
 */
export const getAyahsByJuz = (juzNumber: number): QuranAyah[] => {
  return quranAyats.filter(ayah => ayah.juz_number === juzNumber);
};

/**
 * Get a specific ayah by surah and ayah number
 */
export const getAyah = (surahNumber: number, ayahNumber: number): QuranAyah | undefined => {
  return quranAyats.find(
    ayah => ayah.sura_id === surahNumber && ayah.ayat_number_in_sura === ayahNumber
  );
};

/**
 * Search ayahs by text
 */
// Normalize Arabic text by removing diacritics and normalizing characters
const normalizeArabic = (text: string): string => {
  return text
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    // Normalize alef variants to simple alef
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize teh marbuta to heh
    .replace(/ة/g, 'ه')
    // Normalize alef maksura to yeh
    .replace(/ى/g, 'ي')
    // Remove tatweel
    .replace(/ـ/g, '')
    .trim();
};

export const searchAyahs = (query: string): QuranAyah[] => {
  if (!query.trim()) return [];
  const normalizedQuery = normalizeArabic(query.trim());
  return quranAyats.filter(ayah => 
    normalizeArabic(ayah.text_uthmani).includes(normalizedQuery)
  );
};

/**
 * Get total number of ayahs in a surah
 */
export const getSurahAyahCount = (surahNumber: number): number => {
  return quranAyats.filter(ayah => ayah.sura_id === surahNumber).length;
};

/**
 * Get the page range for a surah
 */
export const getSurahPageRange = (surahNumber: number): { start: number; end: number } => {
  const surahAyahs = getAyahsBySurah(surahNumber);
  if (surahAyahs.length === 0) return { start: 1, end: 1 };
  
  const pages = surahAyahs.map(a => a.page_number);
  return {
    start: Math.min(...pages),
    end: Math.max(...pages)
  };
};
