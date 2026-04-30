import { Link, useLocation } from "react-router-dom";
import { Book, Search, Heart, Settings, Menu, Users, MessageSquare, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import HeaderLocationButton from "./HeaderLocationButton";
import { getGuestDisplayName, getOrCreateGuestId } from "@/services/guestIdentityService";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const [guestName, setGuestName] = useState<string>("");

  useEffect(() => {
    if (!user) {
      getOrCreateGuestId();
      setGuestName(getGuestDisplayName());
    }
  }, [user]);

  const navLinks = [
    { path: "/", label: "الرئيسية", icon: Book },
    { path: "/feed", label: "المجتمع", icon: MessageSquare },
    { path: "/search", label: "البحث", icon: Search },
    { path: "/khatmah", label: "الختمة", icon: Users },
    { path: "/favorites", label: "المفضلة", icon: Heart },
    { path: "/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-primary-foreground font-quran text-lg">ن</span>
              </div>
              <span className="font-arabic font-bold text-xl text-foreground hidden sm:block">
                نور الفرقان
              </span>
            </Link>
            <HeaderLocationButton />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 arabic-ui">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.path} to={link.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            <ThemeToggle />
            {!user && (
              <Link to="/auth">
                <Button size="sm" variant="outline">
                  دخول
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            {!user && guestName && (
              <Link
                to="/welcome"
                className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-full hover:bg-muted transition-colors"
                title="تسجيل الدخول"
              >
                <UserCircle2 className="w-3.5 h-3.5" />
                <span className="font-medium">{guestName}</span>
              </Link>
            )}
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-slide-up arabic-ui">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className="w-full justify-start gap-3"
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              {!user && (
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
