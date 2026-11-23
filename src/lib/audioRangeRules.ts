import { surahs } from '@/data/surahs';

export const REGULAR_AUDIO_LIMIT = 10 * 1024 * 1024;
export const PRO_AUDIO_LIMIT = 100 * 1024 * 1024;
export function audioStorageLimit(entitlement: { status: string; expires_at: string | null } | null, now = Date.now()) {
  return entitlement?.status === 'active' && (!entitlement.expires_at || Date.parse(entitlement.expires_at) > now)
    ? PRO_AUDIO_LIMIT : REGULAR_AUDIO_LIMIT;
}

export function rangeGlobalAyahs(surahNumber: number, start: number, end: number): number[] {
  const surah = surahs.find((s) => s.number === surahNumber);
  if (!surah || !Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > surah.numberOfAyahs) {
    throw new Error('اختر نطاقًا صحيحًا داخل السورة');
  }
  const offset = surahs.filter((s) => s.number < surahNumber).reduce((n, s) => n + s.numberOfAyahs, 0);
  return Array.from({ length: end - start + 1 }, (_, i) => offset + start + i);
}

export function fitsStorageLimit(used: number, incoming: number, limit: number | null): boolean {
  return limit === null || used + incoming <= limit;
}