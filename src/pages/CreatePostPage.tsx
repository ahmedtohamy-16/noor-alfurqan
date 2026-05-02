import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Hash, MapPin, Globe, Lock, Users, Plus, Loader2, Image as ImageIcon, Video, BookOpen } from "lucide-react";
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

interface UploadedItem {
  url: string;
  uploading: boolean;
}

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/quicktime"];

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
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_FILES - items.length;
    const list = Array.from(files).slice(0, remaining);

    for (const file of list) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`نوع غير مدعوم: ${file.name}`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} أكبر من 10MB`);
        continue;
      }
      const placeholder: UploadedItem = { url: URL.createObjectURL(file), uploading: true };
      setItems((p) => [...p, placeholder]);
      try {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from("post-media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (error) throw error;
        const { data: pub } = supabase.storage.from("post-media").getPublicUrl(path);
        setItems((p) =>
          p.map((it) =>
            it === placeholder ? { url: pub.publicUrl, uploading: false } : it
          )
        );
      } catch (e: any) {
        console.error(e);
        toast.error(e.message || `فشل رفع ${file.name}`);
        setItems((p) => p.filter((it) => it !== placeholder));
      }
    }
  };

  const removeItem = (idx: number) => {
    setItems((p) => p.filter((_, j) => j !== idx));
  };

  const handleSubmit = async () => {
    if (!profile) {
      toast.error("يرجى إعداد حسابك الاجتماعي أولاً");
      return;
    }
    if (items.some((it) => it.uploading)) {
      toast.error("في انتظار اكتمال رفع الصور...");
      return;
    }
    const mediaUrls = items.filter((it) => !it.uploading).map((it) => it.url);
    if (!caption.trim() && mediaUrls.length === 0) {
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
        media_urls: mediaUrls,
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

  const types: { key: PostType; label: string; icon: any }[] = [
    { key: "post", label: "منشور", icon: ImageIcon },
    { key: "reel", label: "ريل", icon: Video },
    { key: "islamic", label: "إسلامي", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} aria-label="إغلاق" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold arabic-ui">إنشاء منشور</h1>
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

        {/* Media grid */}
        {items.length > 0 && (
          <div className={cn("grid gap-2", items.length === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {items.map((it, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden bg-muted aspect-square">
                <img src={it.url} alt="" className="w-full h-full object-cover" />
                {it.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                <button
                  onClick={() => removeItem(i)}
                  className="absolute top-2 left-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center"
                  aria-label="إزالة"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden file input - opens device gallery / files */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={items.length >= MAX_FILES}
          className="w-full h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
        >
          <Plus className="w-6 h-6" />
          <span className="text-xs">
            {items.length >= MAX_FILES
              ? `الحد الأقصى ${MAX_FILES} ملفات`
              : "إضافة صور / فيديو من جهازك"}
          </span>
        </button>

        {/* Caption */}
        <div>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 2000))}
            placeholder="اكتب شيئاً..."
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
            placeholder="هاشتاجات #example"
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
            placeholder="إضافة موقع"
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
              <SelectItem value="public"><span className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> عام</span></SelectItem>
              <SelectItem value="friends"><span className="flex items-center gap-2"><Users className="w-3.5 h-3.5" /> الأصدقاء</span></SelectItem>
              <SelectItem value="private"><span className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> خاص</span></SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">من يرى المنشور؟</span>
        </Card>

        {/* Allow comments */}
        <Card className="p-3 flex items-center justify-between gap-3">
          <Switch checked={allowComments} onCheckedChange={setAllowComments} />
          <span className="text-sm">السماح بالتعليقات</span>
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
            disabled={
              submitting ||
              items.some((it) => it.uploading) ||
              (!caption.trim() && items.length === 0)
            }
            className="w-full h-12 rounded-xl text-base font-bold"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "نشر"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
