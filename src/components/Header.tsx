import { Link, useLocation, useNavigate } from "react-router-dom";
import { Book, Search, Heart, Settings, Menu, Users, MessageSquare, UserCircle2, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import HeaderLocationButton from "./HeaderLocationButton";
import { getGuestDisplayName, getOrCreateGuestId } from "@/services/guestIdentityService";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 4 && h < 12) return { en: "Good Morning!", ar: "صباح الخير" };
  if (h >= 12 && h < 17) return { en: "Good Afternoon!", ar: "نهارك سعيد" };
  if (h >= 17 && h < 21) return { en: "Good Evening!", ar: "مساء الخير" };
  return { en: "Peaceful Night", ar: "ليلة هانئة" };
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const [guestName, setGuestName] = useState<string>("");

  useEffect(() => {
    if (!user) {
      getOrCreateGuestId();
      setGuestName(getGuestDisplayName());
    }
  }, [user]);

  const isHome = location.pathname === "/";
  const greeting = getGreeting();
  const displayName = user?.displayName?.split(" ")[0] || guestName || "ضيف";

  const navLinks = [
    { path: "/", label: "الرئيسية", icon: Book },
    { path: "/feed", label: "المجتمع", icon: MessageSquare },
    { path: "/explore", label: "استكشاف", icon: Search },
    { path: "/notifications", label: "الإشعارات", icon: Bell },
    { path: "/khatmah", label: "الختمة", icon: Users },
    { path: "/favorites", label: "المفضلة", icon: Heart },
    { path: "/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* MOBILE: Greeting style header on home page */}
        <div className="md:hidden">
          {isHome ? (
            <div className="flex items-center justify-between h-16">
              {/* Bell */}
              <button
                onClick={() => navigate("/notifications")}
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors relative"
                aria-label="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary" />
              </button>

              {/* Greeting (center) */}
              <div className="text-center flex-1 px-2">
                <p className="text-sm font-bold text-foreground arabic-ui truncate">
                  السلام عليكم، {displayName}
                </p>
                <p className="text-[11px] text-muted-foreground">{greeting.en}</p>
              </div>

              {/* Menu */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                aria-label="القائمة"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between h-14">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-quran text-base">ن</span>
                </div>
                <span className="font-arabic font-bold text-base text-foreground">نور الفرقان</span>
              </Link>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
                  aria-label="القائمة"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-quran text-lg">ن</span>
              </div>
              <span className="font-arabic font-bold text-xl text-foreground">نور الفرقان</span>
            </Link>
            <HeaderLocationButton />
          </div>
          <nav className="flex items-center gap-1 arabic-ui">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path}>
                  <Button variant={isActive ? "default" : "ghost"} size="sm" className="gap-2">
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            <ThemeToggle />
            {!user && (
              <Link to="/auth">
                <Button size="sm" variant="outline">دخول</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* Slide-down mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-md animate-[fade-in_0.2s_ease-out]">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg arabic-ui">القائمة</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 arabic-ui">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted active:scale-[0.97] transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{link.label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="mt-6 flex items-center justify-between">
              <ThemeToggle />
              {!user ? (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button>تسجيل الدخول</Button>
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground arabic-ui">
                  <UserCircle2 className="w-4 h-4" />
                  {user.displayName || user.email}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
