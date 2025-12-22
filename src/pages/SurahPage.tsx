import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Heart, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { surahs } from "@/data/surahs";
import Header from "@/components/Header";
import AudioPlayer from "@/components/AudioPlayer";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [favorites, setFavorites] = useState<number[]>([]);

  const surahInfo = surahs.find((s) => s.number === Number(surahNumber));

  const { data: surah, isLoading, error } = useQuery({
    queryKey: ["surah", surahNumber],
    queryFn: () => fetchSurah(surahNumber!),
    enabled: !!surahNumber,
  });

  const toggleFavorite = (ayahNumber: number) => {
    setFavorites((prev) =>
      prev.includes(ayahNumber)
        ? prev.filter((n) => n !== ayahNumber)
        : [...prev, ayahNumber]
    );
  };

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)])
      .join("");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center arabic-ui">
          <p className="text-destructive text-lg">حدث خطأ في تحميل السورة</p>
          <Link to="/">
            <Button variant="outline" className="mt-4">
              العودة للرئيسية
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Back Button & Surah Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-quran">
              {surahInfo?.name}
            </h1>
            <p className="text-muted-foreground text-sm">
              {surahInfo?.englishNameTranslation} • {surahInfo?.numberOfAyahs} آية
            </p>
          </div>
        </div>

        {/* Surah Info Card */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              {surahInfo?.revelationType === "Meccan" ? "سورة مكية" : "سورة مدنية"}
            </span>
          </div>
          
          {/* Bismillah - except for At-Tawba */}
          {surahNumber !== "9" && (
            <p className="text-2xl md:text-3xl font-quran text-foreground">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          )}
        </div>

        {/* Ayahs */}
        <div className="bg-card rounded-2xl p-4 md:p-8 shadow-sm border border-border">
          {isLoading ? (
            <div className="space-y-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="quran-text text-xl md:text-2xl lg:text-3xl leading-loose">
              {surah?.ayahs.map((ayah, index) => {
                // Remove Bismillah from first ayah of surahs except Al-Fatihah (1) and At-Tawbah (9)
                let displayText = ayah.text;
                if (ayah.numberInSurah === 1 && Number(surahNumber) !== 1 && Number(surahNumber) !== 9) {
                  // Remove Bismillah prefix from the text
                  displayText = ayah.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "");
                }
                
                return (
                  <span
                    key={ayah.number}
                    className="group relative inline"
                  >
                    {/* Ayah Text */}
                    <span className="hover:bg-accent/10 rounded px-1 transition-colors cursor-pointer">
                      {displayText}
                    </span>
                    
                    {/* Ayah Number */}
                    <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-primary/10 text-primary rounded-full font-arabic align-middle">
                      {convertToArabicNumber(ayah.numberInSurah)}
                    </span>

                  {/* Hover Actions */}
                  <span className="hidden group-hover:inline-flex absolute top-0 left-0 -translate-x-full gap-1 bg-card shadow-lg rounded-lg p-1 border border-border z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => toggleFavorite(ayah.number)}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favorites.includes(ayah.number)
                            ? "fill-destructive text-destructive"
                            : ""
                        }`}
                      />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pb-28 gap-4">
          {Number(surahNumber) > 1 && (
            <Link to={`/surah/${Number(surahNumber) - 1}`}>
              <Button variant="outline" className="gap-2">
                السورة السابقة
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <div className="flex-1" />
          {Number(surahNumber) < 114 && (
            <Link to={`/surah/${Number(surahNumber) + 1}`}>
              <Button variant="outline" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                السورة التالية
              </Button>
            </Link>
          )}
        </div>
      </main>

      {/* Audio Player */}
      {surah && surahInfo && (
        <AudioPlayer
          surahNumber={surah.number}
          ayahs={surah.ayahs}
          surahName={surahInfo.name}
        />
      )}
    </div>
  );
};

export default SurahPage;
