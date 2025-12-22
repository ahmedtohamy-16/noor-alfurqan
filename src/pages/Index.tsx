import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import SurahCard from "@/components/SurahCard";
import LastReadCard from "@/components/LastReadCard";
import { surahs } from "@/data/surahs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [filter, setFilter] = useState<"all" | "meccan" | "medinan">("all");

  const filteredSurahs = surahs.filter((surah) => {
    if (filter === "all") return true;
    if (filter === "meccan") return surah.revelationType === "Meccan";
    return surah.revelationType === "Medinan";
  });

  // Mock last read data (would come from localStorage or backend)
  const lastRead = {
    surahName: "سورة البقرة",
    surahNumber: 2,
    ayahNumber: 142,
    progress: 49,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Last Read Section */}
        <section className="mb-12">
          <div className="max-w-md">
            <LastReadCard {...lastRead} />
          </div>
        </section>

        {/* Surah Index Section */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-foreground">فهرس السور</h2>
            
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="meccan">مكية</TabsTrigger>
                <TabsTrigger value="medinan">مدنية</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSurahs.map((surah, index) => (
              <SurahCard key={surah.number} surah={surah} index={index} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center arabic-ui">
          <p className="text-muted-foreground">
            نور القرآن - تطبيق لقراءة القرآن الكريم
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
