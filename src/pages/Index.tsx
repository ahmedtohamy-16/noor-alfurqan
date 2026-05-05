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
  Plus,
  MoreHorizontal,
  PenLine,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import NextPrayerHeroCard from "@/components/NextPrayerHeroCard";
import VerseOfTheDayCard from "@/components/VerseOfTheDayCard";
import PostCard from "@/components/social/PostCard";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/hooks/useAuth";
import { getOrCreateGuestId } from "@/services/guestIdentityService";
import { getPublicFeed, type Post } from "@/services/socialService";
import { useHomeMode, type HomeMode } from "@/hooks/useHomeMode";
import { cn } from "@/lib/utils";

const Index = () => {
  const { lastRead } = useReadingProgress();
  const { user, isLoading } = useAuth();
  const { mode, setMode } = useHomeMode();
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
      <Header />

      <main className="container mx-auto px-4 py-4 arabic-ui max-w-3xl">
        {/* Mode Toggle */}
        <ModeToggle mode={mode} setMode={setMode} />

        {mode === "islamic" ? <IslamicHome lastRead={lastRead} /> : <SocialHome />}

        {/* Bottom spacer so content doesn't hide behind nav */}
        <div className="h-24" />
      </main>
    </div>
  );
};

const ModeToggle = ({ mode, setMode }: { mode: HomeMode; setMode: (m: HomeMode) => void }) => (
  <div className="grid grid-cols-2 bg-muted/60 rounded-2xl p-1 mb-5 arabic-ui">
    <button
      type="button"
      onClick={() => setMode("islamic")}
      className={cn(
        "py-2.5 rounded-xl text-sm font-bold transition-all",
        mode === "islamic"
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground"
      )}
    >
      إسلامي
    </button>
    <button
      type="button"
      onClick={() => setMode("social")}
      className={cn(
        "py-2.5 rounded-xl text-sm font-bold transition-all",
        mode === "social"
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground"
      )}
    >
      اجتماعي
    </button>
  </div>
);

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

/* ===================== SOCIAL MODE ===================== */
const SocialHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublicFeed(8)
      .then((res: any) => {
        if (cancelled) return;
        const list: Post[] = Array.isArray(res) ? res : res?.posts || [];
        setPosts(list);
      })
      .catch((e) => {
        console.error("Failed to load feed:", e);
        if (!cancelled) setPosts([]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const goCreate = () => (user ? navigate("/create-post") : navigate("/auth"));

  return (
    <div className="space-y-5 animate-[fade-in_0.3s_ease-out] arabic-ui">
      {/* Quick post composer trigger */}
      <Card
        className="p-3 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={goCreate}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {((user as any)?.displayName || "ض")[0]}
          </div>
          <div className="flex-1 text-right text-muted-foreground text-sm">
            شارك خاطرة، آية، أو صورة...
          </div>
          <Button size="icon" className="rounded-full" aria-label="إنشاء منشور">
            <PenLine className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Feed */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <Link to="/feed" className="text-xs text-primary hover:underline font-medium">
            عرض الكل ←
          </Link>
          <h2 className="text-base font-bold text-foreground">أحدث المنشورات</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-2 bg-muted rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-4/5" />
              </Card>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
            <div className="text-center pt-2">
              <Link to="/feed">
                <Button variant="outline" size="sm" className="gap-1">
                  المزيد من المنشورات
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-bold text-foreground mb-1">لا توجد منشورات بعد</h3>
            <p className="text-sm text-muted-foreground mb-4">كن أول من يشارك خاطرة أو آية مع المجتمع</p>
            <Button size="sm" onClick={goCreate} className="gap-1">
              <PenLine className="w-4 h-4" />
              ابدأ منشورك الأول
            </Button>
          </Card>
        )}
      </section>
    </div>
  );
};

export default Index;
