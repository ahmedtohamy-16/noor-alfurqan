import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Shield,
  Ban,
  CloudUpload,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth, authErrorMessage } from "@/hooks/useAuth";
import { UserRole } from "@/lib/firebase";
import { getGuestDataSummary } from "@/services/guestDataService";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? false : true;

  const [isLogin, setIsLogin] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [guestDataInfo, setGuestDataInfo] = useState<{ hasData: boolean; summary: string }>({
    hasData: false,
    summary: "",
  });
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, resendConfirmation } = useAuth();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    setGuestDataInfo(getGuestDataSummary());
  }, []);

  useEffect(() => {
    setIsLogin(searchParams.get("mode") === "signup" ? false : true);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsBanned(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("البريد الإلكتروني غير صالح");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      setIsLoading(false);
      return;
    }
    if (!isLogin && username) {
      const usernameRegex = /^[\u0600-\u06FFa-zA-Z0-9_\s]{3,50}$/;
      if (!usernameRegex.test(username)) {
        toast.error("اسم المستخدم يجب أن يكون 3-50 حرف");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("تم تسجيل الدخول بنجاح");
        navigate(searchParams.get("next") || "/");
      } else {
        const { needsConfirmation } = await signUp(email, password, username || email.split("@")[0], selectedRole);
        if (needsConfirmation) {
          setPendingEmail(email);
        } else {
          toast.success("تم إنشاء حسابك! مرحباً بك في نور الفرقان");
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error?.code === "email_not_confirmed") setPendingEmail(email);
      toast.error(authErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    try {
      await resendConfirmation(pendingEmail);
      toast.success("تم إرسال رسالة التأكيد مرة أخرى");
    } catch (e) {
      toast.error(authErrorMessage(e));
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle(selectedRole);
      toast.success("تم تسجيل الدخول عبر Google");
      navigate("/");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        if (error.code === "auth/popup-blocked") {
          toast.error("تم حظر النافذة المنبثقة");
        } else {
          toast.error("حدث خطأ في تسجيل الدخول عبر Google");
        }
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
    { value: "student", label: "طالب", icon: <GraduationCap className="w-4 h-4" /> },
    { value: "teacher", label: "معلم", icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-arabic relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/welcome")}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          تخطي
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          {/* Logo + title */}
          <div className="text-center mb-6">
            <div className="inline-flex relative">
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-xl" />
              <div className="relative w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg mb-4">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">
              {isLogin ? "أهلاً بعودتك" : "أنشئ حسابك"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "سجّل الدخول للمتابعة" : "ابدأ رحلتك مع نور الفرقان"}
            </p>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 bg-muted/50 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                isLogin ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
                !isLogin ? "bg-background text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              حساب جديد
            </button>
          </div>

          {/* Guest data alert */}
          {guestDataInfo.hasData && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
              <CloudUpload className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="text-right text-xs">
                <p className="font-bold text-primary">لديك بيانات محفوظة</p>
                <p className="text-muted-foreground">{guestDataInfo.summary}</p>
              </div>
            </div>
          )}

          {pendingEmail && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-xl text-right text-sm space-y-2">
              <p className="font-bold text-primary">أكّد بريدك الإلكتروني</p>
              <p className="text-muted-foreground text-xs">أرسلنا رابط تأكيد إلى {pendingEmail}. لن يُفعَّل الحساب قبل الضغط عليه.</p>
              <Button type="button" size="sm" variant="outline" onClick={handleResend}>إعادة إرسال رسالة التأكيد</Button>
            </div>
          )}

          {isBanned && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
              <Ban className="w-6 h-6 text-destructive" />
              <div className="text-right text-sm">
                <p className="font-bold text-destructive">حسابك محظور</p>
                <p className="text-muted-foreground text-xs">تواصل مع الإدارة</p>
              </div>
            </div>
          )}

          {/* Form card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-lg shadow-primary/5">
            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pr-10 text-right h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((role) => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`py-3 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                          selectedRole === role.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {role.icon}
                        {role.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 text-right h-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 text-right h-12"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {isLogin && (
                <div className="text-left">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-primary hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 font-bold shadow-md shadow-primary/20"
                size="lg"
                disabled={isLoading || isBanned || isGoogleLoading}
              >
                {isLoading ? "جاري التحميل..." : isLogin ? "تسجيل الدخول" : "إنشاء الحساب"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">أو</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 gap-3 font-bold"
              disabled={isLoading || isBanned || isGoogleLoading}
              onClick={handleGoogle}
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>المتابعة عبر Google</span>
            </Button>
          </div>

          {!isLogin && (
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>بإنشاء حساب، أنت توافق على شروط الاستخدام</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
