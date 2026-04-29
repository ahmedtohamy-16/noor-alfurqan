import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PostCard from "@/components/social/PostCard";
import CreatePostForm from "@/components/social/CreatePostForm";
import SetupSocialProfileDialog from "@/components/social/SetupSocialProfileDialog";
import { useAuth } from "@/hooks/useAuth";
import { useSocialProfile } from "@/hooks/useSocialProfile";
import {
  getPublicFeed,
  getFollowingFeed,
  Post,
} from "@/services/socialService";
import { Sparkles, UserCheck, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeedPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, loading: profileLoading, needsSetup, refresh } = useSocialProfile();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"foryou" | "following" | "friends">("foryou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFeed = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (tab === "foryou") {
        const { posts } = await getPublicFeed(20);
        setPosts(posts);
      } else if (tab === "following" || tab === "friends") {
        // Friends == accepted follows (mutual handled later)
        const p = await getFollowingFeed(user.uid, 20);
        setPosts(p);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, profile?.uid]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <MessageSquare className="w-16 h-16 mx-auto text-primary/40 mb-4" />
          <h1 className="text-2xl font-bold mb-2 arabic-ui">انضم لمجتمع نور الفرقان</h1>
          <p className="text-muted-foreground mb-6 arabic-ui">
            سجّل الدخول للمشاركة في النقاش ومتابعة إخوانك
          </p>
          <Button onClick={() => navigate("/auth")} size="lg">
            تسجيل الدخول
          </Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>المجتمع - نور الفرقان</title>
        <meta name="description" content="شارك ونتابع إخوانك في مجتمع نور الفرقان الإسلامي" />
      </Helmet>
      <Header />

      <SetupSocialProfileDialog open={needsSetup} onComplete={refresh} />

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        <h1 className="sr-only">المجتمع</h1>

        {profile && <CreatePostForm profile={profile} onCreated={loadFeed} />}

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 sticky top-16 z-30 bg-background/95 backdrop-blur-md">
            <TabsTrigger value="foryou" className="gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5" /> لك
            </TabsTrigger>
            <TabsTrigger value="following" className="gap-1.5 text-xs sm:text-sm">
              <UserCheck className="w-3.5 h-3.5" /> المتابَعون
            </TabsTrigger>
            <TabsTrigger value="friends" className="gap-1.5 text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5" /> الأصدقاء
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4 space-y-3">
            {loading && (
              <>
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </>
            )}
            {!loading && posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground arabic-ui">
                {tab === "foryou"
                  ? "لا توجد منشورات بعد. كن أول من ينشر!"
                  : "تابع إخوانك لرؤية منشوراتهم هنا"}
              </div>
            )}
            {!loading &&
              posts.map((p) => <PostCard key={p.id} post={p} onDelete={loadFeed} />)}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default FeedPage;
