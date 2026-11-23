import { surahs } from '@/data/surahs';
export function validateTextSelection(surah: number, from: number, to: number) {
  const meta = surahs.find(s => s.number === surah);
  return !!meta && Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from && to <= meta.numberOfAyahs;
}
export const textSelectionId = (surah: number, from: number, to: number) => `${surah}:${from}-${to}`;