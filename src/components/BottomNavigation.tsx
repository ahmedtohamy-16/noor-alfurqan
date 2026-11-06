import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Book,
  CircleDot,
  Clock,
  Sunrise,
} from "lucide-react";
import { cn } from "@/lib/utils";

const HIDDEN_ROUTES = [
  "/auth",
  "/welcome",
  "/splash",
  "/forgot-password",
];

type Tab = {
  icon: any;
  label: string;
  path: string;
};

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  if (HIDDEN_ROUTES.includes(location.pathname)) return null;

  // Tabs differ per mode (RTL — visually right-to-left)
  const islamicTabs: Tab[] = [
    { icon: Sunrise, label: "الأذكار", path: "/azkar" },
    { icon: Clock, label: "الصلاة", path: "/prayer-times" },
    { icon: CircleDot, label: "السبحة", path: "/tasbih" },
    { icon: Book, label: "القرآن", path: "/quran" },
    { icon: Home, label: "الرئيسية", path: "/" },
  ];

  const tabs = islamicTabs;

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
