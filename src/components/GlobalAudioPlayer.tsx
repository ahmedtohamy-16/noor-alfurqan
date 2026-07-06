import { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  X,
  User,
  Repeat,
  Repeat1,
  Download,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { reciters } from '@/data/reciters';
import { cn } from '@/lib/utils';
import { useGlobalAudio } from '@/hooks/useGlobalAudio';
import { DownloadAudioDialog } from './DownloadAudioDialog';

type PlayMode = 'single' | 'surah' | 'juz' | 'quran';

const GlobalAudioPlayer = () => {
  const {
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
    togglePlayPause,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    setReciter,
    setExpanded,
    close,
    setRepeatCount,
    setRangeStart,
    setRangeEnd,
    setPlayMode,
    cycleRepeatMode,
  } = useGlobalAudio();

  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadType, setDownloadType] = useState<'surah' | 'ayah'>('surah');
  const [downloadAyahNumber, setDownloadAyahNumber] = useState<number | null>(null);

  if (!isVisible || !currentSurah) return null;

  const currentAyah = currentSurah.ayahs[currentAyahIndex];

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toArabic = (num: number): string =>
    num.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);

  const handleReciterChange = (reciterId: string) => {
    if (isPlaying) return;
    const reciter = reciters.find((r) => r.id === reciterId);
    if (reciter) setReciter(reciter);
  };

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      {/* MINI BAR (collapsed) — ultra-slim, non-intrusive */}
      {!isExpanded && (
        <div
          dir="rtl"
          className="fixed left-0 right-0 bottom-16 md:bottom-0 z-30 arabic-ui pointer-events-none"
        >
          {/* Expand handle */}
          <button
            onClick={() => setExpanded(true)}
            aria-label="فتح المشغل"
            className="pointer-events-auto absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-8 h-8 shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <div className="pointer-events-auto mx-auto max-w-2xl bg-card/90 backdrop-blur-xl border-t border-border/60 shadow-lg">
            {/* Thin top progress line */}
            <div className="h-0.5 w-full bg-muted/40 relative overflow-hidden">
              <div
                className="absolute inset-y-0 right-0 bg-primary transition-[width] duration-200"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5">
              <button
                onClick={close}
                aria-label="إغلاق"
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
                disabled={isLoading}
                className="shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm active:scale-95 transition-transform"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 mr-0.5" />
                )}
              </button>

              <div className="flex-1 min-w-0 leading-tight">
                <p className="text-xs font-semibold text-foreground truncate">
                  {currentSurah.name}
                  <span className="text-muted-foreground font-normal mx-1">
                    · آية {currentAyah ? toArabic(currentAyah.numberInSurah) : '١'}
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {selectedReciter.nameArabic}
                </p>
              </div>

              <button
                onClick={next}
                disabled={currentAyahIndex >= currentSurah.ayahs.length - 1}
                aria-label="التالي"
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground disabled:opacity-30"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDED PANEL */}
      {isExpanded && (
        <div
          dir="rtl"
          className="fixed left-0 right-0 bottom-16 md:bottom-0 z-30 arabic-ui"
        >
          <button
            onClick={() => setExpanded(false)}
            aria-label="طي المشغل"
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-8 h-8 shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <div className="mx-auto max-w-2xl bg-card/95 backdrop-blur-xl border-t border-border shadow-2xl rounded-t-2xl overflow-hidden">
            {/* Header: surah + close */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">تشغيل الآن</p>
                <h3 className="font-quran text-2xl font-bold text-foreground truncate">
                  {currentSurah.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {selectedReciter.nameArabic}
                  {currentAyah && (
                    <> · الآية {toArabic(currentAyah.numberInSurah)} من {toArabic(currentSurah.ayahs.length)}</>
                  )}
                </p>
              </div>
              <button
                onClick={close}
                aria-label="إغلاق"
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Ayah Preview */}
            {currentAyah && (
              <div className="mx-5 mb-3 rounded-xl bg-muted/40 border border-border/40 px-4 py-3">
                <p className="font-quran text-lg leading-loose text-foreground/90 line-clamp-2 text-right">
                  {currentAyah.text}
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="px-5">
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(value) => seek(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1 tabular-nums" dir="ltr">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-center gap-4 py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleRepeatMode}
                className={cn('rounded-full', repeatMode !== 'none' && 'text-primary')}
                aria-label="تكرار"
              >
                {repeatMode === 'single' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={previous}
                disabled={currentAyahIndex === 0}
                className="rounded-full"
                aria-label="السابقة"
              >
                <SkipForward className="w-6 h-6" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="w-14 h-14 rounded-full shadow-lg shadow-primary/30 active:scale-95 transition-transform"
                onClick={togglePlayPause}
                disabled={isLoading}
                aria-label={isPlaying ? 'إيقاف' : 'تشغيل'}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={next}
                disabled={currentAyahIndex === currentSurah.ayahs.length - 1}
                className="rounded-full"
                aria-label="التالية"
              >
                <SkipBack className="w-6 h-6" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="rounded-full"
                aria-label="كتم الصوت"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
            </div>

            {/* Settings row */}
            <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
              {/* Reciter */}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground shrink-0">القارئ</span>
                <Select
                  value={selectedReciter.id}
                  onValueChange={handleReciterChange}
                  disabled={isPlaying}
                >
                  <SelectTrigger className={cn('h-9 text-sm flex-1', isPlaying && 'opacity-60 cursor-not-allowed')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reciters.map((reciter) => (
                      <SelectItem key={reciter.id} value={reciter.id}>
                        {reciter.nameArabic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isPlaying && (
                <p className="text-[11px] text-muted-foreground -mt-1 pr-6">
                  أوقف الصوت لتغيير القارئ
                </p>
              )}

              {/* Play mode */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground shrink-0">وضع التشغيل</span>
                <Select value={playMode} onValueChange={(v) => setPlayMode(v as PlayMode)}>
                  <SelectTrigger className="h-9 text-sm flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">آية واحدة فقط</SelectItem>
                    <SelectItem value="surah">إلى نهاية السورة</SelectItem>
                    <SelectItem value="juz">إلى نهاية الجزء</SelectItem>
                    <SelectItem value="quran">إلى نهاية القرآن (متواصل)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Repeat controls */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={repeatMode !== 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={cycleRepeatMode}
                  className="gap-1.5 h-9"
                >
                  {repeatMode === 'single' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  {repeatMode === 'none' && 'بدون تكرار'}
                  {repeatMode === 'single' && 'تكرار آية'}
                  {repeatMode === 'range' && 'تكرار مجموعة'}
                </Button>

                {repeatMode !== 'none' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">عدد المرات</span>
                    <Select value={repeatCount.toString()} onValueChange={(v) => setRepeatCount(parseInt(v))}>
                      <SelectTrigger className="h-9 w-20 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 7, 10, 15, 20].map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {toArabic(n)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {repeatMode !== 'none' && currentRepeat > 0 && (
                  <span className="text-xs text-primary font-medium">
                    {toArabic(currentRepeat + 1)}/{toArabic(repeatCount)}
                  </span>
                )}
              </div>

              {repeatMode === 'range' && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">من</span>
                  <Select
                    value={rangeStart.toString()}
                    onValueChange={(v) => {
                      const s = parseInt(v);
                      setRangeStart(s);
                      if (s > rangeEnd) setRangeEnd(s);
                    }}
                  >
                    <SelectTrigger className="h-9 w-20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentSurah.ayahs.map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {toArabic(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">إلى</span>
                  <Select value={rangeEnd.toString()} onValueChange={(v) => setRangeEnd(parseInt(v))}>
                    <SelectTrigger className="h-9 w-20 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentSurah.ayahs.slice(rangeStart - 1).map((_, i) => (
                        <SelectItem key={rangeStart + i} value={(rangeStart + i).toString()}>
                          {toArabic(rangeStart + i)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Volume */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 tabular-nums text-left">
                  {isMuted ? 0 : volume}%
                </span>
              </div>

              {/* Download */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setDownloadType('surah'); setDownloadAyahNumber(null); setShowDownloadDialog(true); }}
                className="w-full gap-2 h-9"
              >
                <Download className="w-4 h-4" />
                تحميل السورة كاملة
              </Button>
            </div>
          </div>
        </div>
      )}

      <DownloadAudioDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        surahNumber={currentSurah.number}
        surahName={currentSurah.name}
        ayahNumber={downloadAyahNumber}
        downloadType={downloadType}
      />
    </>
  );
};

export default GlobalAudioPlayer;
