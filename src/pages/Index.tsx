import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Book,
  Users,
  ChevronLeft,
  BookOpen,
  Sunrise,
  Library,
  Clock,
  Compass,
  CircleDot,
  Sparkles,
  MessageSquare,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import DailyHadithCard from "@/components/DailyHadithCard";
import NextPrayerWidget from "@/components/NextPrayerWidget";
import PostCard from "@/components/social/PostCard";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useAuth } from "@/hooks/useAuth";
import { getOrCreateGuestId } from "@/services/guestIdentityService";
import { getPublicFeed, type Post } from "@/services/socialService";
import { cn } from "@/lib/utils";

type Mode = "islamic" | "social";
const MODE_KEY = "noor:home-mode";

const Index = () => {
  const { lastRead } = useReadingProgress();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem(MODE_KEY) as Mode) || "islamic"
  );

  // Splash → Welcome on first visit for guests; also create guest ID
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

  const switchMode = (m: Mode) => {
    setMode(m);
    localStorage.setItem(MODE_KEY, m);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4 arabic-ui max-w-3xl">
        {/* Mode Toggle (Islamic / Social) */}
        <div className="grid grid-cols-2 bg-muted/60 rounded-2xl p-1 mb-5 sticky top-16 z-30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => switchMode("islamic")}
            className={cn(
              "py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === "islamic"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground"
            )}
          >
            <Book className="w-4 h-4" />
            إسلامي
          </button>
          <button
            type="button"
            onClick={() => switchMode("social")}
            className={cn(
              "py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
              mode === "social"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            اجتماعي
          </button>
        </div>

        {mode === "islamic" ? <IslamicHome lastRead={lastRead} /> : <SocialHome />}
      </main>
    </div>
  );
};

/* =================================================================== */
/*                            ISLAMIC MODE                              */
/* =================================================================== */

const IslamicHome = ({ lastRead }: { lastRead: any }) => {
  const services = [
    { icon: Book, title: "القرآن الكريم", link: "/quran", color: "bg-primary/10 text-primary" },
    { icon: Clock, title: "مواقيت الصلاة", link: "/prayer-times", color: "bg-emerald-500/10 text-emerald-600" },
    { icon: Sunrise, title: "الأذكار", link: "/azkar", color: "bg-teal-500/10 text-teal-600" },
    { icon: Compass, title: "القبلة", link: "/prayer-times", color: "bg-amber-500/10 text-amber-600" },
    { icon: CircleDot, title: "السبحة", link: "/tasbih", color: "bg-indigo-500/10 text-indigo-600" },
    { icon: Library, title: "الأحاديث", link: "/hadith", color: "bg-rose-500/10 text-rose-600" },
  ];

  return (
    <div className="space-y-5 animate-[fade-in_0.3s_ease-out]">
      {/* Next Prayer Widget */}
      <NextPrayerWidget />

      {/* Last read */}
      {lastRead && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">آخر قراءة</p>
                <p className="font-bold text-foreground text-sm">{lastRead.surah_name}</p>
                <p className="text-xs text-muted-foreground">الآية {lastRead.ayah_number}</p>
              </div>
            </div>
            <Link to={`/surah/${lastRead.surah_number}`}>
              <Button size="sm" className="gap-1">
                متابعة
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Islamic services grid */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3 text-right">
          الخدمات الإسلامية
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {services.map((s) => (
            <Link key={s.title} to={s.link}>
              <Card className="p-4 h-full hover:shadow-md transition-all group cursor-pointer hover:scale-[1.03] flex flex-col items-center justify-center text-center gap-2">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    s.color
                  )}
                >
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-xs">{s.title}</h3>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Daily Hadith */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-3 text-right flex items-center gap-2 justify-end">
          <Sparkles className="w-4 h-4 text-accent" />
          آية / حديث اليوم
        </h2>
        <DailyHadithCard />
      </section>
    </div>
  );
};

/* =================================================================== */
/*                            SOCIAL MODE                               */
/* =================================================================== */

const SocialHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublicFeed(5)
      .then((res: any) => {
        if (cancelled) return;
        // getPublicFeed may return either an array or {posts, lastDoc}
        const list: Post[] = Array.isArray(res) ? res : res?.posts || [];
        setPosts(list);
      })
      .catch((e) => {
        console.error("Failed to load feed:", e);
        if (!cancelled) setPosts([]);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5 animate-[fade-in_0.3s_ease-out]">
      {/* Stories strip (placeholder) */}
      <section>
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* Your story */}
          <button
            onClick={() => (user ? navigate("/feed") : navigate("/auth"))}
            className="flex flex-col items-center gap-1.5 shrink-0 group"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary/40 group-hover:border-primary transition-colors">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">قصتك</span>
          </button>
          {/* Placeholder stories */}
          {["أحمد", "سارة", "محمد", "نور", "يوسف"].map((name) => (
            <div key={name} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 p-[2px]">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-sm font-bold text-foreground">
                  {name[0]}
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick CTA */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="flex items-center justify-between gap-3">
          <div className="text-right">
            <p className="font-bold text-foreground text-sm">شارك خاطرة أو آية</p>
            <p className="text-xs text-muted-foreground">انشر مع المجتمع المسلم</p>
          </div>
          <Button
            size="sm"
            onClick={() => (user ? navigate("/feed") : navigate("/auth"))}
            className="gap-1"
          >
            <MessageSquare className="w-4 h-4" />
            انشر
          </Button>
        </div>
      </Card>

      {/* Feed preview */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <Link to="/feed" className="text-xs text-primary hover:underline font-medium">
            عرض الكل ←
          </Link>
          <h2 className="text-lg font-bold text-foreground">آخر المنشورات</h2>
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
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
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
          <Card className="p-6 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground mb-3">
              لا توجد منشورات بعد. كن أول من ينشر!
            </p>
            <Button
              size="sm"
              onClick={() => (user ? navigate("/feed") : navigate("/auth"))}
            >
              ابدأ الآن
            </Button>
          </Card>
        )}
      </section>
    </div>
  );
};

export default Index;
