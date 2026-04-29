import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BadgeCheck, Lock, Settings as SettingsIcon } from "lucide-react";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PostCard from "@/components/social/PostCard";
import { useAuth } from "@/hooks/useAuth";
import {
  getSocialProfileByUsername,
  getUserPosts,
  followUser,
  unfollowUser,
  getFollowStatus,
  SocialProfile,
  Post,
} from "@/services/socialService";
import { toast } from "sonner";

const SocialProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followStatus, setFollowStatus] = useState<"none" | "pending" | "accepted">("none");
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  const isOwnProfile = user?.uid === profile?.uid;

  useEffect(() => {
    if (!username) return;
    (async () => {
      setLoading(true);
      try {
        const p = await getSocialProfileByUsername(username);
        if (!p) {
          setLoading(false);
          return;
        }
        setProfile(p);
        const canSeePosts =
          !p.is_private || user?.uid === p.uid || followStatus === "accepted";
        if (canSeePosts) {
          const userPosts = await getUserPosts(p.uid);
          setPosts(userPosts);
        }
        if (user && user.uid !== p.uid) {
          const s = await getFollowStatus(user.uid, p.uid);
          setFollowStatus(s);
          if (p.is_private && s === "accepted") {
            const userPosts = await getUserPosts(p.uid);
            setPosts(userPosts);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, user?.uid]);

  const handleFollow = async () => {
    if (!user || !profile) {
      navigate("/auth");
      return;
    }
    setFollowing(true);
    try {
      if (followStatus === "none") {
        const newStatus = await followUser(user.uid, profile);
        setFollowStatus(newStatus);
        toast.success(newStatus === "pending" ? "تم إرسال طلب المتابعة" : "تمت المتابعة");
        if (newStatus === "accepted") {
          setProfile({ ...profile, followers_count: profile.followers_count + 1 });
        }
      } else {
        await unfollowUser(user.uid, profile.uid);
        const wasAccepted = followStatus === "accepted";
        setFollowStatus("none");
        toast.success("تم إلغاء المتابعة");
        if (wasAccepted) {
          setProfile({ ...profile, followers_count: Math.max(0, profile.followers_count - 1) });
        }
      }
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setFollowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-2 arabic-ui">المستخدم غير موجود</h1>
          <Button onClick={() => navigate("/feed")}>العودة للمجتمع</Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const canSeePosts = !profile.is_private || isOwnProfile || followStatus === "accepted";

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{`${profile.display_name} (@${profile.username}) - نور الفرقان`}</title>
        <meta name="description" content={profile.bio || `الملف الشخصي لـ ${profile.display_name}`} />
      </Helmet>
      <Header />

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {/* Profile header */}
        <section className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <Avatar className="w-20 h-20 ring-2 ring-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile.display_name?.[0]}
              </AvatarFallback>
            </Avatar>

            {isOwnProfile ? (
              <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                <SettingsIcon className="w-4 h-4 ml-1" /> تعديل
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={following}
                variant={followStatus === "accepted" ? "outline" : "default"}
                size="sm"
              >
                {followStatus === "accepted"
                  ? "متابَع"
                  : followStatus === "pending"
                  ? "قيد الانتظار"
                  : "متابعة"}
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xl font-bold arabic-ui">{profile.display_name}</h1>
              {profile.is_verified && <BadgeCheck className="w-5 h-5 text-primary fill-primary/20" />}
              {profile.is_private && <Lock className="w-4 h-4 text-muted-foreground" />}
            </div>
            <p className="text-sm text-muted-foreground" dir="ltr">@{profile.username}</p>
            {profile.bio && (
              <p className="text-sm mt-2 whitespace-pre-wrap arabic-ui">{profile.bio}</p>
            )}
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-border text-sm">
            <div>
              <span className="font-bold">{profile.posts_count || 0}</span>
              <span className="text-muted-foreground mr-1 arabic-ui">منشور</span>
            </div>
            <div>
              <span className="font-bold">{profile.followers_count || 0}</span>
              <span className="text-muted-foreground mr-1 arabic-ui">متابِع</span>
            </div>
            <div>
              <span className="font-bold">{profile.following_count || 0}</span>
              <span className="text-muted-foreground mr-1 arabic-ui">يتابع</span>
            </div>
          </div>
        </section>

        {/* Posts */}
        <section className="space-y-3">
          {!canSeePosts ? (
            <div className="text-center py-12 bg-card border border-border rounded-2xl">
              <Lock className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold arabic-ui">هذا الحساب خاص</p>
              <p className="text-sm text-muted-foreground arabic-ui">
                تابع هذا الحساب لرؤية المنشورات
              </p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground arabic-ui">
              لا توجد منشورات بعد
            </div>
          ) : (
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onDelete={() => setPosts((prev) => prev.filter((x) => x.id !== p.id))}
              />
            ))
          )}
        </section>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default SocialProfilePage;
