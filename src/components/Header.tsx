import { Link, useLocation, useNavigate } from "react-router-dom";
import { Book, Heart, Settings, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import HeaderLocationButton from "./HeaderLocationButton";
import MobileMenu from "./MobileMenu";
import { greetingForTime } from "@/lib/displayFormat";
import { firstName } from "@/lib/userName";

const GREETING_KEY = "noor:appStartTs";
const GREETING_DURATION_MS = 3 * 60 * 1000; // 3 minutes

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [showGreeting, setShowGreeting] = useState(true);

  // Track app-start time for the 3-minute greeting window
  useEffect(() => {
    let start = Number(sessionStorage.getItem(GREETING_KEY) || 0);
    if (!start) {
      start = Date.now();
      sessionStorage.setItem(GREETING_KEY, String(start));
    }
    const elapsed = Date.now() - start;
    if (elapsed >= GREETING_DURATION_MS) {
      setShowGreeting(false);
      return;
    }
    const t = setTimeout(() => setShowGreeting(false), GREETING_DURATION_MS - elapsed);
    return () => clearTimeout(t);
  }, []);

  const isHome = location.pathname === "/" || location.pathname === "/index";
  const greeting = greetingForTime();
  const displayName = firstName(userProfile?.displayName || user?.displayName);

  const navLinks = [
    { path: "/", label: "الرئيسية", icon: Book },
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
                className="w-11 h-11 rounded-full bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors relative"
                aria-label="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary" />
              </button>

              {/* Center: greeting (first 3 min for registered users) OR app name */}
              <div className="text-center flex-1 px-2">
                {showGreeting && user && displayName ? (
                  <>
                    <p className="text-sm font-bold text-foreground arabic-ui truncate">
                      السلام عليكم، {displayName}
                    </p>
                    <p className="text-[11px] text-muted-foreground arabic-ui">{greeting}</p>
                  </>
                ) : (
                  <h1 className="font-arabic font-bold text-lg text-foreground truncate">
                    نور الفرقان
                  </h1>
                )}
              </div>

              <MobileMenu className="bg-muted/50" />
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
                <MobileMenu />
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

    </header>
  );
};

export default Header;
