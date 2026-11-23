import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { getVerifiedReciters, getAyahAudioUrl, DEFAULT_RECITER_ID, type Reciter } from '@/data/reciters';
import { toast } from 'sonner';
import { surahs } from '@/data/surahs';
import { getAyahsBySurahAsync } from '@/data/quranAyats';
import { decideAfterAyah, type PlayMode, type RepeatMode } from '@/lib/playbackRules';

export type { PlayMode, RepeatMode };

interface AyahInfo { number: number; numberInSurah: number; text: string; }
interface SurahInfo { number: number; name: string; ayahs: AyahInfo[]; }

interface GlobalAudioState {
  isPlaying: boolean;
  isLoading: boolean;
  currentSurah: SurahInfo | null;
  currentAyahIndex: number;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  selectedReciter: Reciter;
  isExpanded: boolean;
  isVisible: boolean;
  repeatMode: RepeatMode;
  repeatCount: number;
  currentRepeat: number;
  rangeStart: number;
  rangeEnd: number;
  playMode: PlayMode;
  error: string | null;
}

interface GlobalAudioContextType extends GlobalAudioState {
  playSurah: (surah: SurahInfo, startIndex?: number) => void;
  playAyah: (surah: SurahInfo, ayahIndex: number) => void;
  togglePlayPause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  setReciter: (reciter: Reciter) => void;
  setExpanded: (expanded: boolean) => void;
  close: () => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setRepeatCount: (count: number) => void;
  setRangeStart: (start: number) => void;
  setRangeEnd: (end: number) => void;
  setPlayMode: (mode: PlayMode) => void;
  cycleRepeatMode: () => void;
  downloadAyah: (ayahNumber: number, surahName: string, ayahNumberInSurah: number) => void;
}

const GlobalAudioContext = createContext<GlobalAudioContextType | null>(null);

export const useGlobalAudio = () => {
  const context = useContext(GlobalAudioContext);
  if (!context) throw new Error('useGlobalAudio must be used within GlobalAudioProvider');
  return context;
};

const RECITER_KEY = 'selectedReciter';
const PLAYMODE_KEY = 'audioPlayMode';

const getInitialReciter = (): Reciter => {
  const list = getVerifiedReciters();
  try {
    const stored = localStorage.getItem(RECITER_KEY);
    const found = stored && list.find((r) => r.id === stored);
    if (found) return found;
  } catch { /* ignore */ }
  return list.find((r) => r.id === DEFAULT_RECITER_ID) ?? list[0];
};

const getInitialPlayMode = (): PlayMode => {
  try {
    const v = localStorage.getItem(PLAYMODE_KEY);
    if (v === 'single' || v === 'surah' || v === 'juz' || v === 'quran') return v;
  } catch { /* ignore */ }
  return 'surah';
};

export const GlobalAudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<SurahInfo | null>(null);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(getInitialReciter);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>('none');
  const [repeatCount, setRepeatCount] = useState(3);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [playMode, setPlayModeState] = useState<PlayMode>(getInitialPlayMode);
  const [error, setError] = useState<string | null>(null);

  // Single audio element for the whole app (keeps playing in background tabs).
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!audioRef.current && typeof Audio !== 'undefined') {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
  }

  // Live mirror of state for event handlers (avoids stale closures).
  const live = useRef({
    currentSurah, currentAyahIndex, repeatMode, repeatCount, currentRepeat,
    rangeStart, rangeEnd, playMode, selectedReciter,
  });
  live.current = {
    currentSurah, currentAyahIndex, repeatMode, repeatCount, currentRepeat,
    rangeStart, rangeEnd, playMode, selectedReciter,
  };
  const playTokenRef = useRef(0);
  const retryRef = useRef(0);

  const preload = useCallback((surah: SurahInfo, fromIndex: number, reciter: Reciter) => {
    for (let i = fromIndex; i < Math.min(fromIndex + 2, surah.ayahs.length); i++) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = getAyahAudioUrl(reciter, surah.ayahs[i].number);
    }
  }, []);

  /** Core: play the ayah at `index` of `surah`. Everything goes through here. */
  const startAyah = useCallback(async (surah: SurahInfo, index: number, reciter?: Reciter) => {
    const audio = audioRef.current;
    const ayah = surah.ayahs[index];
    if (!audio || !ayah) return;
    const r = reciter ?? live.current.selectedReciter;
    const token = ++playTokenRef.current;
    live.current.currentSurah = surah;
    live.current.currentAyahIndex = index;
    setCurrentSurah(surah);
    setCurrentAyahIndex(index);
    setIsVisible(true);
    setError(null);
    setIsLoading(true);
    setProgress(0);
    audio.src = getAyahAudioUrl(r, ayah.number);
    try {
      await audio.play();
      if (token !== playTokenRef.current) return;
      retryRef.current = 0;
      setIsPlaying(true);
      preload(surah, index + 1, r);
    } catch (e) {
      if (token !== playTokenRef.current) return;
      if ((e as DOMException)?.name === 'AbortError') return;
      console.error('Audio play failed', e);
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [preload]);

  const loadSurah = useCallback(async (n: number): Promise<SurahInfo | null> => {
    const meta = surahs.find((s) => s.number === n);
    if (!meta) return null;
    const raw = await getAyahsBySurahAsync(n);
    return {
      number: meta.number,
      name: meta.name,
      ayahs: raw.map((a) => ({ number: a.id, numberInSurah: a.ayat_number_in_sura, text: a.text_uthmani })),
    };
  }, []);

  const handleEnded = useCallback(async () => {
    const s = live.current;
    if (!s.currentSurah) return;
    const decision = decideAfterAyah({
      surahNumber: s.currentSurah.number,
      ayahCount: s.currentSurah.ayahs.length,
      index: s.currentAyahIndex,
      globalAyah: s.currentSurah.ayahs[s.currentAyahIndex].number,
      playMode: s.playMode,
      repeatMode: s.repeatMode,
      repeatCount: s.repeatCount,
      currentRepeat: s.currentRepeat,
      rangeStart: s.rangeStart,
      rangeEnd: s.rangeEnd,
    });
    setCurrentRepeat(decision.nextRepeat);
    live.current.currentRepeat = decision.nextRepeat;

    if (decision.action === 'play') {
      startAyah(s.currentSurah, decision.index);
    } else if (decision.action === 'nextSurah') {
      setIsLoading(true);
      const next = await loadSurah(decision.surah);
      if (next) startAyah(next, 0);
      else { setIsPlaying(false); setIsLoading(false); }
    } else {
      // Stop and stay on the last played ayah (no jumping back to the start).
      setIsPlaying(false);
      setIsLoading(false);
      setProgress(0);
      toast.success(decision.message);
    }
  }, [startAyah, loadSurah]);

  // Attach audio listeners once; handlers read live refs.
  const endedRef = useRef(handleEnded);
  endedRef.current = handleEnded;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => { setProgress(audio.currentTime); setDuration(audio.duration || 0); };
    const onEnded = () => endedRef.current();
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => { setIsLoading(false); setIsPlaying(true); };
    const onPause = () => { if (!audio.ended) setIsPlaying(false); };
    const onError = () => {
      if (!audio.src || audio.src === window.location.href) return;
      const s = live.current;
      if (retryRef.current < 2 && s.currentSurah) {
        retryRef.current += 1;
        setTimeout(() => s.currentSurah && startAyah(s.currentSurah, s.currentAyahIndex), 800);
        return;
      }
      retryRef.current = 0;
      setIsLoading(false);
      setIsPlaying(false);
      setError('تعذّر تشغيل الآية. تحقق من اتصال الإنترنت ثم اضغط تشغيل.');
      toast.error('تعذّر تشغيل الآية. تحقق من اتصال الإنترنت.');
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, [startAyah]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume / 100;
  }, [volume, isMuted]);

  const resetForNewSession = (surah: SurahInfo, index: number) => {
    setCurrentRepeat(0);
    live.current.currentRepeat = 0;
    if (live.current.repeatMode === 'range') {
      const n = surah.ayahs[index]?.numberInSurah ?? 1;
      setRangeStart(n); setRangeEnd(Math.min(n + 2, surah.ayahs.length));
      live.current.rangeStart = n; live.current.rangeEnd = Math.min(n + 2, surah.ayahs.length);
    }
  };

  const playSurah = useCallback((surah: SurahInfo, startIndex = 0) => {
    resetForNewSession(surah, startIndex);
    startAyah(surah, startIndex);
  }, [startAyah]);

  const playAyah = useCallback((surah: SurahInfo, ayahIndex: number) => {
    resetForNewSession(surah, ayahIndex);
    startAyah(surah, ayahIndex);
  }, [startAyah]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    const s = live.current;
    if (!audio || !s.currentSurah) return;
    if (!audio.paused) { audio.pause(); setIsPlaying(false); return; }
    if (error || !audio.src || audio.src === window.location.href || audio.ended || audio.currentTime === 0) {
      startAyah(s.currentSurah, s.currentAyahIndex);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [startAyah, error]);

  const stop = useCallback(() => {
    playTokenRef.current++;
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    setIsPlaying(false); setIsLoading(false); setProgress(0);
  }, []);

  const next = useCallback(() => {
    const s = live.current;
    if (!s.currentSurah) return;
    setCurrentRepeat(0);
    if (s.currentAyahIndex < s.currentSurah.ayahs.length - 1) startAyah(s.currentSurah, s.currentAyahIndex + 1);
  }, [startAyah]);

  const previous = useCallback(() => {
    const s = live.current;
    if (!s.currentSurah) return;
    setCurrentRepeat(0);
    if (s.currentAyahIndex > 0) startAyah(s.currentSurah, s.currentAyahIndex - 1);
  }, [startAyah]);

  const seek = useCallback((value: number) => {
    if (audioRef.current) { audioRef.current.currentTime = value; setProgress(value); }
  }, []);

  const setVolume = useCallback((value: number) => { setVolumeState(value); setIsMuted(false); }, []);
  const toggleMute = useCallback(() => setIsMuted((p) => !p), []);

  const setReciter = useCallback((reciter: Reciter) => {
    try { localStorage.setItem(RECITER_KEY, reciter.id); } catch { /* ignore */ }
    setSelectedReciter(reciter);
    live.current.selectedReciter = reciter;
    const audio = audioRef.current;
    const s = live.current;
    // If something is playing, continue the same ayah with the new reciter.
    if (audio && !audio.paused && s.currentSurah) startAyah(s.currentSurah, s.currentAyahIndex, reciter);
  }, [startAyah]);

  const setPlayMode = useCallback((mode: PlayMode) => {
    try { localStorage.setItem(PLAYMODE_KEY, mode); } catch { /* ignore */ }
    setPlayModeState(mode);
    // Range repeat has its own end; picking a play mode switches range off.
    if (live.current.repeatMode === 'range') setRepeatModeState('none');
  }, []);

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode);
    setCurrentRepeat(0);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    const s = live.current;
    setCurrentRepeat(0);
    if (s.repeatMode === 'none') setRepeatModeState('single');
    else if (s.repeatMode === 'single') {
      setRepeatModeState('range');
      if (s.currentSurah) {
        const n = s.currentSurah.ayahs[s.currentAyahIndex]?.numberInSurah || 1;
        setRangeStart(n);
        setRangeEnd(Math.min(n + 2, s.currentSurah.ayahs.length));
      }
    } else setRepeatModeState('none');
  }, []);

  const downloadAyah = useCallback(async (ayahNumber: number, surahName: string, ayahNumberInSurah: number) => {
    const reciter = live.current.selectedReciter;
    try {
      toast.info('جاري تحميل الآية...');
      const response = await fetch(getAyahAudioUrl(reciter, ayahNumber));
      if (!response.ok) throw new Error('Failed to fetch');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${surahName}_آية_${ayahNumberInSurah}_${reciter.nameArabic}.mp3`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('تم تحميل الآية بنجاح');
    } catch (e) {
      console.error('Download error:', e);
      toast.error('فشل تحميل الآية. تحقق من الاتصال وجرب مرة أخرى.');
    }
  }, []);

  const close = useCallback(() => {
    stop();
    setIsVisible(false); setCurrentSurah(null); setCurrentAyahIndex(0); setIsExpanded(false);
  }, [stop]);

  // Lock-screen / notification controls so playback keeps going outside the app.
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSurah) return;
    const ayah = currentSurah.ayahs[currentAyahIndex];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${currentSurah.name} · آية ${ayah?.numberInSurah ?? ''}`,
        artist: selectedReciter.nameArabic,
        album: 'نور الفرقان',
        artwork: [{ src: '/favicon.ico', sizes: '64x64' }],
      });
      navigator.mediaSession.setActionHandler('play', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('pause', () => togglePlayPause());
      navigator.mediaSession.setActionHandler('nexttrack', () => next());
      navigator.mediaSession.setActionHandler('previoustrack', () => previous());
    } catch { /* unsupported */ }
  }, [currentSurah, currentAyahIndex, selectedReciter, togglePlayPause, next, previous]);

  const value: GlobalAudioContextType = {
    isPlaying, isLoading, currentSurah, currentAyahIndex, progress, duration, volume, isMuted,
    selectedReciter, isExpanded, isVisible, repeatMode, repeatCount, currentRepeat, rangeStart,
    rangeEnd, playMode, error, playSurah, playAyah, togglePlayPause, stop, next, previous, seek,
    setVolume, toggleMute, setReciter, setExpanded: setIsExpanded, close, setRepeatMode,
    setRepeatCount, setRangeStart, setRangeEnd, setPlayMode, cycleRepeatMode, downloadAyah,
  };

  return <GlobalAudioContext.Provider value={value}>{children}</GlobalAudioContext.Provider>;
};
