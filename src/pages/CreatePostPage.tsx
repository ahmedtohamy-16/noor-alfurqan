import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ImagePlus, Hash, MapPin, Globe, Lock, Users, Plus, Loader2, Image as ImageIcon, Video, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useSocialProfile } from "@/hooks/useSocialProfile";
import { createPost, type PostVisibility } from "@/services/socialService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PostType = "post" | "reel" | "islamic";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, needsSetup } = useSocialProfile();
  const [type, setType] = useState<PostType>("post");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>("public");
  const [allowComments, setAllowComments] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-6 text-center max-w-sm">
          <p className="mb-4 arabic-ui">يجب تسجيل الدخول للنشر</p>
          <Button onClick={() => navigate("/auth")}>تسجيل الدخول</Button>
        </Card>
      </div>
    );
  }

  const moderate = async (text: string) => {
    try {
      const { data } = await supabase.functions.invoke("moderate-content", { body: { content: text } });
      if (data?.allowed === false) {
        toast.error(data.reason || "المحتوى غير مسموح به");
        return false;
      }
    } catch {}
    return true;
  };

  const handleSubmit = async () => {
    if (!profile) {
      toast.error("يرجى إعداد حسابك الاجتماعي أولاً");
      return;
    }
    if (!caption.trim() && imageUrls.length === 0) {
      toast.error("أضف نصاً أو صورة");
      return;
    }
    setSubmitting(true);
    try {
      const fullContent = [caption, hashtags && `\n${hashtags}`, location && `\n📍 ${location}`]
        .filter(Boolean)
        .join("");
      if (caption.trim()) {
        const ok = await moderate(fullContent);
        if (!ok) { setSubmitting(false); return; }
      }
      await createPost(profile, {
        content: fullContent,
        media_urls: imageUrls,
        visibility,
      });
      toast.success("تم النشر بنجاح");
      navigate("/feed");
    } catch (e: any) {
      toast.error(e.message || "فشل النشر");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddImage = () => {
    const url = prompt("الصق رابط الصورة (https://...):");
    if (url && /^https?:\/\//.test(url)) {
      setImageUrls((p) => [...p, url].slice(0, 4));
    } else if (url) {
      toast.error("رابط غير صالح");
    }
  };

  const types: { key: PostType; label: string; icon: any }[] = [
    { key: "post", label: "Post", icon: ImageIcon },
    { key: "reel", label: "Reel", icon: Video },
    { key: "islamic", label: "Islamic Post", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} aria-label="إغلاق" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">Create Post</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-4 space-y-4 arabic-ui">
        {/* Type selector */}
        <div className="flex gap-2">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-bold transition-all",
                type === t.key
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-card border-border text-muted-foreground"
              )}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Media */}
        {imageUrls.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden">
                <img src={url} alt="" className="w-full aspect-video object-cover" />
                <button
                  onClick={() => setImageUrls((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-2 left-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAddImage}
          disabled={imageUrls.length >= 4}
          className="w-full h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Caption */}
        <div>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 2000))}
            placeholder="Write a caption..."
            rows={3}
            className="resize-none rounded-xl border-border bg-muted/30"
            dir="auto"
          />
          <p className="text-[10px] text-muted-foreground text-left mt-1">{2000 - caption.length}</p>
        </div>

        {/* Hashtags */}
        <Card className="p-3 flex items-center gap-3">
          <Hash className="w-4 h-4 text-muted-foreground" />
          <Input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="Hashtags"
            className="border-0 px-0 h-7 focus-visible:ring-0 bg-transparent"
            dir="auto"
          />
        </Card>

        {/* Location */}
        <Card className="p-3 flex items-center gap-3">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add Location"
            className="border-0 px-0 h-7 focus-visible:ring-0 bg-transparent"
            dir="auto"
          />
        </Card>

        {/* Visibility */}
        <Card className="p-3 flex items-center justify-between gap-3">
          <Select value={visibility} onValueChange={(v) => setVisibility(v as PostVisibility)}>
            <SelectTrigger className="w-auto border-0 h-7 px-2 text-primary font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public"><span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Public</span></SelectItem>
              <SelectItem value="friends"><span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Friends</span></SelectItem>
              <SelectItem value="private"><span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Private</span></SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">Who can view this post?</span>
        </Card>

        {/* Allow comments */}
        <Card className="p-3 flex items-center justify-between gap-3">
          <Switch checked={allowComments} onCheckedChange={setAllowComments} />
          <span className="text-sm">Allow Comments</span>
        </Card>

        {needsSetup && (
          <Card className="p-3 bg-amber-500/10 border-amber-500/30">
            <p className="text-xs text-amber-700">
              قبل النشر، اضبط ملفك الاجتماعي من صفحة الملف الشخصي.
            </p>
          </Card>
        )}

        {/* Spacer */}
        <div className="h-20" />
      </main>

      {/* Sticky Share button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border p-3">
        <div className="container max-w-2xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={submitting || (!caption.trim() && imageUrls.length === 0)}
            className="w-full h-12 rounded-xl text-base font-bold"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Share"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
