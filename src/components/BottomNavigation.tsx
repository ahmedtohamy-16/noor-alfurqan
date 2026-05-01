import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Book,
  CircleDot,
  Clock,
  Sunrise,
  Compass,
  Bell,
  User,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useHomeMode } from "@/hooks/useHomeMode";

const HIDDEN_ROUTES = [
  "/auth",
  "/welcome",
  "/splash",
  "/forgot-password",
  "/verification",
  "/create-post",
];

type Tab = {
  icon: any;
  label: string;
  path: string;
  isCenter?: boolean;
};

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useHomeMode();

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  // Tabs differ per mode (RTL — visually right-to-left)
  const islamicTabs: Tab[] = [
    { icon: Sunrise, label: "الأذكار", path: "/azkar" },
    { icon: Clock, label: "الصلاة", path: "/prayer-times" },
    { icon: CircleDot, label: "السبحة", path: "/tasbih" },
    { icon: Book, label: "القرآن", path: "/quran" },
    { icon: Home, label: "الرئيسية", path: "/" },
  ];

  const socialTabs: Tab[] = [
    { icon: User, label: "حسابي", path: "/profile" },
    { icon: Bell, label: "الإشعارات", path: "/notifications" },
    { icon: Plus, label: "نشر", path: "/create-post", isCenter: true },
    { icon: Compass, label: "اكتشف", path: "/explore" },
    { icon: Home, label: "الرئيسية", path: "/" },
  ];

  const tabs = mode === "social" ? socialTabs : islamicTabs;

  const isActive = (path: string) => {
    if (path === "/quran") {
      return location.pathname === "/quran" || location.pathname.startsWith("/surah");
    }
    if (path === "/") return location.pathname === "/";
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40 safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((item) => {
          const active = isActive(item.path);

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center -mt-6 group"
                aria-label={item.label}
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/40 group-active:scale-95 transition-transform"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors border-none bg-transparent cursor-pointer",
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", active && "scale-110")} />
              <span className="text-[10px] font-medium arabic-ui">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
