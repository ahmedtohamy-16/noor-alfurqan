import { useState, useRef, useEffect, useCallback } from "react";
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

interface AudioPlayerProps {
  surahNumber: number;
  ayahs: { number: number; numberInSurah: number; text: string }[];
  surahName: string;
}

const AudioPlayer = ({ surahNumber, ayahs, surahName }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    // Reset when surah or reciter changes
    setCurrentAyahIndex(0);
    setIsPlaying(false);
    setProgress(0);
  }, [surahNumber, selectedReciter.id]);

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
      if (isPlaying) {
        playAyah(nextIndex);
      }
    }
  };

  const handlePrevious = () => {
    if (currentAyahIndex > 0) {
      const prevIndex = currentAyahIndex - 1;
      setCurrentAyahIndex(prevIndex);
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
    if (currentAyahIndex < ayahs.length - 1) {
      const nextIndex = currentAyahIndex + 1;
      setCurrentAyahIndex(nextIndex);
      playAyah(nextIndex);
    } else {
      setIsPlaying(false);
      setCurrentAyahIndex(0);
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
      setSelectedReciter(reciter);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
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
                    الآية {currentAyah.numberInSurah}
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
                {currentAyah?.numberInSurah || 1} من {ayahs.length}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
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
};

export default AudioPlayer;
