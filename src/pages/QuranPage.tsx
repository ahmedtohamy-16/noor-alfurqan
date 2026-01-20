import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Book, Search, Hash, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Header from "@/components/Header";
import SurahCard from "@/components/SurahCard";
import { surahs } from "@/data/surahs";
import { searchAyahsAsync } from "@/data/quranAyats";
import { Skeleton } from "@/components/ui/skeleton";

interface AyahResult {
  number: number;
  text: string;
  numberInSurah: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
}

const QuranPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "meccan" | "medinan">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"surah" | "ayah">("surah");

  const filteredSurahs = surahs.filter((surah) => {
    let matchesFilter = true;
    if (filter === "meccan") matchesFilter = surah.revelationType === "Meccan";
    if (filter === "medinan") matchesFilter = surah.revelationType === "Medinan";

    if (!searchQuery.trim()) return matchesFilter;
    
    const matchesSearch = 
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString() === searchQuery;
    
    return matchesFilter && matchesSearch;
  });

  const { data: ayahResults = [], isLoading: isSearching } = useQuery({
    queryKey: ["ayahSearch", searchQuery],
    queryFn: async (): Promise<AyahResult[]> => {
      const results = await searchAyahsAsync(searchQuery);
      return results.slice(0, 100).map((a) => {
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
        };
      });
    },
    enabled: searchType === "ayah" && searchQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  // Check if query is a valid ayah reference (e.g., "2:255" for Ayat Al-Kursi)
  const parseAyahReference = (q: string) => {
    const match = q.match(/^(\d+):(\d+)$/);
    if (match) {
      return { surah: parseInt(match[1]), ayah: parseInt(match[2]) };
    }
    return null;
  };

  const ayahRef = parseAyahReference(searchQuery);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Book className="w-6 h-6 text-primary" />
              القرآن الكريم
            </h1>
            <p className="text-muted-foreground text-sm">١١٤ سورة</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ابحث عن سورة، كلمة، أو رقم آية (مثال: 2:255)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-12 h-12 text-base rounded-xl border-2 focus:border-primary text-right"
          />
        </div>

        {/* Search Type Tabs */}
        {searchQuery.trim() && (
          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "surah" | "ayah")} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="surah" className="gap-2">
                <BookOpen className="w-4 h-4" />
                البحث في السور
              </TabsTrigger>
              <TabsTrigger value="ayah" className="gap-2">
                <Hash className="w-4 h-4" />
                البحث في الآيات
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Direct Ayah Reference */}
        {ayahRef && (
          <div className="mb-4">
            <Link to={`/surah/${ayahRef.surah}?ayah=${ayahRef.ayah}`}>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 hover:bg-primary/20 transition-colors">
                <p className="text-sm text-primary mb-1">الذهاب مباشرة إلى:</p>
                <p className="font-bold text-foreground">
                  سورة {surahs.find(s => s.number === ayahRef.surah)?.name || ayahRef.surah} - الآية {ayahRef.ayah}
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Ayah Search Results */}
        {searchType === "ayah" && searchQuery.trim().length >= 2 && (
          <div className="mb-6">
            {isSearching ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : ayahResults && ayahResults.length > 0 ? (
              <div>
                <p className="text-muted-foreground mb-4">
                  تم العثور على {ayahResults.length} آية
                </p>
                <div className="space-y-4">
                  {ayahResults.slice(0, 50).map((ayah) => (
                    <Link
                      key={ayah.number}
                      to={`/surah/${ayah.surah.number}?ayah=${ayah.numberInSurah}`}
                      className="block"
                    >
                      <div className="bg-card hover:bg-accent/10 border border-border rounded-xl p-4 transition-all hover:shadow-md">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                            {ayah.surah.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            الآية {ayah.numberInSurah}
                          </span>
                        </div>
                        <p className="text-foreground font-quran text-lg leading-loose line-clamp-3">
                          {ayah.text}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                لم يتم العثور على نتائج
              </p>
            )}
          </div>
        )}

        {/* Surah Filter and List */}
        {(searchType === "surah" || !searchQuery.trim()) && (
          <>
            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-sm">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="meccan">مكية</TabsTrigger>
                <TabsTrigger value="medinan">مدنية</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Results Count */}
            {searchQuery.trim() && (
              <p className="text-muted-foreground mb-4">
                {filteredSurahs.length > 0
                  ? `تم العثور على ${filteredSurahs.length} سورة`
                  : "لم يتم العثور على نتائج"}
              </p>
            )}

            {/* Surahs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSurahs.map((surah, index) => (
                <SurahCard key={surah.number} surah={surah} index={index} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default QuranPage;
