import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useSocialProfile } from "@/hooks/useSocialProfile";
import { requestVerification } from "@/services/socialService";
import { toast } from "sonner";

const VerificationPage = () => {
  const { user } = useAuth();
  const { profile } = useSocialProfile();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await requestVerification(user.uid, reason);
      toast.success("تم إرسال طلبك، سنراجعه قريباً");
      setReason("");
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <Button onClick={() => navigate("/auth")}>سجّل الدخول</Button>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Helmet>
        <title>توثيق الحساب - نور الفرقان</title>
      </Helmet>
      <Header />

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        <div className="text-center">
          <BadgeCheck className="w-16 h-16 mx-auto text-primary mb-3" />
          <h1 className="text-2xl font-bold arabic-ui">توثيق الحساب</h1>
          <p className="text-muted-foreground mt-2 arabic-ui">
            احصل على شارة التوثيق إذا كنت شخصية عامة، عالماً، أو داعية
          </p>
        </div>

        {profile?.is_verified ? (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center">
            <BadgeCheck className="w-10 h-10 mx-auto text-primary mb-2" />
            <p className="font-semibold arabic-ui">حسابك موثّق</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div>
              <Label className="block mb-2 text-right">سبب طلب التوثيق</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 1000))}
                rows={6}
                placeholder="اشرح لماذا تستحق التوثيق (روابط، إنجازات، شهرة...)"
                className="arabic-ui"
              />
              <p className="text-xs text-muted-foreground text-left mt-1">
                {1000 - reason.length}
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || reason.trim().length < 20}
              className="w-full"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "إرسال الطلب"}
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};

export default VerificationPage;
