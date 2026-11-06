import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Book,
  Users,
  ChevronLeft,
  BookOpen,
  Library,
  Clock,
  Compass,
  CircleDot,
  Sparkles,
  MoreHorizontal,
  PenLine,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import PageSeo from "@/components/PageSeo";
import NextPrayerHeroCard from "@/components/NextPrayerHeroCard";
import VerseOfTheDayCard from "@/components/VerseOfTheDayCard";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/hooks/useAuth";
import { getOrCreateGuestId } from "@/services/guestIdentityService";
import { cn } from "@/lib/utils";

const Index = () => {
  const { lastRead } = useReadingProgress();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Splash on first guest visit
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      getOrCreateGuestId();
      const seen = sessionStorage.getItem("noor:onboarded");
      if (!seen) {
        sessionStorage.setItem("noor:onboarded", "1");
        navigate("/splash", { replace: true });
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="نور الفرقان — القرآن الكريم والأذكار ومواقيت الصلاة"
        description="اقرأ القرآن الكريم واستمع إليه، وتابع الأحاديث والأذكار والسبحة ومواقيت الصلاة في تطبيق نور الفرقان بدون إعلانات."
        path="/"
      />
      <Header />

      <main className="container mx-auto px-4 py-4 arabic-ui max-w-3xl">
        <h1 className="sr-only">نور الفرقان — القرآن الكريم، مواقيت الصلاة، والأذكار</h1>
        <IslamicHome lastRead={lastRead} />

        {/* Bottom spacer so content doesn't hide behind nav */}
        <div className="h-24" />
      </main>
    </div>
  );
};


/* ===================== ISLAMIC MODE ===================== */
const IslamicHome = ({ lastRead }: { lastRead: any }) => {
  const services = [
    { icon: Book, title: "Quran", titleAr: "القرآن", link: "/quran", color: "bg-emerald-500/10 text-emerald-600" },
    { icon: Clock, title: "Prayer Times", titleAr: "الصلاة", link: "/prayer-times", color: "bg-blue-500/10 text-blue-600" },
    { icon: Sparkles, title: "Azkar", titleAr: "الأذكار", link: "/azkar", color: "bg-amber-500/10 text-amber-600" },
    { icon: Compass, title: "Qibla", titleAr: "القبلة", link: "/prayer-times", color: "bg-teal-500/10 text-teal-600" },
    { icon: CircleDot, title: "Tasbeeh", titleAr: "السبحة", link: "/tasbih", color: "bg-indigo-500/10 text-indigo-600" },
    { icon: Library, title: "Hadith", titleAr: "الأحاديث", link: "/hadith", color: "bg-rose-500/10 text-rose-600" },
    { icon: BookOpen, title: "Asma Ul Husna", titleAr: "أسماء الله", link: "/azkar", color: "bg-purple-500/10 text-purple-600" },
    { icon: MoreHorizontal, title: "More", titleAr: "المزيد", link: "/settings", color: "bg-slate-500/10 text-slate-600" },
  ];

  return (
    <div className="space-y-5 animate-[fade-in_0.3s_ease-out]">
      {/* Hero prayer card */}
      <NextPrayerHeroCard />

      {/* Last read */}
      {lastRead && (
        <Card className="p-3 bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/15 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground">آخر قراءة</p>
                <p className="font-bold text-foreground text-sm">{lastRead.surah_name} • الآية {lastRead.ayah_number}</p>
              </div>
            </div>
            <Link to={`/surah/${lastRead.surah_number}`}>
              <Button size="sm" variant="secondary" className="gap-1">
                متابعة
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Services Grid 4x2 */}
      <section>
        <h2 className="text-base font-bold text-foreground mb-3 text-center arabic-ui">الخدمات الإسلامية</h2>
        <div className="grid grid-cols-4 gap-3">
          {services.map((s) => (
            <Link key={s.title} to={s.link}>
              <Card className="p-3 h-full hover:shadow-md transition-all group cursor-pointer hover:scale-[1.04] flex flex-col items-center justify-center text-center gap-1.5 aspect-square">
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", s.color)}>
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-[10px] leading-tight">{s.titleAr}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Verse of the Day */}
      <VerseOfTheDayCard />
    </div>
  );
};


export default Index;
