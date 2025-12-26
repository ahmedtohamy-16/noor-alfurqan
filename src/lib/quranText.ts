// Utilities for normalizing Quran text coming from API responses

/**
 * Removes a leading Bismillah (بِسْمِ اللهِ الرَّحْمَٰنِ الرَّحِيمِ) from an ayah text.
 * We keep it conservative: only strips when it appears at the very start.
 */
export const stripLeadingBismillah = (text: string): string => {
  return text
    .replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَـٰنِ\s*ٱلرَّحِيمِ\s*/u, "")
    .replace(/^بِسْمِ\s*ٱللَّهِ\s*ٱلرَّحْمَٰنِ\s*ٱلرَّحِيمِ\s*/u, "")
    .replace(/^بِسْمِ\s*اللَّهِ\s*الرَّحْمَٰنِ\s*الرَّحِيمِ\s*/u, "")
    .replace(/^بِسْمِ\s*اللهِ\s*الرَّحْمٰنِ\s*الرَّحِيْمِ\s*/u, "")
    .replace(/^بسم\s*الله\s*الرحمن\s*الرحيم\s*/u, "")
    .trim();
};
