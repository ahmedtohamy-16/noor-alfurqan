import { describe, expect, it } from 'vitest';
import { validateTextSelection, textSelectionId } from './offlineQuranRules';
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
});