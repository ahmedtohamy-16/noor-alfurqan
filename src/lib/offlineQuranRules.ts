import { surahs } from '@/data/surahs';
export function validateTextSelection(surah: number, from: number, to: number) {
  const meta = surahs.find(s => s.number === surah);
  return !!meta && Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from && to <= meta.numberOfAyahs;
}
export const textSelectionId = (surah: number, from: number, to: number) => `${surah}:${from}-${to}`;
/** A partial download must never masquerade as the full runtime corpus. */
export function completeQuranCorpus(rows: { sura_id: number; ayat_number_in_sura: number }[]): boolean {
  const references = new Set(rows.map(a => `${a.sura_id}:${a.ayat_number_in_sura}`));
  return rows.length === 6236 && references.size === 6236 && surahs.every(s => Array.from({ length: s.numberOfAyahs }, (_, i) => i + 1).every(n => references.has(`${s.number}:${n}`)));
}