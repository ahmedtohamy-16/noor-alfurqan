import { Link, useLocation } from "react-router-dom";
import { Book, Search, Heart, Clock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Book, label: "القرآن", path: "/quran" },
    { icon: Search, label: "بحث", path: "/search" },
    { icon: RotateCcw, label: "التسبيح", path: "/tasbih" },
    { icon: Heart, label: "المفضلة", path: "/favorites" },
    { icon: Clock, label: "الصلاة", path: "/prayer-times" },
  ];

  const isActive = (path: string) => {
    if (path === "/quran") {
      return location.pathname === "/quran" || location.pathname.startsWith("/surah");
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-40 safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5", isActive(item.path) && "scale-110")} />
            <span className="text-xs font-medium arabic-ui">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
