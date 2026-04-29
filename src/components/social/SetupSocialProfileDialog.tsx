import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  createSocialProfile,
  isUsernameAvailable,
  isValidUsername,
} from "@/services/socialService";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface SetupSocialProfileDialogProps {
  open: boolean;
  onComplete: () => void;
}

const SetupSocialProfileDialog = ({ open, onComplete }: SetupSocialProfileDialogProps) => {
  const { user, userProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState(userProfile?.displayName || "");
  const [bio, setBio] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleUsernameChange = async (val: string) => {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
    setUsername(cleaned);
    setAvailable(null);
    if (cleaned.length < 3) return;
    if (!isValidUsername(cleaned)) return;
    setChecking(true);
    try {
      const ok = await isUsernameAvailable(cleaned);
      setAvailable(ok);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!isValidUsername(username) || available !== true) {
      toast.error("اختر اسم مستخدم صالح ومتاح");
      return;
    }
    if (!displayName.trim()) {
      toast.error("اكتب اسماً للعرض");
      return;
    }
    setSubmitting(true);
    try {
      await createSocialProfile(user.uid, {
        username,
        display_name: displayName.trim().slice(0, 50),
        bio: bio.trim().slice(0, 160),
        avatar_url: user.photoURL,
      });
      toast.success("مرحباً بك في المجتمع!");
      onComplete();
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-right">إعداد ملفك في المجتمع</DialogTitle>
          <DialogDescription className="text-right">
            اختر اسم مستخدم فريد للانضمام إلى مجتمع نور الفرقان
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-right block mb-1">اسم المستخدم</Label>
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="example_user"
                dir="ltr"
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                @
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {!checking && available === true && (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                )}
                {!checking && available === false && (
                  <XCircle className="w-4 h-4 text-destructive" />
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">
              3-20 حرفاً، أحرف إنجليزية وأرقام و _
            </p>
          </div>

          <div>
            <Label className="text-right block mb-1">الاسم المعروض</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="اسمك الكامل"
              maxLength={50}
            />
          </div>

          <div>
            <Label className="text-right block mb-1">نبذة (اختياري)</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              rows={3}
              placeholder="عرّف بنفسك..."
            />
            <p className="text-xs text-muted-foreground mt-1 text-left">{160 - bio.length}</p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !available || !displayName.trim()}
            className="w-full"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء الملف"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SetupSocialProfileDialog;
