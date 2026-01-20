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

let ayatsCache: QuranAyah[] | null = null;
let ayatsPromise: Promise<QuranAyah[]> | null = null;

/**
 * Load ayahs at runtime from a static JSON file in /public to keep TypeScript compilation light.
 */
export const loadQuranAyats = async (): Promise<QuranAyah[]> => {
  if (ayatsCache) return ayatsCache;
  if (ayatsPromise) return ayatsPromise;

  ayatsPromise = fetch("/data/quranAyats.json")
    .then(async (res) => {
      if (!res.ok) throw new Error("Failed to load Quran ayahs");
      return (await res.json()) as QuranAyah[];
    })
    .then((data) => {
      ayatsCache = data;
      return data;
    })
    .finally(() => {
      ayatsPromise = null;
    });

  return ayatsPromise;
};

// Helper functions for working with the data

/**
 * Get all ayahs for a specific surah
 */
export const getAyahsBySurah = (surahNumber: number): QuranAyah[] => {
  throw new Error("getAyahsBySurah is now async. Use getAyahsBySurahAsync instead.");
};

export const getAyahsBySurahAsync = async (surahNumber: number): Promise<QuranAyah[]> => {
  const ayahs = await loadQuranAyats();
  return ayahs.filter((ayah) => ayah.sura_id === surahNumber);
};

/**
 * Get all ayahs for a specific page
 */
export const getAyahsByPage = (pageNumber: number): QuranAyah[] => {
  throw new Error("getAyahsByPage is now async. Use getAyahsByPageAsync instead.");
};

export const getAyahsByPageAsync = async (pageNumber: number): Promise<QuranAyah[]> => {
  const ayahs = await loadQuranAyats();
  return ayahs.filter((ayah) => ayah.page_number === pageNumber);
};

/**
 * Get all ayahs for a specific juz
 */
export const getAyahsByJuz = (juzNumber: number): QuranAyah[] => {
  throw new Error("getAyahsByJuz is now async. Use getAyahsByJuzAsync instead.");
};

export const getAyahsByJuzAsync = async (juzNumber: number): Promise<QuranAyah[]> => {
  const ayahs = await loadQuranAyats();
  return ayahs.filter((ayah) => ayah.juz_number === juzNumber);
};

/**
 * Get a specific ayah by surah and ayah number
 */
export const getAyah = (surahNumber: number, ayahNumber: number): QuranAyah | undefined => {
  throw new Error("getAyah is now async. Use getAyahAsync instead.");
};

export const getAyahAsync = async (
  surahNumber: number,
  ayahNumber: number
): Promise<QuranAyah | undefined> => {
  const ayahs = await loadQuranAyats();
  return ayahs.find(
    (ayah) => ayah.sura_id === surahNumber && ayah.ayat_number_in_sura === ayahNumber
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
  throw new Error("searchAyahs is now async. Use searchAyahsAsync instead.");
};

export const searchAyahsAsync = async (query: string): Promise<QuranAyah[]> => {
  if (!query.trim()) return [];
  const ayahs = await loadQuranAyats();
  const normalizedQuery = normalizeArabic(query.trim());
  return ayahs.filter((ayah) => normalizeArabic(ayah.text_uthmani).includes(normalizedQuery));
};

/**
 * Get total number of ayahs in a surah
 */
export const getSurahAyahCount = (surahNumber: number): number => {
  throw new Error("getSurahAyahCount is now async. Use getSurahAyahCountAsync instead.");
};

export const getSurahAyahCountAsync = async (surahNumber: number): Promise<number> => {
  const ayahs = await loadQuranAyats();
  return ayahs.filter((ayah) => ayah.sura_id === surahNumber).length;
};

/**
 * Get the page range for a surah
 */
export const getSurahPageRange = (surahNumber: number): { start: number; end: number } => {
  throw new Error("getSurahPageRange is now async. Use getSurahPageRangeAsync instead.");
};

export const getSurahPageRangeAsync = async (
  surahNumber: number
): Promise<{ start: number; end: number }> => {
  const surahAyahs = await getAyahsBySurahAsync(surahNumber);
  if (surahAyahs.length === 0) return { start: 1, end: 1 };

  const pages = surahAyahs.map((a) => a.page_number);
  return {
    start: Math.min(...pages),
    end: Math.max(...pages),
  };
};
