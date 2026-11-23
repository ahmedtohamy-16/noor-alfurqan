import { describe, expect, it } from 'vitest';
import { rangeGlobalAyahs, fitsStorageLimit, audioStorageLimit } from './audioRangeRules';

describe('range downloads', () => {
  it('limits regular users to exactly 10 MiB', () => {
    expect(audioStorageLimit(null)).toBe(10 * 1024 * 1024);
  });
  it('limits active Pro users to exactly 100 MiB', () => {
    expect(audioStorageLimit({ status: 'active', expires_at: null })).toBe(100 * 1024 * 1024);
  });
  it('uses the regular limit when Pro has expired or is inactive', () => {
    expect(audioStorageLimit({ status: 'active', expires_at: '2026-11-22T00:00:00Z' }, Date.parse('2026-11-23T00:00:00Z'))).toBe(10 * 1024 * 1024);
    expect(audioStorageLimit({ status: 'inactive', expires_at: null })).toBe(10 * 1024 * 1024);
  });
  it('selects exactly ayahs 2 through 10 of Al-Baqarah in order', () => {
    expect(rangeGlobalAyahs(2, 2, 10)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17]);
  });
  it('rejects a range beyond the selected surah', () => {
    expect(() => rangeGlobalAyahs(1, 2, 10)).toThrow();
  });
  it('rejects reversed and fractional ranges', () => {
    expect(() => rangeGlobalAyahs(2, 10, 2)).toThrow();
    expect(() => rangeGlobalAyahs(2, 2.5, 10)).toThrow();
  });
  it('includes a single selected verse without adding adjacent verses', () => {
    expect(rangeGlobalAyahs(2, 2, 2)).toEqual([9]);
  });
  it('includes concurrent reserved downloads in the storage budget', () => {
    expect(fitsStorageLimit(80, 20, 100)).toBe(true);
    expect(fitsStorageLimit(80, 21, 100)).toBe(false);
  });
});