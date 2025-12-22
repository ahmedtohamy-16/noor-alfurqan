// Mapping of Quran pages (Mushaf Madina) - Page number to ayah ranges
// Format: pageNumber: [{ surah: surahNumber, startAyah: number, endAyah: number }]

export interface PageAyahRange {
  surah: number;
  startAyah: number;
  endAyah: number;
}

export const quranPages: Record<number, PageAyahRange[]> = {
  1: [{ surah: 1, startAyah: 1, endAyah: 7 }], // الفاتحة كاملة
  2: [{ surah: 2, startAyah: 1, endAyah: 5 }], // أول البقرة
  3: [{ surah: 2, startAyah: 6, endAyah: 16 }],
  4: [{ surah: 2, startAyah: 17, endAyah: 24 }],
  5: [{ surah: 2, startAyah: 25, endAyah: 29 }],
  6: [{ surah: 2, startAyah: 30, endAyah: 37 }],
  7: [{ surah: 2, startAyah: 38, endAyah: 48 }],
  8: [{ surah: 2, startAyah: 49, endAyah: 57 }],
  9: [{ surah: 2, startAyah: 58, endAyah: 61 }],
  10: [{ surah: 2, startAyah: 62, endAyah: 69 }],
  11: [{ surah: 2, startAyah: 70, endAyah: 76 }],
  12: [{ surah: 2, startAyah: 77, endAyah: 83 }],
  13: [{ surah: 2, startAyah: 84, endAyah: 88 }],
  14: [{ surah: 2, startAyah: 89, endAyah: 93 }],
  15: [{ surah: 2, startAyah: 94, endAyah: 101 }],
  16: [{ surah: 2, startAyah: 102, endAyah: 105 }],
  17: [{ surah: 2, startAyah: 106, endAyah: 112 }],
  18: [{ surah: 2, startAyah: 113, endAyah: 119 }],
  19: [{ surah: 2, startAyah: 120, endAyah: 126 }],
  20: [{ surah: 2, startAyah: 127, endAyah: 134 }],
  21: [{ surah: 2, startAyah: 135, endAyah: 141 }],
  22: [{ surah: 2, startAyah: 142, endAyah: 145 }],
  23: [{ surah: 2, startAyah: 146, endAyah: 153 }],
  24: [{ surah: 2, startAyah: 154, endAyah: 163 }],
  25: [{ surah: 2, startAyah: 164, endAyah: 169 }],
  26: [{ surah: 2, startAyah: 170, endAyah: 176 }],
  27: [{ surah: 2, startAyah: 177, endAyah: 181 }],
  28: [{ surah: 2, startAyah: 182, endAyah: 186 }],
  29: [{ surah: 2, startAyah: 187, endAyah: 191 }],
  30: [{ surah: 2, startAyah: 192, endAyah: 196 }],
  31: [{ surah: 2, startAyah: 197, endAyah: 202 }],
  32: [{ surah: 2, startAyah: 203, endAyah: 210 }],
  33: [{ surah: 2, startAyah: 211, endAyah: 215 }],
  34: [{ surah: 2, startAyah: 216, endAyah: 219 }],
  35: [{ surah: 2, startAyah: 220, endAyah: 224 }],
  36: [{ surah: 2, startAyah: 225, endAyah: 230 }],
  37: [{ surah: 2, startAyah: 231, endAyah: 233 }],
  38: [{ surah: 2, startAyah: 234, endAyah: 237 }],
  39: [{ surah: 2, startAyah: 238, endAyah: 245 }],
  40: [{ surah: 2, startAyah: 246, endAyah: 248 }],
  41: [{ surah: 2, startAyah: 249, endAyah: 252 }],
  42: [{ surah: 2, startAyah: 253, endAyah: 256 }],
  43: [{ surah: 2, startAyah: 257, endAyah: 259 }],
  44: [{ surah: 2, startAyah: 260, endAyah: 264 }],
  45: [{ surah: 2, startAyah: 265, endAyah: 269 }],
  46: [{ surah: 2, startAyah: 270, endAyah: 274 }],
  47: [{ surah: 2, startAyah: 275, endAyah: 281 }],
  48: [{ surah: 2, startAyah: 282, endAyah: 282 }],
  49: [
    { surah: 2, startAyah: 283, endAyah: 286 },
    { surah: 3, startAyah: 1, endAyah: 9 },
  ],
  50: [{ surah: 3, startAyah: 10, endAyah: 15 }],
};

// Helper function to get page for a specific surah and ayah
export const getPageForAyah = (surah: number, ayah: number): number => {
  for (const [page, ranges] of Object.entries(quranPages)) {
    for (const range of ranges) {
      if (range.surah === surah && ayah >= range.startAyah && ayah <= range.endAyah) {
        return parseInt(page);
      }
    }
  }
  // Fallback: estimate page based on surah position
  // Total 604 pages, approximate distribution
  return Math.min(604, Math.max(1, Math.floor((surah / 114) * 604)));
};

// Get ayahs for a specific page
export const getAyahsForPage = (page: number): PageAyahRange[] => {
  return quranPages[page] || [];
};

// Total pages in Mushaf
export const TOTAL_PAGES = 604;
