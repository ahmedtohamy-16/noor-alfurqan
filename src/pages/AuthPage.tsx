import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  AtSign,
  ArrowRight,
  BookOpen,
  Shield,
  Ban,
  CloudUpload,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  XCircle,
  Circle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth, authErrorMessage } from "@/hooks/useAuth";
import { getGuestDataSummary } from "@/services/guestDataService";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { passwordRules, isPasswordValid } from "@/lib/passwordRules";
import { validateUsername } from "@/lib/usernameRules";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid" | "error";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? false : true;

  const [isLogin, setIsLogin] = useState(initialMode);
  const [identifier, setIdentifier] = useState(""); // login: email or username
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [usernameMessage, setUsernameMessage] = useState("");

  // Live availability check (debounced). The name is only ever shown as
  // available after a successful server check that returned "not taken" —
  // validation failures, network errors and empty results never count.
  useEffect(() => {
    const name = username.trim();
    if (!name) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }
    const validation = validateUsername(name);
    if (!validation.valid) {
      setUsernameStatus("invalid");
      setUsernameMessage(validation.reason || "اسم المستخدم غير صالح");
      return;
    }
    setUsernameStatus("checking");
    setUsernameMessage("");
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data, error } = await supabase.rpc("is_username_taken", { p_username: name });
      if (cancelled) return;
      if (error) {
        setUsernameStatus("error");
        setUsernameMessage("تعذر التحقق من الاسم، تحقق من اتصالك وحاول مرة أخرى");
      } else if (data) {
        setUsernameStatus("taken");
        setUsernameMessage("اسم المستخدم مستخدم بالفعل، اختر اسمًا آخر");
      } else {
        setUsernameStatus("available");
        setUsernameMessage("اسم المستخدم متاح");
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [username]);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [guestDataInfo, setGuestDataInfo] = useState<{ hasData: boolean; summary: string }>({
    hasData: false,
    summary: "",
  });
  const navigate = useNavigate();
  const { user, signInWithIdentifier, signUp, signInWithGoogle, resendConfirmation } = useAuth();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    setGuestDataInfo(getGuestDataSummary());
  }, []);

  useEffect(() => {
    setIsLogin(searchParams.get("mode") === "signup" ? false : true);
  }, [searchParams]);

  // Confirm-password state: empty stays neutral, match is success, mismatch is an error.
  const confirmState: "idle" | "match" | "mismatch" =
    confirmPassword.length === 0 ? "idle" : confirmPassword === password ? "match" : "mismatch";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsBanned(false);

    if (isLogin) {
      if (!identifier.trim()) {
        toast.error("أدخل بريدك الإلكتروني أو اسم المستخدم");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        toast.error("بيانات الدخول غير صحيحة");
        setIsLoading(false);
        return;
      }
    } else {
      if (!displayName.trim()) {
        toast.error("أدخل اسمك الكامل");
        setIsLoading(false);
        return;
      }
      const validation = validateUsername(username);
      if (!validation.valid) {
        toast.error(validation.reason || "اسم المستخدم غير صالح");
        setIsLoading(false);
        return;
      }
      if (!EMAIL_REGEX.test(email)) {
        toast.error("البريد الإلكتروني غير صالح");
        setIsLoading(false);
        return;
      }
      if (!isPasswordValid(password)) {
        toast.error("كلمة المرور لا تستوفي الشروط المطلوبة");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("كلمتا المرور غير متطابقتين");
        setIsLoading(false);
        return;
      }
      // Re-check availability at submit time: another user may have claimed
      // the name since the live check ran.
      const { data: taken, error: checkError } = await supabase.rpc("is_username_taken", {
        p_username: username.trim(),
      });
      if (checkError) {
        toast.error("تعذر التحقق من اسم المستخدم، حاول مرة أخرى");
        setIsLoading(false);
        return;
      }
      if (taken) {
        setUsernameStatus("taken");
        setUsernameMessage("اسم المستخدم مستخدم بالفعل، اختر اسمًا آخر");
        toast.error("اسم المستخدم مستخدم بالفعل، اختر اسمًا آخر");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        await signInWithIdentifier(identifier, password);
        toast.success("تم تسجيل الدخول بنجاح");
        navigate(searchParams.get("next") || "/");
      } else {
        const { needsConfirmation } = await signUp(email, password, username.trim(), displayName.trim());
        if (needsConfirmation) {
          setPendingEmail(email);
        } else {
          toast.success("تم إنشاء حسابك! مرحباً بك في نور الفرقان");
          navigate("/");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error?.code === "email_not_confirmed") setPendingEmail(identifier);
      toast.error(authErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!pendingEmail || otp.length < 6) return;
    setIsVerifying(true);
    const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token: otp, type: "signup" });
    setIsVerifying(false);
    if (error) {
      toast.error("الرمز غير صحيح أو انتهت صلاحيته");
      return;
    }
    toast.success("تم تأكيد بريدك! مرحباً بك في نور الفرقان");
    setPendingEmail(null);
    navigate(searchParams.get("next") || "/");
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
      await signInWithGoogle();
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

  const usernameBorder =
    usernameStatus === "available"
      ? "border-success focus-visible:ring-success"
      : usernameStatus === "taken" || usernameStatus === "invalid"
        ? "border-destructive focus-visible:ring-destructive"
        : "";

  return (
    <div className="min-h-screen bg-background flex flex-col font-arabic relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate("/welcome")} aria-label="رجوع">
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
            <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-xl text-right text-sm space-y-3">
              <p className="font-bold text-primary">أكّد بريدك الإلكتروني</p>
              <p className="text-muted-foreground text-xs">أرسلنا رمز تأكيد إلى {pendingEmail}. أدخله هنا لتفعيل حسابك.</p>
              <div className="flex justify-center" dir="ltr">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button type="button" className="w-full" disabled={otp.length < 6 || isVerifying} onClick={handleVerifyOtp}>
                {isVerifying ? "جارٍ التحقق..." : "تأكيد الرمز"}
              </Button>
              <Button type="button" size="sm" variant="outline" className="w-full" onClick={handleResend}>إعادة إرسال الرمز</Button>
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
                  {/* Full name */}
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="الاسم الكامل"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pr-10 text-right h-12"
                      autoComplete="name"
                      required
                    />
                  </div>

                  {/* Username with live availability */}
                  <div className="relative">
                    <AtSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`pr-10 pl-10 text-right h-12 ${usernameBorder}`}
                      aria-invalid={usernameStatus === "taken" || usernameStatus === "invalid"}
                      autoComplete="username"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === "checking" && <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />}
                      {usernameStatus === "available" && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {(usernameStatus === "taken" || usernameStatus === "invalid") && <XCircle className="w-4 h-4 text-destructive" />}
                    </span>
                  </div>
                  {usernameStatus !== "idle" && usernameStatus !== "checking" && (
                    <p
                      className={`text-[11px] px-1 text-right flex items-center gap-1 ${
                        usernameStatus === "available"
                          ? "text-success"
                          : usernameStatus === "error"
                            ? "text-muted-foreground"
                            : "text-destructive"
                      }`}
                    >
                      {usernameStatus === "available" && <Check className="w-3 h-3" strokeWidth={3} />}
                      {usernameMessage}
                    </p>
                  )}

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="البريد الإلكتروني"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pr-10 text-right h-12 ${
                        email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      autoComplete="email"
                      required
                    />
                  </div>
                  {email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) && (
                    <p className="text-[11px] px-1 text-right text-destructive">أدخل بريدًا إلكترونيًا صحيحًا مثل name@example.com</p>
                  )}
                </>
              )}

              {isLogin && (
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pr-10 text-right h-12"
                    autoComplete="username"
                    required
                  />
                </div>
              )}

              {/* Password */}
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 pl-10 text-right h-12"
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {!isLogin && (
                <>
                  {/* Password rules checklist */}
                  <ul
                    className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 flex flex-col gap-1.5"
                    aria-label="شروط كلمة المرور"
                  >
                    {passwordRules.map((r) => {
                      const ok = r.test(password);
                      return (
                        <li key={r.id} className="flex items-center gap-2 text-xs">
                          {ok ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                          )}
                          <span className={ok ? "text-success font-medium" : "text-muted-foreground"}>
                            {r.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Confirm password */}
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="تأكيد كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pr-10 pl-10 text-right h-12 ${
                        confirmState === "match"
                          ? "border-success focus-visible:ring-success"
                          : confirmState === "mismatch"
                            ? "border-destructive focus-visible:ring-destructive"
                            : ""
                      }`}
                      aria-invalid={confirmState === "mismatch"}
                      autoComplete="new-password"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {confirmState === "match" && <CheckCircle2 className="w-4 h-4 text-success" />}
                      {confirmState === "mismatch" && <XCircle className="w-4 h-4 text-destructive" />}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? "إخفاء تأكيد كلمة المرور" : "إظهار تأكيد كلمة المرور"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </span>
                  </div>
                  {confirmState === "mismatch" && (
                    <p className="text-[11px] px-1 text-right text-destructive">كلمتا المرور غير متطابقتين</p>
                  )}
                  {confirmState === "match" && (
                    <p className="text-[11px] px-1 text-right text-success flex items-center gap-1">
                      <Check className="w-3 h-3" strokeWidth={3} />
                      كلمتا المرور متطابقتان
                    </p>
                  )}
                </>
              )}

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
                disabled={
                  isLoading ||
                  isBanned ||
                  isGoogleLoading ||
                  (!isLogin &&
                    (usernameStatus !== "available" ||
                      !isPasswordValid(password) ||
                      confirmState !== "match"))
                }
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
