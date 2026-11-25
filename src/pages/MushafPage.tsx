import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useReadingStats } from "@/hooks/useReadingStats";
import { getAyahsByPageAsync } from "@/data/quranAyats";
import { surahs } from "@/data/surahs";

import { arabicDigits, westernDigits } from "@/lib/displayFormat";
import { TOTAL_MUSHAF_PAGES as TOTAL_PAGES, JUZ_START_PAGES } from "@/lib/mushafNavigation";
import { useFavorites } from "@/hooks/useFavorites";
import AyahOptionsMenu from "@/components/AyahOptionsMenu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const toAr = (n: number) => n.toLocaleString("ar-EG");

const MushafPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = searchParams.get("page") || "1";
  const parsedPage = Number(rawPage);
  const invalidPage = !Number.isInteger(parsedPage) || parsedPage < 1 || parsedPage > TOTAL_PAGES;
  const initialPage = invalidPage ? 1 : parsedPage;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [inputPage, setInputPage] = useState(arabicDigits(initialPage));
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { saveProgress } = useReadingProgress();
  const { incrementPage } = useReadingStats();

  const {
    data: pageAyahs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["mushafPageAyahs", currentPage],
    queryFn: async () => {
      const ayahs = await getAyahsByPageAsync(currentPage);
      return ayahs.map((a) => {
        const surahInfo = surahs.find((s) => s.number === a.sura_id);
        return {
          number: a.id,
          text: a.text_uthmani,
          numberInSurah: a.ayat_number_in_sura,
          surah: {
            number: a.sura_id,
            name: surahInfo?.name || `سورة ${a.sura_id}`,
            englishName: surahInfo?.englishName || `Surah ${a.sura_id}`,
          },
          page: a.page_number,
        };
      });
    },
    staleTime: 1000 * 60 * 60,
  });

  const currentJuz = JUZ_START_PAGES.filter((p) => p <= currentPage).length;
  const error = isError || pageAyahs.length === 0;

  // Follow direct links and browser history without rewriting their page.
  useEffect(() => {
    if (invalidPage) return;
    setCurrentPage(parsedPage);
    setInputPage(arabicDigits(parsedPage));
  }, [parsedPage, invalidPage]);
  useEffect(() => {
    if (invalidPage || !pageAyahs.length || document.visibilityState !== "visible") return;
    const timer = setTimeout(() => { if (document.visibilityState === "visible") incrementPage(); }, 4000);
    return () => clearTimeout(timer);
  }, [currentPage, pageAyahs]);

  // Save reading progress when page loads
  useEffect(() => {
    if (pageAyahs.length > 0) {
      const firstAyah = pageAyahs[0];
      saveProgress(
        firstAyah.surah.number,
        firstAyah.numberInSurah,
        firstAyah.surah.name,
        pageAyahs[pageAyahs.length - 1]?.numberInSurah || 1
      );
    }
  }, [pageAyahs]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setCurrentPage(page);
      setInputPage(arabicDigits(page));
      setSearchParams({ page: page.toString() });
    }
  };

  const handlePageInput = (e: React.FormEvent) => {
    e.preventDefault();
    const page = Number(westernDigits(inputPage));
    if (page >= 1 && page <= TOTAL_PAGES) {
      goToPage(page);
    }
  };

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
  };

  // Group ayahs by surah
  const groupedBySurah = pageAyahs.reduce((acc, ayah) => {
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
  }, {} as Record<number, { name: string; number: number; ayahs: typeof pageAyahs }>);

  if (invalidPage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-20 text-center arabic-ui space-y-4">
          <p className="text-6xl font-bold text-primary arabic-digits">٤٠٤</p>
          <h1 className="text-xl font-bold">هذه الصفحة غير موجودة في المصحف</h1>
          <p className="text-muted-foreground text-sm">صفحات المصحف من ١ إلى ٦٠٤.</p>
          <Button onClick={() => goToPage(1)}>الذهاب إلى الصفحة الأولى</Button>
        </main>
      </div>
    );
  }

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

          <form onSubmit={handlePageInput} className="flex items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              aria-label="الصفحة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                صفحة
              </span>
              <Input
                type="text"
                inputMode="numeric"
                aria-label="رقم صفحة المصحف"
                value={inputPage}
                onChange={(e) => setInputPage(arabicDigits(e.target.value.replace(/[^0-9٠-٩]/g, "")))}
                className="w-16 text-center arabic-digits"
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                من <span className="arabic-digits">{arabicDigits(TOTAL_PAGES)}</span>
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= TOTAL_PAGES}
              aria-label="الصفحة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </form>

          <Select value={String(currentJuz)} onValueChange={value => { const page = JUZ_START_PAGES[Number(value) - 1]; if (page) goToPage(page); }}>
            <SelectTrigger aria-label="التصفح بالجزء" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {JUZ_START_PAGES.map((_, i) => <SelectItem key={i} value={String(i + 1)}>الجزء {toAr(i + 1)}</SelectItem>)}
            </SelectContent>
          </Select>
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
              {Object.values(groupedBySurah).map((surah) => (
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
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Ayahs */}
                  <div className="quran-text text-xl md:text-2xl leading-[2.5] text-center">
                    {surah.ayahs.map((ayah) => {
                      const displayText = ayah.text;
                      
                      return (
                        <span key={ayah.number} className="inline">
                          <AyahOptionsMenu ayahNumber={ayah.numberInSurah} ayahText={displayText} surahNumber={surah.number} surahName={surah.name} globalAyahNumber={ayah.number} isFavorite={isFavorite(surah.number, ayah.numberInSurah)} onToggleFavorite={() => { if (isFavorite(surah.number, ayah.numberInSurah)) void removeFavorite(surah.number, ayah.numberInSurah); else void addFavorite(surah.number, surah.name, ayah.numberInSurah, displayText); }}>
                            <span tabIndex={0} role="button" className="cursor-pointer hover:bg-primary/10 rounded px-1 transition-colors">{displayText}<span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-primary/10 text-primary rounded-full font-arabic align-middle">{convertToArabicNumber(ayah.numberInSurah)}</span></span>
                          </AyahOptionsMenu>
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
        <div className="flex flex-wrap items-center justify-between mt-6 gap-3 pb-24">
          <Button
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
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
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= TOTAL_PAGES}
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
