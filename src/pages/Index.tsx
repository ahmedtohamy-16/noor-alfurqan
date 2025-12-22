import { Link } from "react-router-dom";
import { Book, Clock, Star, Users, Settings, Search, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import PrayerTimes from "@/components/PrayerTimes";
import DailyWirdCard from "@/components/DailyWirdCard";
import LastReadCard from "@/components/LastReadCard";
import ReadingStatsCard from "@/components/ReadingStatsCard";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { lastRead } = useReadingProgress();
  const { user } = useAuth();

  const features = [
    {
      icon: Book,
      title: "القرآن الكريم",
      description: "تصفح وقراءة جميع السور",
      link: "/quran",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Search,
      title: "البحث",
      description: "ابحث في آيات القرآن",
      link: "/search",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Star,
      title: "المفضلة",
      description: "آياتك المحفوظة",
      link: "/favorites",
      color: "bg-destructive/10 text-destructive",
    },
    {
      icon: Users,
      title: "الختمة الجماعية",
      description: "اختم القرآن مع أصدقائك",
      link: "/khatmah",
      color: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center arabic-ui">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              نور الفرقان
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              تطبيق شامل لقراءة القرآن الكريم والاستماع إليه
            </p>
            <Link to="/quran">
              <Button size="lg" className="gap-2 text-lg px-8">
                <Book className="w-5 h-5" />
                ابدأ القراءة
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      </section>

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <PrayerTimes />
          <DailyWirdCard />
          <ReadingStatsCard />
          {lastRead ? (
            <LastReadCard
              surahName={lastRead.surah_name}
              surahNumber={lastRead.surah_number}
              ayahNumber={lastRead.ayah_number}
              progress={lastRead.progress_percentage}
            />
          ) : (
            <Card className="p-4 flex items-center justify-center">
              <div className="text-center">
                <Book className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">ابدأ قراءتك الأولى</p>
                <Link to="/quran">
                  <Button variant="link" className="mt-2">
                    تصفح السور
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Features Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">الميزات</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.link}>
                <Card className="p-6 h-full hover:shadow-lg transition-shadow group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-[-4px] transition-transform" />
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Access */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">الوصول السريع</h2>
            <Link to="/quran">
              <Button variant="ghost" size="sm" className="gap-1">
                عرض الكل
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { name: "الفاتحة", number: 1 },
              { name: "البقرة", number: 2 },
              { name: "آل عمران", number: 3 },
              { name: "يس", number: 36 },
              { name: "الملك", number: 67 },
              { name: "الكهف", number: 18 },
              { name: "الرحمن", number: 55 },
              { name: "الواقعة", number: 56 },
              { name: "الإخلاص", number: 112 },
              { name: "الناس", number: 114 },
            ].map((surah) => (
              <Link key={surah.number} to={`/surah/${surah.number}`}>
                <Card className="p-3 text-center hover:bg-accent/10 transition-colors cursor-pointer">
                  <p className="text-xs text-muted-foreground mb-1">سورة</p>
                  <p className="font-bold text-foreground">{surah.name}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="container mx-auto px-4 text-center arabic-ui">
          <p className="text-muted-foreground">
            نور الفرقان - تطبيق لقراءة القرآن الكريم
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
