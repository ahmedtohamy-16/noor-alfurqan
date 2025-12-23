import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useReadingStats } from "@/hooks/useReadingStats";

const TOTAL_PAGES = 604;

interface PageData {
  ayahs: {
    number: number;
    text: string;
    numberInSurah: number;
    surah: {
      number: number;
      name: string;
      englishName: string;
    };
    page: number;
  }[];
}

const fetchPage = async (page: number): Promise<PageData> => {
  const response = await fetch(
    `https://api.alquran.cloud/v1/page/${page}/quran-uthmani`
  );
  const data = await response.json();
  return data.data;
};

const MushafPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [inputPage, setInputPage] = useState(initialPage.toString());
  const { saveProgress } = useReadingProgress();
  const { incrementPage } = useReadingStats();

  const { data, isLoading, error } = useQuery({
    queryKey: ["mushafPage", currentPage],
    queryFn: () => fetchPage(currentPage),
  });

  // Update URL and track reading
  useEffect(() => {
    setSearchParams({ page: currentPage.toString() });
    incrementPage();
  }, [currentPage]);

  // Save reading progress when page loads
  useEffect(() => {
    if (data && data.ayahs.length > 0) {
      const firstAyah = data.ayahs[0];
      saveProgress(
        firstAyah.surah.number,
        firstAyah.numberInSurah,
        firstAyah.surah.name,
        data.ayahs[data.ayahs.length - 1]?.numberInSurah || 1
      );
    }
  }, [data]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page);
      setInputPage(page.toString());
    }
  };

  const handlePageInput = (e: React.FormEvent) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (page >= 1 && page <= TOTAL_PAGES) {
      goToPage(page);
    }
  };

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
  };

  // Group ayahs by surah
  const groupedBySurah = data?.ayahs.reduce((acc, ayah) => {
    const surahNum = ayah.surah.number;
    if (!acc[surahNum]) {
      acc[surahNum] = {
        name: ayah.surah.name,
        number: surahNum,
        ayahs: []
      };
    }
    acc[surahNum].ayahs.push(ayah);
    return acc;
  }, {} as Record<number, { name: string; number: number; ayahs: typeof data.ayahs }>);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Page Navigation Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <Link to="/quran">
            <Button variant="ghost" size="sm" className="gap-2">
              <BookOpen className="w-4 h-4" />
              قائمة السور
            </Button>
          </Link>

          <form onSubmit={handlePageInput} className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= TOTAL_PAGES}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                صفحة
              </span>
              <Input
                type="number"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                className="w-20 text-center"
                min={1}
                max={TOTAL_PAGES}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                من {TOTAL_PAGES}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Mushaf Content */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 md:p-10 shadow-lg border border-amber-200 dark:border-amber-800/50 min-h-[70vh]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(15)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-destructive">حدث خطأ في تحميل الصفحة</p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedBySurah && Object.values(groupedBySurah).map((surah) => (
                <div key={surah.number}>
                  {/* Surah Header - only show if first ayah is ayah 1 */}
                  {surah.ayahs[0].numberInSurah === 1 && (
                    <div className="text-center mb-6">
                      <div className="inline-block bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-xl px-8 py-4 mb-4">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground font-quran">
                          سورة {surah.name.replace("سُورَةُ ", "")}
                        </h2>
                      </div>
                      {/* Show Bismillah separately only for surahs other than At-Tawbah (9) and Al-Fatiha (1) */}
                      {surah.number !== 9 && surah.number !== 1 && (
                        <p className="text-xl md:text-2xl font-quran text-foreground/90 mb-4">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Ayahs */}
                  <div className="quran-text text-xl md:text-2xl leading-[2.5] text-center">
                    {surah.ayahs.map((ayah) => {
                      let displayText = ayah.text;
                      // Remove Bismillah from first ayah for all surahs except Al-Fatiha
                      // This prevents duplication since we show Bismillah separately above
                      if (ayah.numberInSurah === 1 && surah.number !== 1) {
                        displayText = ayah.text.replace(/^بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\s*/, "").trim();
                      }
                      
                      return (
                        <span key={ayah.number} className="inline">
                          <Link 
                            to={`/surah/${surah.number}#ayah-${ayah.numberInSurah}`}
                            className="hover:bg-primary/10 rounded px-1 transition-colors"
                          >
                            {displayText}
                          </Link>
                          <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-primary/10 text-primary rounded-full font-arabic align-middle">
                            {convertToArabicNumber(ayah.numberInSurah)}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <Button
            variant="outline"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= TOTAL_PAGES}
            className="gap-2"
          >
            <ChevronRight className="w-4 h-4" />
            الصفحة السابقة
          </Button>

          <span className="text-muted-foreground text-sm">
            صفحة {convertToArabicNumber(currentPage)} من {convertToArabicNumber(TOTAL_PAGES)}
          </span>

          <Button
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="gap-2"
          >
            الصفحة التالية
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default MushafPage;
