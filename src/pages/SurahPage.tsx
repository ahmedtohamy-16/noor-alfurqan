import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Headphones, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { surahs } from "@/data/surahs";
import Header from "@/components/Header";
import AudioPlayer, { type AudioPlayerHandle } from "@/components/AudioPlayer";
import TafsirDialog from "@/components/TafsirDialog";
import ShareAyahDialog from "@/components/ShareAyahDialog";
import AyahOptionsMenu from "@/components/AyahOptionsMenu";
import TranslationSelector from "@/components/TranslationSelector";
import DisplaySettingsPanel, { type DisplaySettings, getThemeClasses } from "@/components/DisplaySettings";
import { useState, useEffect, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useReadingStats } from "@/hooks/useReadingStats";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { stripLeadingBismillah } from "@/lib/quranText";

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
  ayahs: Ayah[];
}

const fetchSurah = async (surahNumber: string): Promise<SurahData> => {
  const response = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}`
  );
  const data = await response.json();
  return data.data;
};

const fetchTranslation = async (surahNumber: string, edition: string): Promise<Ayah[]> => {
  const response = await fetch(
    `https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`
  );
  const data = await response.json();
  return data.data.ayahs;
};

const SurahPage = () => {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const [searchParams] = useSearchParams();
  const highlightAyah = searchParams.get("ayah");
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { saveProgress } = useReadingProgress();
  const { incrementPage } = useReadingStats();
  const [tafsirAyah, setTafsirAyah] = useState<{ number: number; text: string } | null>(null);
  const [shareAyah, setShareAyah] = useState<{ number: number; text: string } | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    fontSize: 24,
    lineHeight: 2,
    theme: "simple",
    fontFamily: "Amiri",
    showTranslation: true,
  });
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState<number | null>(null);
  const audioPlayerRef = useRef<AudioPlayerHandle | null>(null);
  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});

  const surahInfo = surahs.find((s) => s.number === Number(surahNumber));

  const { data: surah, isLoading, error } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: () => fetchSurah(surahNumber!),
    enabled: !!surahNumber,
  });

  const { data: translationData } = useQuery({
    queryKey: ["translation", surahNumber, selectedTranslation],
    queryFn: () => fetchTranslation(surahNumber!, selectedTranslation!),
    enabled: !!surahNumber && !!selectedTranslation,
  });

  // Auto-save reading progress and increment page
  useEffect(() => {
    if (surah && surahInfo) {
      saveProgress(surah.number, 1, surahInfo.name, surah.numberOfAyahs);
      incrementPage();
    }
  }, [surah?.number]); // Only trigger on surah change

  // Scroll to highlighted ayah from favorites
  useEffect(() => {
    if (highlightAyah && surah) {
      const ayahNum = parseInt(highlightAyah);
      const ayahIndex = surah.ayahs.findIndex(a => a.numberInSurah === ayahNum);
      if (ayahIndex !== -1) {
        setCurrentPlayingAyah(ayahIndex);
        setTimeout(() => {
          const element = ayahRefs.current[ayahNum];
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 500);
      }
    }
  }, [highlightAyah, surah]);

  const toggleFavorite = async (ayah: Ayah, displayText: string) => {
    const surahNum = Number(surahNumber);
    if (isFavorite(surahNum, ayah.numberInSurah)) {
      await removeFavorite(surahNum, ayah.numberInSurah);
    } else {
      await addFavorite(surahNum, surahInfo?.name || "", ayah.numberInSurah, displayText);
    }
  };

  const handleAyahChange = useCallback((ayahIndex: number) => {
    setCurrentPlayingAyah(ayahIndex);
    // Scroll to current ayah
    if (surah?.ayahs[ayahIndex]) {
      const ayahNum = surah.ayahs[ayahIndex].numberInSurah;
      setTimeout(() => {
        const element = ayahRefs.current[ayahNum];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [surah]);

  const playSpecificAyah = useCallback((ayahIndex: number) => {
    if (audioPlayerRef.current) {
      setCurrentPlayingAyah(ayahIndex);
      audioPlayerRef.current.playSpecificAyah(ayahIndex);
    }
  }, []);

  const playSurahFromStart = useCallback(() => {
    if (audioPlayerRef.current) {
      setCurrentPlayingAyah(0);
      audioPlayerRef.current.playSurahFromStart();
    }
  }, []);

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
  };

  // Get loading animation color classes based on position
  const getLoadingColorClass = (index: number) => {
    const colors = [
      "bg-primary/20",
      "bg-accent/20", 
      "bg-green-500/20",
      "bg-orange-500/20",
      "bg-purple-500/20",
    ];
    return colors[index % colors.length];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center arabic-ui">
          <p className="text-destructive text-lg">حدث خطأ في تحميل السورة</p>
          <Link to="/"><Button variant="outline" className="mt-4">العودة للرئيسية</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 arabic-ui">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/quran"><Button variant="ghost" size="icon"><ArrowRight className="w-5 h-5" /></Button></Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-quran">{surahInfo?.name}</h1>
            <p className="text-muted-foreground text-sm">{surahInfo?.englishNameTranslation} • {surahInfo?.numberOfAyahs} آية</p>
          </div>
          
          {/* Settings Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 arabic-ui overflow-y-auto">
              <SheetHeader>
                <SheetTitle>إعدادات العرض</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="font-medium mb-3">الترجمة</h4>
                  <TranslationSelector
                    value={selectedTranslation}
                    onChange={setSelectedTranslation}
                  />
                </div>
                <DisplaySettingsPanel
                  settings={displaySettings}
                  onChange={setDisplaySettings}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 mb-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{surahInfo?.revelationType === "Meccan" ? "سورة مكية" : "سورة مدنية"}</span>
            </div>
            <Button 
              onClick={playSurahFromStart}
              className="gap-2 rounded-full"
              size="sm"
            >
              <Headphones className="w-4 h-4" />
              استمع للسورة كاملة
            </Button>
          </div>
          {surahNumber !== "9" && surahNumber !== "1" && (
            <p className="text-2xl md:text-3xl font-quran text-foreground">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          )}
        </div>

        <div className={cn(
          "rounded-2xl p-4 md:p-8 shadow-sm border transition-all duration-300",
          getThemeClasses(displaySettings.theme)
        )}>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "space-y-2 p-3 rounded-lg animate-pulse transition-colors",
                    getLoadingColorClass(i)
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div 
              className={cn(
                "quran-text leading-loose",
                displaySettings.fontFamily === "Amiri" && "font-amiri",
                displaySettings.fontFamily === "Scheherazade" && "font-scheherazade",
                displaySettings.fontFamily === "Noto Naskh" && "font-noto-naskh",
                displaySettings.fontFamily === "Uthmani" && "font-uthmani"
              )}
              style={{ 
                fontSize: `${displaySettings.fontSize}px`,
                lineHeight: displaySettings.lineHeight,
              }}
            >
              {surah?.ayahs.map((ayah, index) => {
                let displayText = ayah.text;
                // Remove Bismillah from first ayah for all surahs except Al-Fatiha (1) and At-Tawbah (9)
                if (ayah.numberInSurah === 1 && Number(surahNumber) !== 1 && Number(surahNumber) !== 9) {
                  displayText = stripLeadingBismillah(displayText);
                }
                const isAyahFavorite = isFavorite(Number(surahNumber), ayah.numberInSurah);
                const translatedText = translationData?.find(t => t.numberInSurah === ayah.numberInSurah)?.text;
                const isCurrentlyPlaying = currentPlayingAyah === index;
                
                return (
                  <span 
                    key={ayah.number} 
                    className="inline"
                    ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                  >
                    <AyahOptionsMenu
                      ayahNumber={ayah.numberInSurah}
                      ayahText={displayText}
                      surahNumber={Number(surahNumber)}
                      surahName={surahInfo?.name || ""}
                      isFavorite={isAyahFavorite}
                      onToggleFavorite={() => toggleFavorite(ayah, displayText)}
                      onOpenTafsir={() => setTafsirAyah({ number: ayah.numberInSurah, text: displayText })}
                      onOpenShare={() => setShareAyah({ number: ayah.numberInSurah, text: displayText })}
                      onPlayAyah={() => playSpecificAyah(index)}
                    >
                      <span 
                        className={cn(
                          "rounded px-1 transition-all duration-300 cursor-pointer",
                          isCurrentlyPlaying || (highlightAyah && parseInt(highlightAyah) === ayah.numberInSurah)
                            ? "bg-primary/20 text-primary ring-2 ring-primary/30" 
                            : "hover:bg-accent/10"
                        )}
                      >
                        {displayText}
                      </span>
                    </AyahOptionsMenu>
                    <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-primary/10 text-primary rounded-full font-arabic align-middle">
                      {convertToArabicNumber(ayah.numberInSurah)}
                    </span>
                    {selectedTranslation && translatedText && (
                      <span className="block text-base text-muted-foreground mb-4 mt-2 pr-4 border-r-2 border-primary/30">
                        {translatedText}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pb-28 gap-4">
          {Number(surahNumber) > 1 && <Link to={`/surah/${Number(surahNumber) - 1}`}><Button variant="outline" className="gap-2">السورة السابقة<ArrowRight className="w-4 h-4" /></Button></Link>}
          <div className="flex-1" />
          {Number(surahNumber) < 114 && <Link to={`/surah/${Number(surahNumber) + 1}`}><Button variant="outline" className="gap-2"><ArrowRight className="w-4 h-4 rotate-180" />السورة التالية</Button></Link>}
        </div>
      </main>

      {surah && surahInfo && (
        <AudioPlayer 
          ref={audioPlayerRef} 
          surahNumber={surah.number} 
          ayahs={surah.ayahs} 
          surahName={surahInfo.name}
          onAyahChange={handleAyahChange}
        />
      )}
      
      {tafsirAyah && <TafsirDialog isOpen={!!tafsirAyah} onClose={() => setTafsirAyah(null)} surahNumber={Number(surahNumber)} ayahNumber={tafsirAyah.number} ayahText={tafsirAyah.text} />}
      
      {shareAyah && surahInfo && <ShareAyahDialog isOpen={!!shareAyah} onClose={() => setShareAyah(null)} ayahText={shareAyah.text} surahName={surahInfo.name} ayahNumber={shareAyah.number} />}
    </div>
  );
};

export default SurahPage;
