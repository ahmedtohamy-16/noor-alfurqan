import { getJuzOfAyah } from '@/data/juzData';

export type PlayMode = 'single' | 'surah' | 'juz' | 'quran';
export type RepeatMode = 'none' | 'single' | 'range';

export interface AfterAyahInput {
  surahNumber: number;
  ayahCount: number;
  index: number; // 0-based index in surah
  globalAyah: number; // 1..6236
  playMode: PlayMode;
  repeatMode: RepeatMode;
  repeatCount: number;
  currentRepeat: number; // 0-based: how many extra plays already done
  rangeStart: number; // 1-based
  rangeEnd: number; // 1-based
}

export type AfterAyahDecision =
  | { action: 'play'; index: number; nextRepeat: number }
  | { action: 'nextSurah'; surah: number; nextRepeat: number }
  | { action: 'stop'; message: string; nextRepeat: number };

/**
 * Decide what happens when an ayah finishes.
 * - Ayah repeat: each ayah plays `repeatCount` times, then the play mode decides.
 * - Range repeat: the range plays `repeatCount` times then stops (overrides play mode).
 * - Play mode sets where playback stops: one ayah, end of surah, end of juz, end of Quran.
 */
export function decideAfterAyah(i: AfterAyahInput): AfterAyahDecision {
  const times = Math.max(1, i.repeatCount);

  if (i.repeatMode === 'range') {
    const start = Math.max(1, Math.min(i.rangeStart, i.ayahCount)) - 1;
    const end = Math.max(start, Math.min(i.rangeEnd, i.ayahCount) - 1);
    if (i.index < end && i.index >= start) return { action: 'play', index: i.index + 1, nextRepeat: i.currentRepeat };
    if (i.currentRepeat + 1 < times) return { action: 'play', index: start, nextRepeat: i.currentRepeat + 1 };
    return { action: 'stop', message: 'انتهى تكرار المجموعة', nextRepeat: 0 };
  }

  if (i.repeatMode === 'single' && i.currentRepeat + 1 < times) {
    return { action: 'play', index: i.index, nextRepeat: i.currentRepeat + 1 };
  }

  if (i.playMode === 'single') return { action: 'stop', message: 'انتهت الآية', nextRepeat: 0 };

  const isLastInSurah = i.index >= i.ayahCount - 1;

  if (i.playMode === 'juz') {
    const currJuz = getJuzOfAyah(i.globalAyah);
    if (i.globalAyah >= 6236 || getJuzOfAyah(i.globalAyah + 1) !== currJuz) {
      return { action: 'stop', message: 'انتهى الجزء', nextRepeat: 0 };
    }
    if (isLastInSurah) return { action: 'nextSurah', surah: i.surahNumber + 1, nextRepeat: 0 };
    return { action: 'play', index: i.index + 1, nextRepeat: 0 };
  }

  if (!isLastInSurah) return { action: 'play', index: i.index + 1, nextRepeat: 0 };

  if (i.playMode === 'quran') {
    if (i.surahNumber < 114) return { action: 'nextSurah', surah: i.surahNumber + 1, nextRepeat: 0 };
    return { action: 'stop', message: 'تم ختم القرآن الكريم', nextRepeat: 0 };
  }
  return { action: 'stop', message: 'انتهت السورة', nextRepeat: 0 };
}
