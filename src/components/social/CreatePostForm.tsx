import { useState } from "react";
import { ImagePlus, Globe, Users, Lock, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPost,
  PostVisibility,
  SocialProfile,
} from "@/services/socialService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatePostFormProps {
  profile: SocialProfile;
  onCreated?: () => void;
  compact?: boolean;
}

const CreatePostForm = ({ profile, onCreated, compact = false }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [submitting, setSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const moderate = async (text: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke("moderate-content", {
        body: { content: text },
      });
      if (error) return true; // fail-open
      if (data?.allowed === false) {
        toast.error(data.reason || "المحتوى غير مسموح به");
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && imageUrls.length === 0) return;
    setSubmitting(true);
    try {
      if (content.trim()) {
        const ok = await moderate(content);
        if (!ok) {
          setSubmitting(false);
          return;
        }
      }
      await createPost(profile, {
        content,
        media_urls: imageUrls,
        visibility,
      });
      setContent("");
      setImageUrls([]);
      toast.success("تم النشر");
      onCreated?.();
    } catch (e: any) {
      toast.error(e.message || "فشل النشر");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddImage = () => {
    const url = prompt("رابط الصورة:");
    if (url && /^https?:\/\//.test(url)) {
      setImageUrls((prev) => [...prev, url].slice(0, 4));
    }
  };

  const remaining = 2000 - content.length;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={profile.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {profile.display_name?.[0]}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 2000))}
            placeholder="بمَ تفكر يا أخي؟"
            rows={compact ? 2 : 3}
            className="resize-none border-0 px-0 focus-visible:ring-0 text-base bg-transparent arabic-ui"
            dir="auto"
          />

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden">
                  <img src={url} alt="" className="w-full aspect-square object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setImageUrls((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 left-1 h-6 w-6"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddImage}
                disabled={imageUrls.length >= 4}
                title="إضافة صورة"
              >
                <ImagePlus className="w-4 h-4" />
              </Button>

              <Select value={visibility} onValueChange={(v) => setVisibility(v as PostVisibility)}>
                <SelectTrigger className="h-8 w-auto gap-1 border-0 px-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" /> الجميع
                    </span>
                  </SelectItem>
                  <SelectItem value="friends">
                    <span className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> الأصدقاء
                    </span>
                  </SelectItem>
                  <SelectItem value="private">
                    <span className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5" /> خاص
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs ${remaining < 100 ? "text-destructive" : "text-muted-foreground"}`}>
                {remaining}
              </span>
              <Button
                onClick={handleSubmit}
                disabled={submitting || (!content.trim() && imageUrls.length === 0)}
                size="sm"
                className="rounded-full"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "نشر"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostForm;
