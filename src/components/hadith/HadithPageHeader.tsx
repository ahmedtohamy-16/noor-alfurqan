import { BookMarked, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SOURCES = "البخاري · مسلم · الترمذي · أبو داود · النسائي · ابن ماجه · مالك · أحمد · الدارمي";

const HadithPageHeader = ({ bookmarkCount = 0 }: { bookmarkCount?: number }) => {
  const navigate = useNavigate();

  return (
    <header className="relative pt-6 pb-5 px-4">
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[hsl(var(--gold-gradient-end)/0.08)] to-transparent pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3 mb-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
          aria-label="رجوع"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/hadith/bookmarks")}
          className="rounded-full relative border-[hsl(var(--gold-gradient-end)/0.4)] bg-card/60 backdrop-blur"
          aria-label="المحفوظات"
        >
          <BookMarked className="w-5 h-5 text-[hsl(var(--gold-gradient-end))]" />
          {bookmarkCount > 0 && (
            <span className="absolute -top-1 -left-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[hsl(var(--gold-gradient-end))] text-[10px] font-bold text-white flex items-center justify-center">
              {bookmarkCount > 99 ? "99+" : bookmarkCount}
            </span>
          )}
        </Button>
      </div>

      <div className="relative text-center">
        <h1
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
        >
          الأحاديث النبوية الشريفة
        </h1>
        <p
          className="mt-2 text-[11px] sm:text-xs text-muted-foreground leading-relaxed"
          dir="rtl"
        >
          {SOURCES}
        </p>
        <div className="mx-auto mt-3 h-[2px] w-24 bg-gradient-to-r from-transparent via-[hsl(var(--gold-gradient-end))] to-transparent rounded-full" />
      </div>
    </header>
  );
};

export default HadithPageHeader;
