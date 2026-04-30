import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowName(true), 700);
    const t2 = setTimeout(() => {
      if (isLoading) return;
      navigate(user ? "/" : "/welcome", { replace: true });
    }, 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navigate, user, isLoading]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08),transparent_60%)]" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Animated book */}
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-primary shadow-2xl flex items-center justify-center animate-[scale-in_0.8s_ease-out]">
            <BookOpen
              className="w-14 h-14 text-primary-foreground animate-[fade-in_1s_ease-out_0.3s_both]"
              strokeWidth={2.2}
            />
          </div>
        </div>

        {/* Name reveal */}
        <div
          className={`transition-all duration-700 ease-out ${
            showName ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <h1 className="text-4xl font-extrabold text-primary tracking-tight font-arabic">
            نور الفرقان
          </h1>
          <p className="text-center text-sm text-muted-foreground mt-2 font-arabic">
            Noor Alfurqan
          </p>
        </div>
      </div>

      {/* Bottom loader */}
      <div className="absolute bottom-16 flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  );
};

export default SplashScreen;
