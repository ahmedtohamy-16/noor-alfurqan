import { useNavigate } from "react-router-dom";
import { BookOpen, ArrowLeft, UserPlus, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden font-arabic">
      {/* Decorative gradient blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        {/* Logo */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 rounded-3xl bg-primary/30 blur-2xl" />
          <div className="relative w-24 h-24 rounded-3xl bg-primary shadow-xl flex items-center justify-center animate-[scale-in_0.6s_ease-out]">
            <BookOpen className="w-12 h-12 text-primary-foreground" strokeWidth={2.2} />
          </div>
        </div>

        {/* Greetings */}
        <div className="text-center max-w-md mb-12 animate-[slide-up_0.7s_ease-out]">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3">
            مرحبًا بك في{" "}
            <span className="text-primary">نور الفرقان</span>
          </h1>
          <p className="text-base text-muted-foreground mb-2">
            رفيقك اليومي للقرآن، الأذكار، والمجتمع المسلم
          </p>
          <p className="text-xs text-muted-foreground/70 tracking-wide">
            Welcome to Noor Alfurqan
          </p>
        </div>

        {/* CTA buttons */}
        <div className="w-full max-w-sm space-y-3 animate-[slide-up_0.8s_ease-out_0.1s_both]">
          <Button
            size="lg"
            className="w-full h-14 text-base font-bold shadow-lg shadow-primary/20"
            onClick={() => navigate("/auth?mode=signup")}
          >
            <UserPlus className="w-5 h-5" />
            إنشاء حساب جديد
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-base font-bold"
            onClick={() => navigate("/auth?mode=login")}
          >
            <LogIn className="w-5 h-5" />
            تسجيل الدخول
          </Button>

          <Button
            size="lg"
            variant="ghost"
            className="w-full h-12 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/")}
          >
            <User className="w-4 h-4" />
            الدخول كضيف
            <ArrowLeft className="w-4 h-4 mr-auto" />
          </Button>
        </div>

        {/* Footer */}
        <p className="absolute bottom-6 text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} نور الفرقان
        </p>
      </main>
    </div>
  );
};

export default WelcomePage;
