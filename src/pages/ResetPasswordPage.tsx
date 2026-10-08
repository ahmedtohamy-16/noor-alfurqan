import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { authErrorMessage } from "@/hooks/useAuth";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session && isRecovery) setReady(true);
      else if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    if (password !== confirm) return toast.error("كلمتا المرور غير متطابقتين");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(authErrorMessage(error));
    toast.success("تم تحديث كلمة المرور بنجاح");
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background font-arabic flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg">
        <h1 className="text-xl font-bold text-center mb-4">تعيين كلمة مرور جديدة</h1>
        {!ready ? (
          <p className="text-sm text-muted-foreground text-center">
            الرابط غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً من صفحة "نسيت كلمة المرور".
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            {[{ v: password, s: setPassword, p: "كلمة المرور الجديدة" }, { v: confirm, s: setConfirm, p: "تأكيد كلمة المرور" }].map((f) => (
              <div key={f.p} className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" value={f.v} onChange={(e) => f.s(e.target.value)} placeholder={f.p} className="pr-10 h-12 text-right" required />
              </div>
            ))}
            <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
              {loading ? "جاري الحفظ..." : "حفظ كلمة المرور"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
