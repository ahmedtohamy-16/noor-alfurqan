import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Trash2, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { Post, toggleLike, isPostLiked, deletePost } from "@/services/socialService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  onDelete?: () => void;
}

const formatTime = (ts: any) => {
  if (!ts?.toMillis) return "";
  const diff = Date.now() - ts.toMillis();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} س`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ي`;
  return new Date(ts.toMillis()).toLocaleDateString("ar");
};

const renderContent = (text: string) => {
  const parts = text.split(/(#[\p{L}\p{N}_]+)/gu);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      const tag = part.slice(1).toLowerCase();
      return (
        <Link
          key={i}
          to={`/social-search?q=%23${encodeURIComponent(tag)}`}
          className="text-primary hover:underline"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const PostCard = ({ post, onDelete }: PostCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes_count);
  const [busy, setBusy] = useState(false);

  // Lazy load like state
  useState(() => {
    if (user) {
      isPostLiked(post.id, user.uid).then(setLiked);
    }
  });

  const handleLike = async () => {
    if (!user) {
      toast.error("سجّل الدخول للتفاعل");
      return;
    }
    if (busy) return;
    setBusy(true);
    // optimistic
    setLiked((prev) => !prev);
    setLikes((c) => c + (liked ? -1 : 1));
    try {
      const newState = await toggleLike(post.id, user.uid);
      setLiked(newState);
    } catch {
      // revert
      setLiked((prev) => !prev);
      setLikes((c) => c + (liked ? 1 : -1));
      toast.error("حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.uid !== post.author_uid) return;
    if (!confirm("حذف المنشور؟")) return;
    try {
      await deletePost(post.id, post.author_uid);
      toast.success("تم الحذف");
      onDelete?.();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط");
  };

  const VisibilityIcon =
    post.visibility === "private" ? Lock : post.visibility === "friends" ? Users : null;

  return (
    <article className="bg-card border border-border rounded-2xl p-4 transition-shadow hover:shadow-md">
      {/* Header */}
      <header className="flex items-start gap-3 mb-3">
        <Link to={`/u/${post.author_username}`} className="shrink-0">
          <Avatar className="w-11 h-11 ring-1 ring-border">
            <AvatarImage src={post.author_avatar || undefined} alt={post.author_display_name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {post.author_display_name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              to={`/u/${post.author_username}`}
              className="font-semibold text-foreground hover:underline truncate"
            >
              {post.author_display_name}
            </Link>
            {post.author_verified && (
              <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />
            )}
            <span className="text-muted-foreground text-sm truncate">
              @{post.author_username}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{formatTime(post.created_at)}</span>
            {VisibilityIcon && (
              <>
                <span>·</span>
                <VisibilityIcon className="w-3 h-3" />
              </>
            )}
          </div>
        </div>

        {user?.uid === post.author_uid && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="w-4 h-4 ml-2" /> حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* Content */}
      {post.content && (
        <Link to={`/post/${post.id}`} className="block">
          <p className="whitespace-pre-wrap break-words text-foreground leading-relaxed mb-3 arabic-ui">
            {renderContent(post.content)}
          </p>
        </Link>
      )}

      {/* Media */}
      {post.media_urls?.length > 0 && (
        <div
          className={cn(
            "grid gap-1 rounded-xl overflow-hidden mb-3",
            post.media_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {post.media_urls.slice(0, 4).map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              loading="lazy"
              className="w-full aspect-square object-cover bg-muted"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <footer className="flex items-center gap-1 -mx-2 pt-1 border-t border-border/50 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={cn("gap-1.5 flex-1", liked && "text-destructive")}
        >
          <Heart className={cn("w-4 h-4", liked && "fill-current")} />
          <span className="text-xs">{likes > 0 ? likes : ""}</span>
        </Button>

        <Link to={`/post/${post.id}`} className="flex-1">
          <Button variant="ghost" size="sm" className="gap-1.5 w-full">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">
              {post.comments_count > 0 ? post.comments_count : ""}
            </span>
          </Button>
        </Link>

        <Button variant="ghost" size="sm" onClick={handleShare} className="flex-1">
          <Share2 className="w-4 h-4" />
        </Button>
      </footer>
    </article>
  );
};

export default PostCard;
