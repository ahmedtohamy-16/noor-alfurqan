import { Link } from "react-router-dom";
import { Book, Bell, Users, Heart, Settings, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links = [
  { path: "/", label: "الرئيسية", icon: Book },
  { path: "/notifications", label: "الإشعارات", icon: Bell },
  { path: "/khatmah", label: "الختمة", icon: Users },
  { path: "/favorites", label: "المفضلة", icon: Heart },
  { path: "/settings", label: "الإعدادات", icon: Settings },
];

export default function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="القائمة" className={cn("h-11 w-11 shrink-0 rounded-full", className)}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" aria-describedby={undefined} className="z-[100] w-[min(88vw,360px)] overflow-y-auto bg-background text-foreground arabic-ui" dir="rtl">
        <SheetTitle className="mb-8 pt-2 pr-10 text-right">القائمة</SheetTitle>
        <nav className="space-y-2" aria-label="القائمة الرئيسية">
          {links.map(({ path, label, icon: Icon }) => (
            <Button key={path} asChild variant="ghost" className="h-14 w-full justify-start gap-3 bg-muted/50">
              <Link to={path} onClick={() => setOpen(false)}><Icon className="h-5 w-5 text-primary" />{label}</Link>
            </Button>
          ))}
        </nav>
        <div className="mt-8 flex items-center justify-between gap-3">
          <ThemeToggle />
          {!user && <Button asChild><Link to="/auth" onClick={() => setOpen(false)}>تسجيل الدخول</Link></Button>}
        </div>
      </SheetContent>
    </Sheet>
  );
}