import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, UserPlus, Users, FileText, Loader2, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  getPublicFeed,
  searchUsers,
  type Post,
  type SocialProfile,
} from "@/services/socialService";

type Tab = "all" | "users" | "posts";

const useDebounce = (value: string, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const ExplorePage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q.trim());
  const isSearching = debouncedQ.length > 0;

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  const [users, setUsers] = useState<SocialProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchPostsLoading, setSearchPostsLoading] = useState(false);
  const [searchedPosts, setSearchedPosts] = useState<Post[]>([]);

  // Initial public feed
  useEffect(() => {
    setPostsLoading(true);
    getPublicFeed(12)
      .then((res: any) => {
        const list: Post[] = Array.isArray(res) ? res : res?.posts || [];
        setPosts(list);
      })
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, []);

  // User search
  useEffect(() => {
    if (!debouncedQ) {
      setUsers([]);
      return;
    }
    setUsersLoading(true);
    searchUsers(debouncedQ.toLowerCase(), 20)
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, [debouncedQ]);

  // Filter posts client-side by content + hashtags when searching
  useEffect(() => {
    if (!debouncedQ) {
      setSearchedPosts([]);
      return;
    }
    setSearchPostsLoading(true);
    const term = debouncedQ.toLowerCase();
    // Use already-loaded public feed, plus widen search if needed
    getPublicFeed(50)
      .then((res: any) => {
        const list: Post[] = Array.isArray(res) ? res : res?.posts || [];
        const filtered = list.filter(
          (p) =>
            (p.content || "").toLowerCase().includes(term) ||
            (p.hashtags || []).some((h) => h.toLowerCase().includes(term)) ||
            (p.author_username || "").toLowerCase().includes(term) ||
            (p.author_display_name || "").toLowerCase().includes(term)
        );
        setSearchedPosts(filtered);
      })
      .catch(() => setSearchedPosts([]))
      .finally(() => setSearchPostsLoading(false));
  }, [debouncedQ]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "الكل" },
    { key: "users", label: "المستخدمون" },
    { key: "posts", label: "المنشورات" },
  ];

  const showUsers = tab === "all" || tab === "users";
  const showPosts = tab === "all" || tab === "posts";

  const visibleUsers = useMemo(() => users, [users]);
  const visiblePosts = isSearching ? searchedPosts : posts;

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
          <h1 className="text-base font-bold arabic-ui">استكشف</h1>
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
            placeholder="ابحث عن مستخدمين أو منشورات..."
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

        {/* Users section */}
        {showUsers && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                المستخدمون
              </h2>
            </div>

            {!isSearching ? (
              <Card className="p-6 text-center">
                <Search className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  ابحث باسم المستخدم لعرض النتائج
                </p>
              </Card>
            ) : usersLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : visibleUsers.length === 0 ? (
              <Card className="p-6 text-center">
                <Inbox className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  لا يوجد مستخدمون بهذا الاسم
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {visibleUsers.map((u) => (
                  <Card
                    key={u.uid}
                    onClick={() => navigate(`/u/${u.username}`)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full text-primary border-primary/30 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/u/${u.username}`);
                      }}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      عرض
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-sm">{u.display_name}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={u.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {u.display_name?.[0] || u.username?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Posts section */}
        {showPosts && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <Link to="/feed" className="text-xs text-primary font-medium">
                عرض الكل
              </Link>
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                المنشورات
              </h2>
            </div>

            {(isSearching ? searchPostsLoading : postsLoading) ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : visiblePosts.length === 0 ? (
              <Card className="p-8 text-center">
                <Inbox className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="font-bold text-foreground mb-1">
                  {isSearching ? "لا توجد نتائج" : "لا توجد منشورات"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isSearching ? "جرّب كلمات بحث مختلفة" : "لم يقم أحد بنشر شيء بعد"}
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {visiblePosts.slice(0, 8).map((p) => (
                  <Card
                    key={p.id}
                    onClick={() => navigate(`/post/${p.id}`)}
                    className="p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-9 h-9 flex-shrink-0">
                        <AvatarImage src={p.author_avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {p.author_display_name?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                          <span className="font-bold text-foreground">
                            {p.author_display_name}
                          </span>
                          <span>@{p.author_username}</span>
                        </div>
                        <p className="text-sm line-clamp-2">{p.content}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;
