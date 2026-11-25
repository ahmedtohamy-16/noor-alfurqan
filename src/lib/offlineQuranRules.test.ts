import { describe, expect, it } from 'vitest';
import { validateTextSelection, textSelectionId, completeQuranCorpus } from './offlineQuranRules';
import { surahs } from '@/data/surahs';
describe('user-controlled Quran text downloads', () => {
  it('allows a specific ayah or same-surah range', () => {
    expect(validateTextSelection(2, 2, 10)).toBe(true);
    expect(validateTextSelection(2, 255, 255)).toBe(true);
    expect(textSelectionId(2, 2, 10)).toBe('2:2-10');
  });
  it('rejects nonexistent or reversed selections', () => {
    expect(validateTextSelection(2, 10, 2)).toBe(false);
    expect(validateTextSelection(1, 1, 8)).toBe(false);
    expect(validateTextSelection(115, 1, 1)).toBe(false);
  });
  it('never treats a selected surah or repeated verses as a full Quran', () => {
    expect(completeQuranCorpus([{ sura_id: 1, ayat_number_in_sura: 1 }])).toBe(false);
    expect(completeQuranCorpus(Array.from({ length: 6236 }, () => ({ sura_id: 1, ayat_number_in_sura: 1 })))).toBe(false);
    expect(completeQuranCorpus(surahs.flatMap(s => Array.from({ length: s.numberOfAyahs }, (_, i) => ({ sura_id: s.number, ayat_number_in_sura: i + 1 }))))).toBe(true);
  });
});