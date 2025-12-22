import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowRight, BookOpen, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { surahs } from "@/data/surahs";
import { useQuery } from "@tanstack/react-query";
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

const fetchAyahSearch = async (query: string): Promise<AyahResult[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/ar.alafasy`
    );
    const data = await response.json();
    return data.data?.matches || [];
  } catch {
    return [];
  }
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<"surah" | "ayah">("surah");

  // Filter surahs based on search query
  const filteredSurahs = surahs.filter((surah) => {
    if (!query.trim()) return false;
    return (
      surah.name.includes(query) ||
      surah.englishName.toLowerCase().includes(query.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(query.toLowerCase()) ||
      surah.number.toString() === query
    );
  });

  // Search for ayahs
  const { data: ayahResults, isLoading: isSearching } = useQuery({
    queryKey: ["ayahSearch", query],
    queryFn: () => fetchAyahSearch(query),
    enabled: searchType === "ayah" && query.trim().length >= 2,
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

  const ayahRef = parseAyahReference(query);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-foreground text-center mb-6">
            البحث في القرآن الكريم
          </h1>

          <div className="relative mb-4">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن سورة، كلمة، أو رقم آية (مثال: 2:255)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-12 h-14 text-lg rounded-xl border-2 focus:border-primary text-right"
            />
          </div>

          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "surah" | "ayah")} className="w-full">
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

            <TabsContent value="surah" className="mt-6">
              {/* Direct Ayah Reference */}
              {ayahRef && (
                <div className="mb-6">
                  <Link to={`/surah/${ayahRef.surah}#ayah-${ayahRef.ayah}`}>
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 hover:bg-primary/20 transition-colors">
                      <p className="text-sm text-primary mb-1">الذهاب مباشرة إلى:</p>
                      <p className="font-bold text-foreground">
                        سورة {surahs.find(s => s.number === ayahRef.surah)?.name || ayahRef.surah} - الآية {ayahRef.ayah}
                      </p>
                    </div>
                  </Link>
                </div>
              )}

              {query.trim() && (
                <div>
                  <p className="text-muted-foreground mb-4">
                    {filteredSurahs.length > 0
                      ? `تم العثور على ${filteredSurahs.length} نتيجة`
                      : "لم يتم العثور على نتائج"}
                  </p>

                  <div className="space-y-3">
                    {filteredSurahs.map((surah) => (
                      <Link
                        key={surah.number}
                        to={`/surah/${surah.number}`}
                        className="block"
                      >
                        <div className="bg-card hover:bg-surah-card-hover border border-border rounded-xl p-4 transition-all hover:shadow-md">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                              <span className="text-primary font-bold">
                                {surah.number}
                              </span>
                            </div>
                            <div className="flex-1 text-right">
                              <h3 className="text-lg font-bold text-foreground font-quran">
                                {surah.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {surah.englishNameTranslation} • {surah.numberOfAyahs} آية
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground rotate-180" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ayah" className="mt-6">
              {isSearching ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : query.trim().length < 2 ? (
                <p className="text-center text-muted-foreground py-8">
                  أدخل كلمتين على الأقل للبحث في الآيات
                </p>
              ) : ayahResults && ayahResults.length > 0 ? (
                <div>
                  <p className="text-muted-foreground mb-4">
                    تم العثور على {ayahResults.length} آية
                  </p>
                  <div className="space-y-4">
                    {ayahResults.slice(0, 50).map((ayah) => (
                      <Link
                        key={ayah.number}
                        to={`/surah/${ayah.surah.number}#ayah-${ayah.numberInSurah}`}
                        className="block"
                      >
                        <div className="bg-card hover:bg-surah-card-hover border border-border rounded-xl p-4 transition-all hover:shadow-md">
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
              ) : query.trim().length >= 2 ? (
                <p className="text-center text-muted-foreground py-8">
                  لم يتم العثور على نتائج
                </p>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Empty State */}
        {!query.trim() && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg mb-4">
              ابدأ بكتابة اسم السورة أو كلمة للبحث
            </p>
            <p className="text-sm text-muted-foreground">
              يمكنك أيضاً البحث برقم الآية مثل: 2:255 (آية الكرسي)
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
