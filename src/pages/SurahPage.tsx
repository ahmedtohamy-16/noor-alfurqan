import { ayahCountLabel } from "@/lib/displayFormat";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Headphones, Settings2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { surahs } from "@/data/surahs";
import { getAyahsBySurahAsync } from "@/data/quranAyats";
import Header from "@/components/Header";
import PageSeo from "@/components/PageSeo";
import TafsirDialog from "@/components/TafsirDialog";
import ShareAyahDialog from "@/components/ShareAyahDialog";
import AyahOptionsMenu from "@/components/AyahOptionsMenu";
import TranslationSelector from "@/components/TranslationSelector";
import DisplaySettingsPanel, { getThemeClasses } from "@/components/DisplaySettings";
import ReciterSettingsPanel from "@/components/ReciterSettingsPanel";
import { DownloadAudioDialog } from "@/components/DownloadAudioDialog";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useReadingStats } from "@/hooks/useReadingStats";
import { useReadingSettings } from "@/hooks/useReadingSettings";
import { useGlobalAudio } from "@/hooks/useGlobalAudio";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { readingAyahIndex } from "@/lib/readingPositionRules";

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
  const { settings: readingSettings, updateSettings } = useReadingSettings();
  const [tafsirAyah, setTafsirAyah] = useState<{ number: number; text: string } | null>(null);
  const [shareAyah, setShareAyah] = useState<{ number: number; text: string } | null>(null);
  const [highlightedForTafsir, setHighlightedForTafsir] = useState<number | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(readingSettings.selectedTranslation);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [downloadType, setDownloadType] = useState<'surah' | 'ayah' | 'range'>('surah');
  const [downloadAyahNumber, setDownloadAyahNumber] = useState<number | null>(null);
  const [downloadGlobalAyahNumber, setDownloadGlobalAyahNumber] = useState<number | null>(null);
  const globalAudio = useGlobalAudio();
  const ayahRefs = useRef<{ [key: number]: HTMLSpanElement | null }>({});
  const readingBarRef = useRef<HTMLDivElement | null>(null);
  const [readingPosition, setReadingPosition] = useState({ surah: surahNumber, index: 0 });

  const surahInfo = surahs.find((s) => s.number === Number(surahNumber));

  const {
    data: localAyahs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["surahLocalAyahs", surahNumber],
    queryFn: () => getAyahsBySurahAsync(Number(surahNumber)),
    enabled: !!surahNumber,
    staleTime: 1000 * 60 * 60,
  });

  // Use local runtime-loaded data
  const surah = useMemo((): SurahData | null => {
    if (!surahNumber || !surahInfo) return null;
    if (!localAyahs || localAyahs.length === 0) return null;

    return {
      number: surahInfo.number,
      name: surahInfo.name,
      englishName: surahInfo.englishName,
      englishNameTranslation: surahInfo.englishNameTranslation,
      numberOfAyahs: surahInfo.numberOfAyahs,
      revelationType: surahInfo.revelationType,
      ayahs: localAyahs.map((a) => ({
        number: a.id,
        text: a.text_uthmani,
        numberInSurah: a.ayat_number_in_sura,
      })),
    };
  }, [surahNumber, surahInfo, localAyahs]);

  const error = (isError || (!isLoading && !!surahNumber && !surah))
    ? new Error("Surah not found")
    : null;

  const visibleAyah = localAyahs[readingPosition.surah === surahNumber ? readingPosition.index : 0] ?? localAyahs[0];

  const { data: translationData } = useQuery({
    queryKey: ["translation", surahNumber, selectedTranslation],
    queryFn: () => {
      if (!surahNumber || !selectedTranslation) throw new Error("Translation not selected");
      return fetchTranslation(surahNumber, selectedTranslation);
    },
    enabled: !!surahNumber && !!selectedTranslation,
  });

  useEffect(() => {
    if (!localAyahs.length) return;
    let frame = 0;
    const updatePosition = () => {
      frame = 0;
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 56;
      const barHeight = readingBarRef.current?.getBoundingClientRect().height ?? 44;
      const readingLine = headerBottom + barHeight + 24;
      function* ayahBounds() {
        for (let index = 0; index < localAyahs.length; index++) {
          const element = ayahRefs.current[localAyahs[index].ayat_number_in_sura];
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          yield { index, top: rect.top, bottom: rect.bottom };
        }
      }
      const index = readingAyahIndex(ayahBounds(), readingLine);
      setReadingPosition(previous => previous.surah === surahNumber && previous.index === index
        ? previous : { surah: surahNumber, index });
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(updatePosition);
    };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    const firstAyah = ayahRefs.current[localAyahs[0].ayat_number_in_sura];
    if (firstAyah?.parentElement) resizeObserver.observe(firstAyah.parentElement);
    let active = true;
    document.fonts.ready.then(() => { if (active) scheduleUpdate(); });
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
    };
  }, [localAyahs, surahNumber, readingSettings.fontSize, readingSettings.lineHeight, readingSettings.fontFamily, selectedTranslation, translationData]);

  // Auto-save reading progress and increment page
  useEffect(() => {
    if (surah && surahInfo) {
      saveProgress(surah.number, 1, surahInfo.name, surah.numberOfAyahs);
      incrementPage();
    }
  }, [surah?.number]); // Only trigger on surah change

  // Persist audio listening progress per surah (localStorage)
  const audioProgressKey = surah ? `noor:audioProgress:${surah.number}` : null;

  useEffect(() => {
    if (!audioProgressKey) return;
    if (
      globalAudio.currentSurah?.number === surah?.number &&
      globalAudio.currentAyahIndex >= 0
    ) {
      try {
        localStorage.setItem(
          audioProgressKey,
          JSON.stringify({
            ayahIndex: globalAudio.currentAyahIndex,
            updatedAt: Date.now(),
          }),
        );
      } catch {}
    }
  }, [globalAudio.currentAyahIndex, globalAudio.currentSurah?.number, surah?.number, audioProgressKey]);

  // Restore last listened ayah on mount of this surah
  const [resumeIndex, setResumeIndex] = useState<number | null>(null);
  useEffect(() => {
    if (!audioProgressKey || !surah) return;
    try {
      const raw = localStorage.getItem(audioProgressKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.ayahIndex === "number" && parsed.ayahIndex > 0) {
          setResumeIndex(parsed.ayahIndex);
        }
      }
    } catch {}
  }, [audioProgressKey, surah?.number]);

  // Scroll to highlighted ayah from favorites/verse-of-the-day
  useEffect(() => {
    if (highlightAyah && surah) {
      const ayahNum = parseInt(highlightAyah);
      setTimeout(() => {
        const element = ayahRefs.current[ayahNum];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [highlightAyah, surah]);

  // Scroll to current playing ayah
  useEffect(() => {
    if (globalAudio.currentSurah?.number === surah?.number && surah) {
      const currentAyah = surah.ayahs[globalAudio.currentAyahIndex];
      if (currentAyah) {
        const element = ayahRefs.current[currentAyah.numberInSurah];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [globalAudio.currentAyahIndex, globalAudio.currentSurah?.number, surah]);

  const toggleFavorite = async (ayah: Ayah, displayText: string) => {
    const surahNum = Number(surahNumber);
    if (isFavorite(surahNum, ayah.numberInSurah)) {
      await removeFavorite(surahNum, ayah.numberInSurah);
    } else {
      await addFavorite(surahNum, surahInfo?.name || "", ayah.numberInSurah, displayText);
    }
  };

  const playSpecificAyah = useCallback((ayahIndex: number) => {
    if (surah && surahInfo) {
      globalAudio.playAyah({
        number: surah.number,
        name: surahInfo.name,
        ayahs: surah.ayahs,
      }, ayahIndex);
    }
  }, [surah, surahInfo, globalAudio]);

  const playSurahFromStart = useCallback(() => {
    if (surah && surahInfo) {
      globalAudio.playSurah({
        number: surah.number,
        name: surahInfo.name,
        ayahs: surah.ayahs,
      }, 0);
    }
  }, [surah, surahInfo, globalAudio]);

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
      {surahInfo && (
        <PageSeo
          title={`سورة ${surahInfo.name.replace(/^سُورَةُ\s*/, "")} — نور الفرقان`}
          description={`اقرأ واستمع إلى سورة ${surahInfo.name.replace(/^سُورَةُ\s*/, "")} (${surahInfo.numberOfAyahs} آية، ${surahInfo.revelationType === "Meccan" ? "مكية" : "مدنية"}) مع التفسير والترجمة في نور الفرقان.`}
          path={`/surah/${surahInfo.number}`}
          jsonLd={{ "@context": "https://schema.org", "@type": "WebPage", name: `سورة ${surahInfo.name}`, inLanguage: "ar", url: `https://nooralfurqan.app/surah/${surahInfo.number}` }}
        />
      )}
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-5 arabic-ui">
        <div className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-x-3 gap-y-2 mb-5">
          <Link to="/quran"><Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="العودة لقائمة السور"><ArrowRight className="w-5 h-5" /></Button></Link>
          <div className="text-center min-w-0">
            <h1 className="text-3xl md:text-4xl leading-relaxed font-bold text-foreground font-quran">{surahInfo?.name}</h1>
            <p className="text-muted-foreground text-sm flex flex-wrap justify-center items-center gap-2 mt-1">
              <span>{surahInfo?.revelationType === "Meccan" ? "مكية" : "مدنية"}</span>
              <span aria-hidden="true">•</span>
              <span className="arabic-digits">{ayahCountLabel(surahInfo?.numberOfAyahs || 0)}</span>
            </p>
          </div>
          {/* Settings Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full" aria-label="إعدادات القراءة والاستماع">
                <Settings2 className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 arabic-ui overflow-y-auto">
              <SheetHeader>
                <SheetTitle>إعدادات العرض</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Reciter Settings */}
                <ReciterSettingsPanel 
                  surahNumber={surah?.number}
                  surahName={surahInfo?.name}
                />
                
                <Separator />
                
                {/* Download Range Button */}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setDownloadType('range');
                    setDownloadGlobalAyahNumber(surah?.ayahs[0]?.number || null);
                    setShowDownloadDialog(true);
                  }}
                >
                  <Download className="w-4 h-4" />
                  تحميل نطاق من الآيات
                </Button>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-3">الترجمة</h4>
                  <TranslationSelector
                    value={selectedTranslation}
                    onChange={setSelectedTranslation}
                  />
                </div>
                <DisplaySettingsPanel
                  settings={{
                    fontSize: readingSettings.fontSize,
                    lineHeight: readingSettings.lineHeight,
                    theme: readingSettings.theme,
                    fontFamily: readingSettings.fontFamily,
                    showTranslation: readingSettings.showTranslation,
                  }}
                  onChange={(newSettings) => updateSettings(newSettings)}
                />
              </div>
            </SheetContent>
          </Sheet>
          <div className="col-span-3 flex justify-center">
            <Button variant="ghost" onClick={playSurahFromStart} disabled={!surah} className="h-11 gap-2 text-primary rounded-full px-5">
              <Headphones className="w-4 h-4" />
              استماع للسورة
            </Button>
          </div>
        </div>

        {visibleAyah && (
          <div ref={readingBarRef} role="status" aria-live="off" aria-label="موضع القراءة الحالي" className="sticky top-14 md:top-16 z-20 mb-5 flex min-h-11 items-center justify-between gap-3 border-y border-border bg-background/95 px-3 py-2 text-sm backdrop-blur-md">
            <span className="flex items-center gap-2 font-semibold text-primary">
              <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              الصفحة <span className="arabic-digits" data-reading-page>{convertToArabicNumber(visibleAyah.page_number)}</span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span>الجزء <span className="arabic-digits">{convertToArabicNumber(visibleAyah.juz_number)}</span></span>
              <span aria-hidden="true" className="text-border">/</span>
              <span>الآية <span className="arabic-digits" data-reading-ayah>{convertToArabicNumber(visibleAyah.ayat_number_in_sura)}</span></span>
            </span>
          </div>
        )}

        {/* Resume listening banner */}
        {resumeIndex !== null && surah && globalAudio.currentSurah?.number !== surah.number && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-3 flex items-center justify-between gap-3">
            <div className="text-right text-sm">
              <div className="font-semibold text-foreground">متابعة الاستماع</div>
              <div className="text-xs text-muted-foreground">
                توقفت عند الآية {convertToArabicNumber(surah.ayahs[resumeIndex]?.numberInSurah || resumeIndex + 1)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (audioProgressKey) localStorage.removeItem(audioProgressKey);
                  setResumeIndex(null);
                }}
              >
                إلغاء
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  playSpecificAyah(resumeIndex);
                  setResumeIndex(null);
                }}
              >
                متابعة
              </Button>
            </div>
          </div>
        )}

        {surahNumber !== "9" && surahNumber !== "1" && (
          <p className="text-2xl md:text-3xl font-quran text-foreground text-center mb-4">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
        )}

        <div className={cn(
          "rounded-2xl p-4 md:p-8 shadow-sm border transition-all duration-300",
          getThemeClasses(readingSettings.theme)
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
                readingSettings.fontFamily === "Amiri" && "font-amiri",
                readingSettings.fontFamily === "Scheherazade" && "font-scheherazade",
                readingSettings.fontFamily === "Noto Naskh" && "font-noto-naskh",
                readingSettings.fontFamily === "Uthmani" && "font-uthmani"
              )}
              style={{ 
                fontSize: `${readingSettings.fontSize}px`,
                lineHeight: readingSettings.lineHeight,
              }}
            >
              {surah?.ayahs.map((ayah, index) => {
                // Text is already clean from local data, no need to strip Bismillah
                const displayText = ayah.text;
                const isAyahFavorite = isFavorite(Number(surahNumber), ayah.numberInSurah);
                const translatedText = translationData?.find(t => t.numberInSurah === ayah.numberInSurah)?.text;
                const isCurrentlyPlaying = globalAudio.currentSurah?.number === surah.number && globalAudio.currentAyahIndex === index;
                
                return (
                  <span 
                    key={ayah.number} 
                    data-ayah-number={ayah.numberInSurah}
                    className="inline"
                    ref={(el) => { ayahRefs.current[ayah.numberInSurah] = el; }}
                  >
                    <AyahOptionsMenu
                      ayahNumber={ayah.numberInSurah}
                      ayahText={displayText}
                      surahNumber={Number(surahNumber)}
                      surahName={surahInfo?.name || ""}
                      globalAyahNumber={ayah.number}
                      isFavorite={isAyahFavorite}
                      onToggleFavorite={() => toggleFavorite(ayah, displayText)}
                      onOpenTafsir={() => {
                        setTafsirAyah({ number: ayah.numberInSurah, text: displayText });
                        setHighlightedForTafsir(ayah.numberInSurah);
                      }}
                      onOpenShare={() => setShareAyah({ number: ayah.numberInSurah, text: displayText })}
                      onPlayAyah={() => playSpecificAyah(index)}
                      onDownloadAyah={() => {
                        setDownloadType('ayah');
                        setDownloadAyahNumber(ayah.numberInSurah);
                        setDownloadGlobalAyahNumber(ayah.number);
                        setShowDownloadDialog(true);
                      }}
                    >
                      <span 
                        className={cn(
                          "rounded px-1 transition-all duration-300 cursor-pointer",
                          isCurrentlyPlaying || (highlightAyah && parseInt(highlightAyah) === ayah.numberInSurah)
                            ? "bg-primary/20 text-primary ring-2 ring-primary/30" 
                            : highlightedForTafsir === ayah.numberInSurah
                            ? "bg-amber-100 dark:bg-amber-900/30 ring-2 ring-amber-300 dark:ring-amber-700"
                            : "hover:bg-accent/10"
                        )}
                      >
                        {displayText}
                      </span>
                    </AyahOptionsMenu>
                    <span className="inline-flex items-center justify-center min-w-[40px] min-h-[40px] md:min-w-[32px] md:min-h-[32px] w-10 h-10 md:w-8 md:h-8 mx-1 text-sm bg-primary/10 text-primary rounded-full font-arabic align-middle cursor-pointer active:scale-95 transition-transform touch-manipulation">
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
      
      {tafsirAyah && <TafsirDialog isOpen={!!tafsirAyah} onClose={() => { setTafsirAyah(null); setHighlightedForTafsir(null); }} surahNumber={Number(surahNumber)} ayahNumber={tafsirAyah.number} ayahText={tafsirAyah.text} />}
      
      {shareAyah && surahInfo && <ShareAyahDialog isOpen={!!shareAyah} onClose={() => setShareAyah(null)} ayahText={shareAyah.text} surahName={surahInfo.name} ayahNumber={shareAyah.number} />}

      <DownloadAudioDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
        surahNumber={surah?.number || 1}
        surahName={surahInfo?.name || ""}
        ayahNumber={downloadAyahNumber}
        globalAyahNumber={downloadGlobalAyahNumber}
        downloadType={downloadType}
        totalAyahs={surah?.numberOfAyahs || 0}
      />
    </div>
  );
};

export default SurahPage;
