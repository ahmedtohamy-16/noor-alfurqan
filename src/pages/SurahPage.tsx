import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { surahs } from "@/data/surahs";
import Header from "@/components/Header";
import AudioPlayer, { type AudioPlayerHandle } from "@/components/AudioPlayer";
import TafsirDialog from "@/components/TafsirDialog";
import ShareAyahDialog from "@/components/ShareAyahDialog";
import AyahOptionsMenu from "@/components/AyahOptionsMenu";
import { useState, useEffect, useCallback, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useReadingProgress } from "@/hooks/useReadingProgress";

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

const SurahPage = () => {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { saveProgress } = useReadingProgress();
  const [tafsirAyah, setTafsirAyah] = useState<{ number: number; text: string } | null>(null);
  const [shareAyah, setShareAyah] = useState<{ number: number; text: string } | null>(null);
  const audioPlayerRef = useRef<AudioPlayerHandle | null>(null);

  const surahInfo = surahs.find((s) => s.number === Number(surahNumber));

  const { data: surah, isLoading, error } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: () => fetchSurah(surahNumber!),
    enabled: !!surahNumber,
  });

  // Auto-save reading progress
  useEffect(() => {
    if (surah && surahInfo) {
      saveProgress(surah.number, 1, surahInfo.name, surah.numberOfAyahs);
    }
  }, [surah, surahInfo, saveProgress]);

  const toggleFavorite = async (ayah: Ayah, displayText: string) => {
    const surahNum = Number(surahNumber);
    if (isFavorite(surahNum, ayah.numberInSurah)) {
      await removeFavorite(surahNum, ayah.numberInSurah);
    } else {
      await addFavorite(surahNum, surahInfo?.name || "", ayah.numberInSurah, displayText);
    }
  };

  const playSpecificAyah = useCallback((ayahIndex: number) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playSpecificAyah(ayahIndex);
    }
  }, []);

  const playSurahFromStart = useCallback(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playSurahFromStart();
    }
  }, []);

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
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
          {surahNumber !== "9" && <p className="text-2xl md:text-3xl font-quran text-foreground">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>}
        </div>

        <div className="bg-card rounded-2xl p-4 md:p-8 shadow-sm border border-border">
          {isLoading ? (
            <div className="space-y-6">{[...Array(10)].map((_, i) => (<div key={i} className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-3/4" /></div>))}</div>
          ) : (
            <div className="quran-text text-xl md:text-2xl lg:text-3xl leading-loose">
              {surah?.ayahs.map((ayah, index) => {
                let displayText = ayah.text;
                if (ayah.numberInSurah === 1 && Number(surahNumber) !== 1 && Number(surahNumber) !== 9) {
                  displayText = ayah.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "");
                }
                const isAyahFavorite = isFavorite(Number(surahNumber), ayah.numberInSurah);
                
                return (
                  <span key={ayah.number} className="inline">
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
                      <span className="hover:bg-accent/10 rounded px-1 transition-colors cursor-pointer">
                        {displayText}
                      </span>
                    </AyahOptionsMenu>
                    <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-primary/10 text-primary rounded-full font-arabic align-middle">
                      {convertToArabicNumber(ayah.numberInSurah)}
                    </span>
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

      {surah && surahInfo && <AudioPlayer ref={audioPlayerRef} surahNumber={surah.number} ayahs={surah.ayahs} surahName={surahInfo.name} />}
      
      {tafsirAyah && <TafsirDialog isOpen={!!tafsirAyah} onClose={() => setTafsirAyah(null)} surahNumber={Number(surahNumber)} ayahNumber={tafsirAyah.number} ayahText={tafsirAyah.text} />}
      
      {shareAyah && surahInfo && <ShareAyahDialog isOpen={!!shareAyah} onClose={() => setShareAyah(null)} ayahText={shareAyah.text} surahName={surahInfo.name} ayahNumber={shareAyah.number} />}
    </div>
  );
};

export default SurahPage;
