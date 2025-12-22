import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  User,
  Repeat,
  Repeat1,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reciters, type Reciter } from "@/data/reciters";
import { cn } from "@/lib/utils";

type RepeatMode = "none" | "single" | "range";

interface AudioPlayerProps {
  surahNumber: number;
  ayahs: { number: number; numberInSurah: number; text: string }[];
  surahName: string;
}

export interface AudioPlayerHandle {
  playSpecificAyah: (ayahIndex: number) => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(
  ({ surahNumber, ayahs, surahName }, ref) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[0]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Repeat functionality
    const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
    const [repeatCount, setRepeatCount] = useState(1);
    const [currentRepeat, setCurrentRepeat] = useState(0);
    const [rangeStart, setRangeStart] = useState(1);
    const [rangeEnd, setRangeEnd] = useState(1);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const wasPlayingRef = useRef(false);
    const pendingPlayRef = useRef<number | null>(null);

    const currentAyah = ayahs[currentAyahIndex];

    const getAudioUrl = useCallback(
      (ayahNumber: number) => {
        return `${selectedReciter.server}/${ayahNumber}.mp3`;
      },
      [selectedReciter]
    );

    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : volume / 100;
      }
    }, [volume, isMuted]);

    // Handle surah change - reset state
    useEffect(() => {
      setCurrentAyahIndex(0);
      setIsPlaying(false);
      setProgress(0);
      setRangeEnd(ayahs.length);
      wasPlayingRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }, [surahNumber, ayahs.length]);

    // Handle reciter change - preserve playing state
    useEffect(() => {
      if (pendingPlayRef.current !== null) {
        const indexToPlay = pendingPlayRef.current;
        pendingPlayRef.current = null;
        
        // Small delay to ensure state is updated
        setTimeout(() => {
          playAyah(indexToPlay);
        }, 50);
      }
    }, [selectedReciter.id]);

    const playAyah = useCallback(
      async (index: number) => {
        if (!ayahs[index]) return;

        setIsLoading(true);
        const ayah = ayahs[index];
        const url = getAudioUrl(ayah.number);

        if (audioRef.current) {
          audioRef.current.src = url;
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (error) {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          }
        }
        setIsLoading(false);
      },
      [ayahs, getAudioUrl]
    );

    // Expose playSpecificAyah to parent component
    useImperativeHandle(ref, () => ({
      playSpecificAyah: (ayahIndex: number) => {
        setCurrentAyahIndex(ayahIndex);
        setCurrentRepeat(0);
        playAyah(ayahIndex);
      },
    }), [playAyah]);

    const handlePlayPause = () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (!audioRef.current.src || audioRef.current.src === window.location.href) {
          playAyah(currentAyahIndex);
        } else {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    };

    const handleNext = () => {
      if (currentAyahIndex < ayahs.length - 1) {
        const nextIndex = currentAyahIndex + 1;
        setCurrentAyahIndex(nextIndex);
        setCurrentRepeat(0);
        if (isPlaying) {
          playAyah(nextIndex);
        }
      }
    };

    const handlePrevious = () => {
      if (currentAyahIndex > 0) {
        const prevIndex = currentAyahIndex - 1;
        setCurrentAyahIndex(prevIndex);
        setCurrentRepeat(0);
        if (isPlaying) {
          playAyah(prevIndex);
        }
      }
    };

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
      }
    };

    const handleEnded = () => {
      // Handle repeat logic
      if (repeatMode === "single") {
        if (currentRepeat < repeatCount - 1) {
          setCurrentRepeat((prev) => prev + 1);
          playAyah(currentAyahIndex);
          return;
        } else {
          setCurrentRepeat(0);
          // Move to next ayah after completing repeats
          if (currentAyahIndex < ayahs.length - 1) {
            const nextIndex = currentAyahIndex + 1;
            setCurrentAyahIndex(nextIndex);
            playAyah(nextIndex);
          } else {
            setIsPlaying(false);
            setCurrentAyahIndex(0);
          }
        }
      } else if (repeatMode === "range") {
        const rangeStartIndex = rangeStart - 1;
        const rangeEndIndex = rangeEnd - 1;

        if (currentAyahIndex < rangeEndIndex) {
          const nextIndex = currentAyahIndex + 1;
          setCurrentAyahIndex(nextIndex);
          playAyah(nextIndex);
        } else {
          // End of range, check repeat count
          if (currentRepeat < repeatCount - 1) {
            setCurrentRepeat((prev) => prev + 1);
            setCurrentAyahIndex(rangeStartIndex);
            playAyah(rangeStartIndex);
          } else {
            setCurrentRepeat(0);
            setIsPlaying(false);
            setCurrentAyahIndex(rangeStartIndex);
          }
        }
      } else {
        // Normal playback
        if (currentAyahIndex < ayahs.length - 1) {
          const nextIndex = currentAyahIndex + 1;
          setCurrentAyahIndex(nextIndex);
          playAyah(nextIndex);
        } else {
          setIsPlaying(false);
          setCurrentAyahIndex(0);
        }
      }
    };

    const handleSeek = (value: number[]) => {
      if (audioRef.current) {
        audioRef.current.currentTime = value[0];
        setProgress(value[0]);
      }
    };

    const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleReciterChange = (reciterId: string) => {
      const reciter = reciters.find((r) => r.id === reciterId);
      if (reciter) {
        const wasPlaying = isPlaying;
        const currentIndex = currentAyahIndex;
        
        // Pause current audio
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        
        // Set the new reciter
        setSelectedReciter(reciter);
        
        // If was playing, schedule to resume with new reciter
        if (wasPlaying) {
          pendingPlayRef.current = currentIndex;
        }
      }
    };

    const cycleRepeatMode = () => {
      if (repeatMode === "none") {
        setRepeatMode("single");
      } else if (repeatMode === "single") {
        setRepeatMode("range");
        setRangeStart(currentAyah?.numberInSurah || 1);
        setRangeEnd(Math.min((currentAyah?.numberInSurah || 1) + 2, ayahs.length));
      } else {
        setRepeatMode("none");
        setCurrentRepeat(0);
      }
    };

    const convertToArabicNumber = (num: number): string => {
      const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
      return num
        .toString()
        .split("")
        .map((digit) => arabicNumbers[parseInt(digit)])
        .join("");
    };

    return (
      <>
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadStart={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        />

        {/* Fixed Bottom Player */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl transition-all duration-300 z-50 arabic-ui",
            isExpanded ? "h-auto" : "h-20"
          )}
        >
          <div className="container mx-auto px-4">
            {/* Expand/Collapse Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
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
              <div className="py-4 space-y-4 border-b border-border">
                {/* Reciter Selection */}
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">القارئ:</span>
                  <Select
                    value={selectedReciter.id}
                    onValueChange={handleReciterChange}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="اختر القارئ" />
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

                {/* Repeat Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={repeatMode !== "none" ? "default" : "outline"}
                    size="sm"
                    onClick={cycleRepeatMode}
                    className="gap-2"
                  >
                    {repeatMode === "single" ? (
                      <Repeat1 className="w-4 h-4" />
                    ) : (
                      <Repeat className="w-4 h-4" />
                    )}
                    {repeatMode === "none" && "تكرار"}
                    {repeatMode === "single" && "تكرار آية"}
                    {repeatMode === "range" && "تكرار مجموعة"}
                  </Button>

                  {repeatMode !== "none" && (
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

                  {repeatMode === "range" && (
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
                          {ayahs.map((_, i) => (
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
                          {ayahs.slice(rangeStart - 1).map((_, i) => (
                            <SelectItem key={rangeStart + i} value={(rangeStart + i).toString()}>
                              {convertToArabicNumber(rangeStart + i)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {repeatMode !== "none" && currentRepeat > 0 && (
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
                    onClick={() => setIsMuted(!isMuted)}
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
                    onValueChange={(value) => {
                      setVolume(value[0]);
                      setIsMuted(false);
                    }}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground w-10">
                    {isMuted ? 0 : volume}%
                  </span>
                </div>

                {/* Current Ayah Preview */}
                {currentAyah && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">
                      الآية {convertToArabicNumber(currentAyah.numberInSurah)}
                    </p>
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
                  {surahName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedReciter.nameArabic} • الآية{" "}
                  {currentAyah ? convertToArabicNumber(currentAyah.numberInSurah) : "١"} من {convertToArabicNumber(ayahs.length)}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Repeat indicator */}
                {repeatMode !== "none" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={cycleRepeatMode}
                    className="text-primary"
                  >
                    {repeatMode === "single" ? (
                      <Repeat1 className="w-5 h-5" />
                    ) : (
                      <Repeat className="w-5 h-5" />
                    )}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevious}
                  disabled={currentAyahIndex === 0}
                >
                  <SkipForward className="w-5 h-5" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  className="w-12 h-12 rounded-full"
                  onClick={handlePlayPause}
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
                  onClick={handleNext}
                  disabled={currentAyahIndex === ayahs.length - 1}
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
                  onValueChange={handleSeek}
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
                onValueChange={handleSeek}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
);

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
