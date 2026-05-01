import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Play, UserPlus, Sparkles, Book } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getPublicFeed, type Post } from "@/services/socialService";

type Tab = "all" | "users" | "reels" | "islamic";

const SUGGESTED_USERS = [
  { name: "Sara Alotaibi", username: "sara_20", avatar: "" },
  { name: "Mohammed Alharbi", username: "m_alharbi", avatar: "" },
  { name: "Nour Abdullah", username: "nour_10", avatar: "" },
];

const ISLAMIC_CONTENT = [
  { title: "أهمية أذكار الصباح", subtitle: "Azkar", icon: Sparkles, color: "bg-emerald-500/10 text-emerald-600", link: "/azkar" },
  { title: "فوائد تلاوة القرآن يومياً", subtitle: "Quran", icon: Book, color: "bg-primary/10 text-primary", link: "/quran" },
];

const ExplorePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicFeed(6)
      .then((res: any) => {
        const list: Post[] = Array.isArray(res) ? res : res?.posts || [];
        setPosts(list);
      })
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "users", label: "Users" },
    { key: "reels", label: "Reels" },
    { key: "islamic", label: "Islamic" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-lg border-b border-border">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate("/notifications")}
            className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center"
            aria-label="الإشعارات"
          >
            <Bell className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">Explore</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-4 space-y-5 arabic-ui">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for users, reels or posts..."
            className="pr-10 rounded-full bg-muted/50 border-0 h-11"
            dir="auto"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                tab === t.key
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                  : "bg-card text-foreground border-border"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Trending Reels */}
        {(tab === "all" || tab === "reels") && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <Link to="/feed" className="text-xs text-primary font-medium">See all</Link>
              <h2 className="text-sm font-bold">Trending Reels</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { views: "125K", gradient: "from-amber-500 to-rose-700" },
                { views: "83K", gradient: "from-emerald-600 to-teal-900" },
                { views: "152K", gradient: "from-indigo-600 to-purple-900" },
              ].map((r, i) => (
                <Card key={i} className={cn("relative aspect-[3/4] overflow-hidden border-0 cursor-pointer", "bg-gradient-to-br", r.gradient)}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-bold">
                    <Play className="w-3 h-3 fill-white" />
                    {r.views}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Suggested Users */}
        {(tab === "all" || tab === "users") && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <button className="text-xs text-primary font-medium">See all</button>
              <h2 className="text-sm font-bold">Suggested Users</h2>
            </div>
            <div className="space-y-2">
              {SUGGESTED_USERS.map((u) => (
                <Card key={u.username} className="p-3 flex items-center justify-between">
                  <Button size="sm" variant="outline" className="rounded-full text-primary border-primary/30 gap-1">
                    <UserPlus className="w-3.5 h-3.5" />
                    Follow
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">{u.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Islamic Content */}
        {(tab === "all" || tab === "islamic") && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <button className="text-xs text-primary font-medium">See all</button>
              <h2 className="text-sm font-bold">Islamic Content</h2>
            </div>
            <div className="space-y-2">
              {ISLAMIC_CONTENT.map((c) => (
                <Link key={c.title} to={c.link}>
                  <Card className="p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", c.color)}>
                      <c.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-bold text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.subtitle}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest posts preview */}
        {tab === "all" && !loading && posts.length > 0 && (
          <section className="text-center pt-2">
            <Link to="/feed">
              <Button variant="outline" size="sm">عرض كل المنشورات ←</Button>
            </Link>
          </section>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;
