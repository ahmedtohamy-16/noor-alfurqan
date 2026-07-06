import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { reciters, getVerifiedReciters, type Reciter } from '@/data/reciters';
import { toast } from 'sonner';
import { surahs } from '@/data/surahs';
import { getAyahsBySurahAsync } from '@/data/quranAyats';
import { getJuzOfAyah } from '@/data/juzData';

type RepeatMode = 'none' | 'single' | 'range';
type PlayMode = 'single' | 'surah' | 'juz' | 'quran';

interface AyahInfo {
  number: number;
  numberInSurah: number;
  text: string;
}

interface SurahInfo {
  number: number;
  name: string;
  ayahs: AyahInfo[];
}

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
  if (!context) {
    throw new Error('useGlobalAudio must be used within GlobalAudioProvider');
  }
  return context;
};

interface GlobalAudioProviderProps {
  children: ReactNode;
}

// Number of ayahs to preload ahead for smooth playback
const PRELOAD_AHEAD_COUNT = 3;

// Helper to get initial reciter from localStorage
const getInitialReciter = (): Reciter => {
  const stored = localStorage.getItem("selectedReciter");
  if (stored) {
    const found = getVerifiedReciters().find(r => r.id === stored);
    if (found) return found;
  }
  return getVerifiedReciters()[0];
};

export const GlobalAudioProvider: React.FC<GlobalAudioProviderProps> = ({ children }) => {
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
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [repeatCount, setRepeatCount] = useState(1);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [playMode, setPlayMode] = useState<PlayMode>('surah');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingPlayRef = useRef<number | null>(null);
  
  // Enhanced preloading: cache multiple audio elements for instant switching
  const preloadCache = useRef<Map<string, HTMLAudioElement>>(new Map());
  const preloadedUrls = useRef<Set<string>>(new Set());

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplay', () => setIsLoading(false));
      audioRef.current.addEventListener('error', () => setIsLoading(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        audioRef.current.removeEventListener('ended', handleEnded);
      }
      // Cleanup preload cache
      preloadCache.current.forEach(audio => {
        audio.pause();
        audio.src = '';
      });
      preloadCache.current.clear();
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Handle reciter change - resume playback
  useEffect(() => {
    if (pendingPlayRef.current !== null && currentSurah) {
      const indexToPlay = pendingPlayRef.current;
      pendingPlayRef.current = null;
      setTimeout(() => {
        playAyahInternal(indexToPlay);
      }, 50);
    }
  }, [selectedReciter.id]);

  const getAudioUrl = useCallback((ayahNumber: number, reciter?: Reciter) => {
    const server = reciter?.server || selectedReciter.server;
    return `${server}/${ayahNumber}.mp3`;
  }, [selectedReciter]);

  // Enhanced preloading: preload multiple upcoming ayahs for instant switching
  const preloadMultipleAyahs = useCallback((startIndex: number, count: number = PRELOAD_AHEAD_COUNT) => {
    if (!currentSurah) return;
    
    for (let i = 0; i < count; i++) {
      const nextIndex = startIndex + i;
      if (nextIndex >= currentSurah.ayahs.length) break;
      
      const ayah = currentSurah.ayahs[nextIndex];
      const url = getAudioUrl(ayah.number);
      
      if (!preloadedUrls.current.has(url)) {
        const preloadAudio = new Audio();
        preloadAudio.preload = 'auto';
        preloadAudio.src = url;
        preloadAudio.load();
        
        // Store in cache for instant playback
        preloadCache.current.set(url, preloadAudio);
        preloadedUrls.current.add(url);
        
        // Clean up old entries if cache gets too large
        if (preloadCache.current.size > 10) {
          const firstKey = preloadCache.current.keys().next().value;
          if (firstKey) {
            const oldAudio = preloadCache.current.get(firstKey);
            if (oldAudio) {
              oldAudio.pause();
              oldAudio.src = '';
            }
            preloadCache.current.delete(firstKey);
            preloadedUrls.current.delete(firstKey);
          }
        }
      }
    }
  }, [currentSurah, getAudioUrl]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      
      // Aggressive preloading: start at 50% for smoother transitions
      const percentComplete = audioRef.current.duration 
        ? (audioRef.current.currentTime / audioRef.current.duration) * 100 
        : 0;
      if (percentComplete > 50 && currentSurah) {
        preloadMultipleAyahs(currentAyahIndex + 1);
      }
    }
  }, [currentSurah, currentAyahIndex, preloadMultipleAyahs]);

  const handleEnded = useCallback(() => {
    if (!currentSurah) return;

    const ayahs = currentSurah.ayahs;
    
    // Handle repeat logic
    if (repeatMode === 'single') {
      if (currentRepeat < repeatCount - 1) {
        setCurrentRepeat(prev => prev + 1);
        playAyahInternal(currentAyahIndex);
        return;
      } else {
        setCurrentRepeat(0);
        if (playMode === 'single') {
          setIsPlaying(false);
          return;
        }
        if (currentAyahIndex < ayahs.length - 1) {
          const nextIndex = currentAyahIndex + 1;
          setCurrentAyahIndex(nextIndex);
          playAyahInternal(nextIndex);
        } else {
          setIsPlaying(false);
          setCurrentAyahIndex(0);
        }
      }
    } else if (repeatMode === 'range') {
      const rangeStartIndex = rangeStart - 1;
      const rangeEndIndex = rangeEnd - 1;

      if (currentAyahIndex < rangeEndIndex) {
        const nextIndex = currentAyahIndex + 1;
        setCurrentAyahIndex(nextIndex);
        playAyahInternal(nextIndex);
      } else {
        if (currentRepeat < repeatCount - 1) {
          setCurrentRepeat(prev => prev + 1);
          setCurrentAyahIndex(rangeStartIndex);
          playAyahInternal(rangeStartIndex);
        } else {
          setCurrentRepeat(0);
          setIsPlaying(false);
          setCurrentAyahIndex(rangeStartIndex);
        }
      }
    } else {
      if (playMode === 'single') {
        setIsPlaying(false);
        return;
      }
      
      if (currentAyahIndex < ayahs.length - 1) {
        const nextIndex = currentAyahIndex + 1;
        setCurrentAyahIndex(nextIndex);
        playAyahInternal(nextIndex);
      } else {
        setIsPlaying(false);
        setCurrentAyahIndex(0);
      }
    }
  }, [currentSurah, currentAyahIndex, repeatMode, repeatCount, currentRepeat, playMode, rangeStart, rangeEnd]);

  // Re-attach ended handler when dependencies change
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.removeEventListener('ended', handleEnded);
      audio.addEventListener('ended', handleEnded);
    }
  }, [handleEnded]);

  const playAyahInternal = useCallback(async (index: number) => {
    if (!currentSurah || !currentSurah.ayahs[index]) return;

    const ayah = currentSurah.ayahs[index];
    const url = getAudioUrl(ayah.number);

    // Check if audio is already preloaded in cache for instant playback
    const cachedAudio = preloadCache.current.get(url);
    
    if (cachedAudio && cachedAudio.readyState >= 3) {
      // Use cached audio for instant playback
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = cachedAudio;
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setCurrentAyahIndex(index);
        // Preload next batch
        preloadMultipleAyahs(index + 1);
      } catch (error) {
        console.error('Error playing cached audio:', error);
        setIsPlaying(false);
      }
    } else {
      // Standard playback
      setIsLoading(true);
      if (audioRef.current) {
        audioRef.current.src = url;
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setCurrentAyahIndex(index);
          // Preload next batch
          preloadMultipleAyahs(index + 1);
        } catch (error) {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        }
      }
      setIsLoading(false);
    }
  }, [currentSurah, getAudioUrl, isMuted, volume, preloadMultipleAyahs]);

  const playSurah = useCallback((surah: SurahInfo, startIndex: number = 0) => {
    setCurrentSurah(surah);
    setCurrentAyahIndex(startIndex);
    setRangeEnd(surah.ayahs.length);
    setIsVisible(true);
    setPlayMode('surah');
    setRepeatMode('none');
    setCurrentRepeat(0);
    
    // Need to wait for state to update
    setTimeout(() => {
      const ayah = surah.ayahs[startIndex];
      if (ayah && audioRef.current) {
        const url = `${selectedReciter.server}/${ayah.number}.mp3`;
        audioRef.current.src = url;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(console.error);
      }
    }, 50);
  }, [selectedReciter]);

  const playAyah = useCallback((surah: SurahInfo, ayahIndex: number) => {
    setCurrentSurah(surah);
    setCurrentAyahIndex(ayahIndex);
    setRangeEnd(surah.ayahs.length);
    setIsVisible(true);
    setPlayMode('surah');
    setCurrentRepeat(0);
    
    setTimeout(() => {
      const ayah = surah.ayahs[ayahIndex];
      if (ayah && audioRef.current) {
        const url = `${selectedReciter.server}/${ayah.number}.mp3`;
        audioRef.current.src = url;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(console.error);
      }
    }, 50);
  }, [selectedReciter]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || audioRef.current.src === window.location.href) {
        if (currentSurah && currentSurah.ayahs[currentAyahIndex]) {
          const ayah = currentSurah.ayahs[currentAyahIndex];
          audioRef.current.src = getAudioUrl(ayah.number);
        }
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying, currentSurah, currentAyahIndex, getAudioUrl]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const next = useCallback(() => {
    if (!currentSurah) return;
    if (currentAyahIndex < currentSurah.ayahs.length - 1) {
      const nextIndex = currentAyahIndex + 1;
      setCurrentAyahIndex(nextIndex);
      setCurrentRepeat(0);
      if (isPlaying) {
        const ayah = currentSurah.ayahs[nextIndex];
        if (ayah && audioRef.current) {
          audioRef.current.src = getAudioUrl(ayah.number);
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [currentSurah, currentAyahIndex, isPlaying, getAudioUrl]);

  const previous = useCallback(() => {
    if (!currentSurah) return;
    if (currentAyahIndex > 0) {
      const prevIndex = currentAyahIndex - 1;
      setCurrentAyahIndex(prevIndex);
      setCurrentRepeat(0);
      if (isPlaying) {
        const ayah = currentSurah.ayahs[prevIndex];
        if (ayah && audioRef.current) {
          audioRef.current.src = getAudioUrl(ayah.number);
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, [currentSurah, currentAyahIndex, isPlaying, getAudioUrl]);

  const seek = useCallback((value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  }, []);

  const setVolume = useCallback((value: number) => {
    setVolumeState(value);
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const setReciter = useCallback((reciter: Reciter) => {
    // Store current time position for seamless transition
    const currentTime = audioRef.current?.currentTime || 0;
    const wasPlaying = isPlaying;
    
    if (!currentSurah) {
      setSelectedReciter(reciter);
      return;
    }

    const currentAyah = currentSurah.ayahs[currentAyahIndex];
    if (!currentAyah || !audioRef.current) {
      setSelectedReciter(reciter);
      return;
    }

    // Clear old cache immediately for instant switching
    preloadCache.current.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    preloadCache.current.clear();
    preloadedUrls.current.clear();
    
    // Update reciter state FIRST for instant UI feedback
    setSelectedReciter(reciter);
    
    // Get new URL with the new reciter
    const newUrl = `${reciter.server}/${currentAyah.number}.mp3`;
    
    // Create new audio element for instant switching (avoid reusing same element)
    const newAudio = new Audio();
    newAudio.preload = 'auto';
    newAudio.volume = isMuted ? 0 : volume / 100;
    
    // Stop current audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Set up new audio with instant loading
    newAudio.src = newUrl;
    
    // Transfer event listeners to new audio
    newAudio.addEventListener('timeupdate', handleTimeUpdate);
    newAudio.addEventListener('ended', handleEnded);
    newAudio.addEventListener('loadstart', () => setIsLoading(true));
    newAudio.addEventListener('canplay', () => setIsLoading(false));
    newAudio.addEventListener('error', () => setIsLoading(false));
    
    audioRef.current = newAudio;
    
    if (wasPlaying) {
      // Use 'canplaythrough' for faster start
      newAudio.addEventListener('canplaythrough', () => {
        newAudio.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
            // Preload next ayahs for new reciter
            preloadMultipleAyahs(currentAyahIndex + 1);
          })
          .catch((err) => {
            console.error('Error switching reciter:', err);
            setIsLoading(false);
          });
      }, { once: true });
      
      // Start loading immediately
      newAudio.load();
      setIsLoading(true);
    }
  }, [isPlaying, currentAyahIndex, currentSurah, isMuted, volume, handleTimeUpdate, handleEnded, preloadMultipleAyahs]);

  const downloadAyah = useCallback(async (ayahNumber: number, surahName: string, ayahNumberInSurah: number) => {
    const url = getAudioUrl(ayahNumber);
    
    try {
      toast.info('جاري تحميل الآية...');
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${surahName}_آية_${ayahNumberInSurah}_${selectedReciter.nameArabic}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success('تم تحميل الآية بنجاح');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('فشل تحميل الآية. جرب مرة أخرى.');
    }
  }, [getAudioUrl, selectedReciter.nameArabic]);

  const setExpanded = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
  }, []);

  const close = useCallback(() => {
    stop();
    setIsVisible(false);
    setCurrentSurah(null);
    setCurrentAyahIndex(0);
    setIsExpanded(false);
  }, [stop]);

  const cycleRepeatMode = useCallback(() => {
    if (repeatMode === 'none') {
      setRepeatMode('single');
    } else if (repeatMode === 'single') {
      setRepeatMode('range');
      if (currentSurah) {
        const currentAyah = currentSurah.ayahs[currentAyahIndex];
        setRangeStart(currentAyah?.numberInSurah || 1);
        setRangeEnd(Math.min((currentAyah?.numberInSurah || 1) + 2, currentSurah.ayahs.length));
      }
    } else {
      setRepeatMode('none');
      setCurrentRepeat(0);
    }
  }, [repeatMode, currentSurah, currentAyahIndex]);

  const value: GlobalAudioContextType = {
    isPlaying,
    isLoading,
    currentSurah,
    currentAyahIndex,
    progress,
    duration,
    volume,
    isMuted,
    selectedReciter,
    isExpanded,
    isVisible,
    repeatMode,
    repeatCount,
    currentRepeat,
    rangeStart,
    rangeEnd,
    playMode,
    playSurah,
    playAyah,
    togglePlayPause,
    stop,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setReciter,
    setExpanded,
    close,
    setRepeatMode,
    setRepeatCount,
    setRangeStart,
    setRangeEnd,
    setPlayMode,
    cycleRepeatMode,
    downloadAyah,
  };

  return (
    <GlobalAudioContext.Provider value={value}>
      {children}
    </GlobalAudioContext.Provider>
  );
};
