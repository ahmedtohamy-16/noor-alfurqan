import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { surahs } from "@/data/surahs";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  // Filter surahs based on search query
  const filteredSurahs = surahs.filter((surah) => {
    if (!query.trim()) return false;
    return (
      surah.name.includes(query) ||
      surah.englishName.toLowerCase().includes(query.toLowerCase()) ||
      surah.englishNameTranslation.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-foreground text-center mb-6">
            البحث في القرآن الكريم
          </h1>

          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن سورة أو كلمة..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-12 h-14 text-lg rounded-xl border-2 focus:border-primary text-right"
            />
          </div>
        </div>

        {/* Search Results */}
        {query.trim() && (
          <div className="max-w-2xl mx-auto">
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

        {/* Empty State */}
        {!query.trim() && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              ابدأ بكتابة اسم السورة أو كلمة للبحث
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
