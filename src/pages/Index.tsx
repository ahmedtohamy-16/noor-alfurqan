import { Link } from "react-router-dom";
import {
  Book,
  Clock,
  Star,
  Users,
  Search,
  ChevronLeft,
  BookOpen,
  BarChart3,
  Target,
  Sunrise,
  ScrollText,
  Shield,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import NextPrayerWidgetEnhanced from "@/components/NextPrayerWidgetEnhanced";
import LocationButton from "@/components/LocationButton";
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
      icon: BookOpen,
      title: "صفحات المصحف",
      description: "عرض بنمط المصحف",
      link: "/mushaf",
      color: "bg-amber-500/10 text-amber-600",
    },
    {
      icon: Sunrise,
      title: "الأذكار",
      description: "أذكار الصباح والمساء والخ",
      link: "/azkar",
      color: "bg-teal-500/10 text-teal-600",
    },
    {
      icon: Shield,
      title: "الرقية الشرعية",
      description: "رُّقَى منقولة عن النبي ﷺ",
      link: "/ruqyah",
      color: "bg-rose-500/10 text-rose-600",
    },
    {
      icon: Star,
      title: "المفضلة",
      description: "آياتك المحفوظة",
      link: "/favorites",
      color: "bg-destructive/10 text-destructive",
    },
    {
      icon: Target,
      title: "الورد اليومي",
      description: "حافظ على وردك",
      link: "/daily-wird",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: BarChart3,
      title: "الإحصائيات",
      description: "تتبع تقدمك",
      link: "/reading-stats",
      color: "bg-purple-500/10 text-purple-600",
    },
    {
      icon: ScrollText,
      title: "قصص الأنبياء",
      description: "قصص الأنبياء ومنقولة مع توضيحات وسرد من القرآن",
      link: "/prophet-stories",
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      icon: Users,
      title: "الختمة الجماعية",
      description: "اختم مع أصدقائك",
      link: "/khatmah",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      icon: Clock,
      title: "مواقيت الصلاة",
      description: "أوقات الصلاة اليومية",
      link: "/prayer-times",
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 md:py-16">
        {/* Location Button - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <LocationButton />
        </div>

        <div className="container mx-auto px-4 text-center arabic-ui">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">نور الفرقان</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              تطبيق شامل لقراءة القرآن الكريم والاستماع إليه
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/quran">
                <Button size="lg" className="gap-2 text-lg px-8">
                  <Book className="w-5 h-5" />
                  ابدأ القراءة
                </Button>
              </Link>
              <Link to="/mushaf">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
                  <BookOpen className="w-5 h-5" />
                  صفحات المصحف
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
      </section>

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Next Prayer Widget */}
        <section className="mb-8">
          <NextPrayerWidgetEnhanced />
        </section>

        {/* Last Read Card */}
        {lastRead && (
          <section className="mb-8">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">آخر قراءة</p>
                    <p className="font-bold text-foreground">{lastRead.surah_name}</p>
                    <p className="text-sm text-muted-foreground">الآية {lastRead.ayah_number}</p>
                  </div>
                </div>
                <Link to={`/surah/${lastRead.surah_number}`}>
                  <Button className="gap-2">
                    متابعة القراءة
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          </section>
        )}

        {/* Features Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">الميزات</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Link key={feature.title} to={feature.link}>
                <Card className="p-5 h-full hover:shadow-lg transition-all group cursor-pointer hover:scale-[1.02]">
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
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
                <Card className="p-3 text-center hover:bg-accent/10 transition-colors cursor-pointer hover:shadow-md">
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
          <p className="text-muted-foreground">نور الفرقان - تطبيق لقراءة القرآن الكريم</p>
          <p className="text-sm text-muted-foreground mt-2">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
