import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, BookOpen, GraduationCap, Users, Shield, Ban, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/lib/firebase";
import { hasGuestData, getGuestDataSummary } from "@/services/guestDataService";

// Google icon component
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [guestDataInfo, setGuestDataInfo] = useState<{ hasData: boolean; summary: string }>({ hasData: false, summary: "" });
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, checkUserBanned } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Check for guest data on mount
  useEffect(() => {
    const summary = getGuestDataSummary();
    setGuestDataInfo(summary);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsBanned(false);

    // Client-side validation
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
      // Validate username: 3-50 characters, alphanumeric/Arabic only
      const usernameRegex = /^[\u0600-\u06FFa-zA-Z0-9_\s]{3,50}$/;
      if (!usernameRegex.test(username)) {
        toast.error("اسم المستخدم يجب أن يكون 3-50 حرف (حروف عربية أو إنجليزية أو أرقام)");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Check if user is banned before attempting login
        const banned = await checkUserBanned(email);
        if (banned) {
          setIsBanned(true);
          toast.error("حسابك محظور. تواصل مع الإدارة للمزيد من المعلومات");
          setIsLoading(false);
          return;
        }

        await signIn(email, password);
        toast.success("تم تسجيل الدخول بنجاح");
        // Guest data migration happens automatically via useGuestMigration hook
        navigate("/");
      } else {
        // Direct signup with Firebase Auth (no OTP needed)
        await signUp(email, password, username || email.split("@")[0], selectedRole);
        toast.success("تم إنشاء حسابك بنجاح! مرحباً بك في نور الفرقان");
        // Guest data migration happens automatically via useGuestMigration hook
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Check for banned user error
      if (error.code === "auth/user-disabled") {
        setIsBanned(true);
        toast.error("حسابك محظور. تواصل مع الإدارة للمزيد من المعلومات");
        return;
      }
      
      if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found") {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (error.code === "auth/email-already-in-use") {
        toast.error("هذا البريد الإلكتروني مسجل مسبقاً");
      } else if (error.code === "auth/weak-password") {
        toast.error("كلمة المرور ضعيفة جداً - يجب أن تكون 6 أحرف على الأقل");
      } else if (error.code === "auth/invalid-email") {
        toast.error("البريد الإلكتروني غير صالح");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("تم إجراء محاولات كثيرة. حاول لاحقاً");
      } else if (error.code === "auth/network-request-failed") {
        toast.error("تحقق من اتصالك بالإنترنت");
      } else {
        toast.error(error.message || "حدث خطأ، حاول مرة أخرى");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      value: "student", 
      label: "طالب", 
      icon: <GraduationCap className="w-5 h-5" />,
      description: "تعلم وتلاوة القرآن الكريم"
    },
    { 
      value: "teacher", 
      label: "معلم", 
      icon: <Users className="w-5 h-5" />,
      description: "تعليم وإدارة الدروس"
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24 md:pb-0">
      {/* Header */}
      <header className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
      </header>

      <main className="flex-1 flex items-start md:items-center justify-center px-4 py-6 arabic-ui">
        <div className="w-full max-w-md">
          {/* Guest Data Migration Info */}
          {guestDataInfo.hasData && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <div className="flex items-center justify-center gap-3 text-primary">
                <CloudUpload className="w-6 h-6 flex-shrink-0" />
                <div className="text-right">
                  <h3 className="font-bold text-sm">لديك بيانات محفوظة</h3>
                  <p className="text-xs opacity-80">{guestDataInfo.summary}</p>
                  <p className="text-xs opacity-60 mt-1">سيتم نقلها تلقائياً لحسابك بعد التسجيل</p>
                </div>
              </div>
            </div>
          )}

          {/* Banned Message */}
          {isBanned && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-xl">
              <div className="flex items-center justify-center gap-3 text-destructive">
                <Ban className="w-8 h-8" />
                <div className="text-center">
                  <h3 className="font-bold text-lg">حسابك محظور</h3>
                  <p className="text-sm opacity-80">تواصل مع الإدارة للمزيد من المعلومات</p>
                </div>
              </div>
            </div>
          )}

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              نور الفرقان
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "أهلاً بعودتك" : "أنشئ حسابك الآن"}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">
              {isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="اسم المستخدم"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pr-10 text-right"
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground block text-right">
                      نوع الحساب
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => setSelectedRole(role.value)}
                          className={`p-4 rounded-xl border-2 text-right transition-all ${
                            selectedRole === role.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="font-medium text-foreground">{role.label}</span>
                            <div className={`${
                              selectedRole === role.value ? "text-primary" : "text-muted-foreground"
                            }`}>
                              {role.icon}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{role.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 text-right"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 text-right"
                  minLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || isBanned || isGoogleLoading}
              >
                {isLoading
                  ? "جاري التحميل..."
                  : isLogin
                  ? "تسجيل الدخول"
                  : "إنشاء الحساب"}
              </Button>
            </form>

            {/* Google Sign In */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">أو</span>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4 gap-3"
                size="lg"
                disabled={isLoading || isBanned || isGoogleLoading}
                onClick={async () => {
                  setIsGoogleLoading(true);
                  try {
                    await signInWithGoogle(selectedRole);
                    toast.success("تم تسجيل الدخول بنجاح عبر Google");
                    navigate("/");
                  } catch (error: any) {
                    if (error.code !== "auth/popup-closed-by-user") {
                      console.error("Google sign-in error:", error);
                      if (error.code === "auth/account-exists-with-different-credential") {
                        toast.error("يوجد حساب بنفس البريد الإلكتروني بطريقة تسجيل مختلفة");
                      } else if (error.code === "auth/popup-blocked") {
                        toast.error("تم حظر النافذة المنبثقة - فعّل النوافذ المنبثقة وحاول مرة أخرى");
                      } else {
                        toast.error("حدث خطأ في تسجيل الدخول عبر Google");
                      }
                    }
                  } finally {
                    setIsGoogleLoading(false);
                  }
                }}
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                <span>{isLogin ? "الدخول عبر Google" : "التسجيل عبر Google"}</span>
              </Button>
            </div>

            {/* Forgot Password & Toggle */}
            <div className="text-center mt-6 pt-6 border-t border-border space-y-3">
              {isLogin && (
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-primary text-sm hover:underline"
                >
                  نسيت كلمة المرور؟
                </button>
              )}
              <p className="text-muted-foreground">
                {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setIsBanned(false);
                  }}
                  className="text-primary font-medium mr-2 hover:underline"
                >
                  {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
                </button>
              </p>
            </div>
          </div>

          {/* Role Info */}
          {!isLogin && (
            <div className="mt-4 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span>يمكن للمسؤول تغيير صلاحياتك لاحقاً</span>
                <Shield className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
