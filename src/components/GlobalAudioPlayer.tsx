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
    setRepeatMode,
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

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num
      .toString()
      .split('')
      .map((digit) => arabicNumbers[parseInt(digit)])
      .join('');
  };

  const handleReciterChange = (reciterId: string) => {
    // Only allow reciter change when not playing
    if (isPlaying) return;
    
    const reciter = reciters.find((r) => r.id === reciterId);
    if (reciter) {
      setReciter(reciter);
    }
  };

  const handleDownloadSurah = () => {
    setDownloadType('surah');
    setDownloadAyahNumber(null);
    setShowDownloadDialog(true);
  };

  const handleDownloadAyah = (ayahNumber: number) => {
    setDownloadType('ayah');
    setDownloadAyahNumber(ayahNumber);
    setShowDownloadDialog(true);
  };

  return (
    <>
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl transition-all duration-300 z-50 arabic-ui',
          isExpanded ? 'h-auto' : 'h-20'
        )}
      >
        <div className="container mx-auto px-4">
          {/* Close Button */}
          <button
            onClick={close}
            className="absolute top-2 left-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setExpanded(!isExpanded)}
            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg hover:bg-primary/90 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          {/* Expanded View */}
          {isExpanded && (
            <div className="py-4 space-y-4 border-b border-border pt-8">
              {/* Reciter Selection */}
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">القارئ:</span>
                <Select
                  value={selectedReciter.id}
                  onValueChange={handleReciterChange}
                  disabled={isPlaying}
                >
                  <SelectTrigger className={cn(
                    "w-full max-w-xs",
                    isPlaying && "opacity-50 cursor-not-allowed"
                  )}>
                    <SelectValue placeholder="اختر القارئ" />
                  </SelectTrigger>
                  <SelectContent>
                    {reciters.map((reciter) => (
                      <SelectItem 
                        key={reciter.id} 
                        value={reciter.id}
                        disabled={isPlaying && reciter.id !== selectedReciter.id}
                        className={cn(
                          isPlaying && reciter.id !== selectedReciter.id && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        {reciter.nameArabic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isPlaying && (
                  <span className="text-xs text-muted-foreground">(أوقف الصوت لتغيير القارئ)</span>
                )}
              </div>

              {/* Play Mode Selection */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm text-muted-foreground">وضع التشغيل:</span>
                <Select value={playMode} onValueChange={(v) => setPlayMode(v as 'single' | 'surah')}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">آية واحدة فقط</SelectItem>
                    <SelectItem value="surah">إلى نهاية السورة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Repeat Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant={repeatMode !== 'none' ? 'default' : 'outline'}
                  size="sm"
                  onClick={cycleRepeatMode}
                  className="gap-2"
                >
                  {repeatMode === 'single' ? (
                    <Repeat1 className="w-4 h-4" />
                  ) : (
                    <Repeat className="w-4 h-4" />
                  )}
                  {repeatMode === 'none' && 'تكرار'}
                  {repeatMode === 'single' && 'تكرار آية'}
                  {repeatMode === 'range' && 'تكرار مجموعة'}
                </Button>

                {repeatMode !== 'none' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">عدد التكرار:</span>
                    <Select
                      value={repeatCount.toString()}
                      onValueChange={(val) => setRepeatCount(parseInt(val))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 7, 10, 15, 20].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {convertToArabicNumber(num)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {repeatMode === 'range' && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">من آية:</span>
                    <Select
                      value={rangeStart.toString()}
                      onValueChange={(val) => {
                        const start = parseInt(val);
                        setRangeStart(start);
                        if (start > rangeEnd) setRangeEnd(start);
                      }}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSurah.ayahs.map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {convertToArabicNumber(i + 1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">إلى آية:</span>
                    <Select
                      value={rangeEnd.toString()}
                      onValueChange={(val) => setRangeEnd(parseInt(val))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSurah.ayahs.slice(rangeStart - 1).map((_, i) => (
                          <SelectItem key={rangeStart + i} value={(rangeStart + i).toString()}>
                            {convertToArabicNumber(rangeStart + i)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {repeatMode !== 'none' && currentRepeat > 0 && (
                  <span className="text-sm text-primary font-medium">
                    التكرار {convertToArabicNumber(currentRepeat + 1)} من {convertToArabicNumber(repeatCount)}
                  </span>
                )}
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={toggleMute}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setVolume(value[0])}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground w-10">
                  {isMuted ? 0 : volume}%
                </span>
              </div>

              {/* Download Button */}
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSurah}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  تحميل السورة كاملة
                </Button>
              </div>

              {/* Current Ayah Preview */}
              {currentAyah && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">
                      الآية {convertToArabicNumber(currentAyah.numberInSurah)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadAyah(currentAyah.number)}
                      className="h-6 px-2"
                    >
                      <Download className="w-3 h-3 ml-1" />
                      تحميل
                    </Button>
                  </div>
                  <p className="font-quran text-lg leading-relaxed line-clamp-2">
                    {currentAyah.text}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Compact Player */}
          <div className="flex items-center gap-4 py-3">
            {/* Surah Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {currentSurah.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedReciter.nameArabic} • الآية{' '}
                {currentAyah ? convertToArabicNumber(currentAyah.numberInSurah) : '١'} من {convertToArabicNumber(currentSurah.ayahs.length)}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Repeat indicator */}
              {repeatMode !== 'none' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cycleRepeatMode}
                  className="text-primary"
                >
                  {repeatMode === 'single' ? (
                    <Repeat1 className="w-5 h-5" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={previous}
                disabled={currentAyahIndex === 0}
              >
                <SkipForward className="w-5 h-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="w-12 h-12 rounded-full"
                onClick={togglePlayPause}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
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
              >
                <SkipBack className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress (Desktop) */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs">
              <span className="text-xs text-muted-foreground w-10 text-left">
                {formatTime(progress)}
              </span>
              <Slider
                value={[progress]}
                max={duration || 100}
                step={0.1}
                onValueChange={(value) => seek(value[0])}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Progress Bar (Mobile) */}
          <div className="md:hidden pb-2">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => seek(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Download Dialog */}
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
