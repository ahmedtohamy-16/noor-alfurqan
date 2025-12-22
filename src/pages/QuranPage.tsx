import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import SurahCard from "@/components/SurahCard";
import { surahs } from "@/data/surahs";

const QuranPage = () => {
  const [filter, setFilter] = useState<"all" | "meccan" | "medinan">("all");

  const filteredSurahs = surahs.filter((surah) => {
    if (filter === "all") return true;
    if (filter === "meccan") return surah.revelationType === "Meccan";
    return surah.revelationType === "Medinan";
  });

  return (
    <div className="min-h-screen bg-background">
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
              فهرس السور
            </h1>
            <p className="text-muted-foreground text-sm">١١٤ سورة</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full max-w-sm">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="meccan">مكية</TabsTrigger>
            <TabsTrigger value="medinan">مدنية</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Surahs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSurahs.map((surah, index) => (
            <SurahCard key={surah.number} surah={surah} index={index} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default QuranPage;
