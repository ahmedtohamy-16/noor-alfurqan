import { describe, it, expect } from 'vitest';
import { decideAfterAyah, type AfterAyahInput } from './playbackRules';
import { getAyahAudioUrl, getReciterById, DEFAULT_RECITER_ID } from '@/data/reciters';

const base: AfterAyahInput = {
  surahNumber: 1, ayahCount: 7, index: 0, globalAyah: 1, playMode: 'surah',
  repeatMode: 'none', repeatCount: 3, currentRepeat: 0, rangeStart: 1, rangeEnd: 1,
};

describe('playback rules', () => {
  it('single-ayah mode stops after the ayah', () => {
    expect(decideAfterAyah({ ...base, playMode: 'single' }).action).toBe('stop');
  });
  it('surah mode stops at the last ayah and does not restart', () => {
    expect(decideAfterAyah({ ...base, index: 6, globalAyah: 7 })).toMatchObject({ action: 'stop' });
  });
  it('surah mode advances mid-surah', () => {
    expect(decideAfterAyah({ ...base, index: 2 })).toMatchObject({ action: 'play', index: 3 });
  });
  it('quran mode continues into the next surah', () => {
    expect(decideAfterAyah({ ...base, playMode: 'quran', index: 6, globalAyah: 7 })).toMatchObject({ action: 'nextSurah', surah: 2 });
  });
  it('juz mode stops at end of juz 1 (Al-Baqarah 141)', () => {
    expect(decideAfterAyah({ ...base, playMode: 'juz', surahNumber: 2, ayahCount: 286, index: 140, globalAyah: 148 }).action).toBe('stop');
  });
  it('juz mode crosses surahs inside the same juz', () => {
    expect(decideAfterAyah({ ...base, playMode: 'juz', index: 6, globalAyah: 7 })).toMatchObject({ action: 'nextSurah', surah: 2 });
  });
  it('ayah repeat plays the same ayah repeatCount times then advances', () => {
    expect(decideAfterAyah({ ...base, repeatMode: 'single', currentRepeat: 1 })).toMatchObject({ action: 'play', index: 0, nextRepeat: 2 });
    expect(decideAfterAyah({ ...base, repeatMode: 'single', currentRepeat: 2 })).toMatchObject({ action: 'play', index: 1, nextRepeat: 0 });
  });
  it('ayah repeat with single mode stops after the repeats', () => {
    expect(decideAfterAyah({ ...base, playMode: 'single', repeatMode: 'single', currentRepeat: 2 }).action).toBe('stop');
  });
  it('range repeat loops then stops', () => {
    const r = { ...base, repeatMode: 'range' as const, rangeStart: 2, rangeEnd: 4 };
    expect(decideAfterAyah({ ...r, index: 3, currentRepeat: 0 })).toMatchObject({ action: 'play', index: 1, nextRepeat: 1 });
    expect(decideAfterAyah({ ...r, index: 3, currentRepeat: 2 }).action).toBe('stop');
  });
});

describe('reciter audio', () => {
  it('default reciter is Al-Husary', () => {
    expect(DEFAULT_RECITER_ID).toBe('ar.husary');
  });
  it('builds surah/ayah file names from global numbers', () => {
    const r = getReciterById('ar.shuraym')!;
    expect(getAyahAudioUrl(r, 8)).toBe('https://everyayah.com/data/Saood_ash-Shuraym_128kbps/002001.mp3');
    expect(getAyahAudioUrl(r, 6236)).toMatch(/114006\.mp3$/);
  });
});
