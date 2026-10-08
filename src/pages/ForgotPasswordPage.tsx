import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth, authErrorMessage } from "@/hooks/useAuth";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("البريد الإلكتروني غير صالح");
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-arabic flex flex-col" dir="rtl">
      <header className="p-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/auth?mode=login")} aria-label="رجوع">
          <ArrowRight className="w-5 h-5" />
        </Button>
      </header>
      <main className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-lg">
          {sent ? (
            <div className="text-center space-y-3">
              <MailCheck className="w-12 h-12 text-primary mx-auto" />
              <h1 className="text-xl font-bold">تحقق من بريدك</h1>
              <p className="text-sm text-muted-foreground">
                إذا كان البريد <b>{email}</b> مسجلاً لدينا فستصلك رسالة تحتوي على رابط لتعيين كلمة مرور جديدة.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/auth?mode=login")}>العودة لتسجيل الدخول</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h1 className="text-xl font-bold text-center">نسيت كلمة المرور؟</h1>
              <p className="text-sm text-muted-foreground text-center">أدخل بريدك وسنرسل لك رابط إعادة التعيين</p>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="pr-10 h-12 text-right" required />
              </div>
              <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
                {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
              </Button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
