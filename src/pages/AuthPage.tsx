import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("تم تسجيل الدخول بنجاح");
        navigate("/");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              username: username || email.split("@")[0],
            },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب بنجاح");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message === "Invalid login credentials") {
        toast.error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (error.message.includes("already registered")) {
        toast.error("هذا البريد الإلكتروني مسجل مسبقاً");
      } else {
        toast.error(error.message || "حدث خطأ، حاول مرة أخرى");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <main className="flex-1 flex items-center justify-center px-4 arabic-ui">
        <div className="w-full max-w-md">
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
                disabled={isLoading}
              >
                {isLoading
                  ? "جاري التحميل..."
                  : isLogin
                  ? "تسجيل الدخول"
                  : "إنشاء الحساب"}
              </Button>
            </form>

            {/* Toggle */}
            <div className="text-center mt-6 pt-6 border-t border-border">
              <p className="text-muted-foreground">
                {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium mr-2 hover:underline"
                >
                  {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
