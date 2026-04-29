import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PostCard from "@/components/social/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { useSocialProfile } from "@/hooks/useSocialProfile";
import {
  getPost,
  getPostComments,
  addComment,
  Post,
  PostComment,
} from "@/services/socialService";
import { toast } from "sonner";

const PostDetailsPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useSocialProfile();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    if (!postId) return;
    setLoading(true);
    const [p, c] = await Promise.all([getPost(postId), getPostComments(postId)]);
    setPost(p);
    setComments(c);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleComment = async () => {
    if (!user || !profile || !post || !text.trim()) return;
    setPosting(true);
    try {
      await addComment(post.id, profile, text);
      setText("");
      const c = await getPostComments(post.id);
      setComments(c);
      setPost({ ...post, comments_count: post.comments_count + 1 });
    } catch (e: any) {
      toast.error(e.message || "فشل التعليق");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>{post ? `منشور ${post.author_display_name}` : "منشور"} - نور الفرقان</title>
      </Helmet>
      <Header />

      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ArrowRight className="w-4 h-4" /> رجوع
        </Button>

        {loading ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : !post ? (
          <p className="text-center text-muted-foreground py-12">المنشور غير موجود</p>
        ) : (
          <>
            <PostCard post={post} onDelete={() => navigate(-1)} />

            {/* Comment composer */}
            {user && profile ? (
              <div className="bg-card border border-border rounded-2xl p-3">
                <div className="flex gap-2">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {profile.display_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, 500))}
                    placeholder="اكتب تعليقاً..."
                    rows={2}
                    className="flex-1 resize-none arabic-ui"
                  />
                  <Button
                    size="icon"
                    onClick={handleComment}
                    disabled={posting || !text.trim()}
                    className="self-end"
                  >
                    {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-2">
                <Button variant="link" onClick={() => navigate("/auth")}>
                  سجّل الدخول للتعليق
                </Button>
              </div>
            )}

            {/* Comments */}
            <section className="space-y-2">
              {comments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">لا توجد تعليقات بعد</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-3 flex gap-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={c.author_avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {c.author_display_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm">{c.author_display_name}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">@{c.author_username}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words mt-0.5 arabic-ui">{c.content}</p>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default PostDetailsPage;
