import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search as SearchIcon, Hash, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PostCard from "@/components/social/PostCard";
import {
  searchUsers,
  searchByHashtag,
  getTrendingHashtags,
  SocialProfile,
  Post,
} from "@/services/socialService";

const SocialSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [users, setUsers] = useState<SocialProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<{ tag: string; usage_count: number }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTrendingHashtags(10).then(setTrending);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setUsers([]);
      setPosts([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        if (q.startsWith("#")) {
          const p = await searchByHashtag(q);
          setPosts(p);
          setUsers([]);
        } else {
          const [u, p] = await Promise.all([searchUsers(q), searchByHashtag(q)]);
          setUsers(u);
          setPosts(p);
        }
        setSearchParams({ q }, { replace: true });
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>البحث في المجتمع - نور الفرقان</title>
      </Helmet>
      <Header />

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        <div className="relative">
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مستخدم أو #هاشتاج..."
            className="pr-10 h-11 arabic-ui"
          />
        </div>

        {!query.trim() && trending.length > 0 && (
          <section className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" /> الأكثر تداولاً
            </h2>
            <div className="flex flex-wrap gap-2">
              {trending.map((t) => (
                <Link
                  key={t.tag}
                  to={`/social-search?q=%23${encodeURIComponent(t.tag)}`}
                  onClick={() => setQuery(`#${t.tag}`)}
                  className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full hover:bg-primary/20 transition-colors"
                >
                  #{t.tag}
                  <span className="text-xs text-muted-foreground mr-1">({t.usage_count})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {loading && <Skeleton className="h-24 rounded-2xl" />}

        {users.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold flex items-center gap-2 px-1">
              <UserIcon className="w-4 h-4" /> المستخدمون
            </h2>
            {users.map((u) => (
              <Link
                key={u.uid}
                to={`/u/${u.username}`}
                className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:bg-accent/50 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={u.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {u.display_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate arabic-ui">{u.display_name}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">@{u.username}</div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {posts.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold flex items-center gap-2 px-1">
              <Hash className="w-4 h-4" /> المنشورات
            </h2>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </section>
        )}

        {!loading && query.trim() && users.length === 0 && posts.length === 0 && (
          <p className="text-center text-muted-foreground py-12 arabic-ui">لا توجد نتائج</p>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SocialSearchPage;
