import { useState } from "react";
import { Bookmark, BookmarkCheck, Copy, Share2, BookOpenText, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Hadith } from "@/data/hadithBooks";
import { getBookById } from "@/data/hadithBooks";
import HadithHighlightedText from "./HadithHighlightedText";

interface Props {
  hadith: Hadith;
  index: number;
  searchQuery?: string;
  isBookmarked: boolean;
  isCopied: boolean;
  onToggleBookmark: () => void;
  onCopy: () => void;
  onShare: () => void;
  onOpenDetails: () => void;
}

const gradeBadge = (grade?: string) => {
  if (!grade) return null;
  const g = grade.toLowerCase();
  if (g.includes("صحيح") || g.includes("sahih")) {
    return { label: "صحيح", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" };
  }
  if (g.includes("حسن") || g.includes("hasan")) {
    return { label: "حسن", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" };
  }
  if (g.includes("ضعيف") || g.includes("daif") || g.includes("weak")) {
    return { label: "ضعيف", cls: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30" };
  }
  return { label: grade, cls: "bg-muted text-muted-foreground border-border" };
};

// Split chain-of-narrators (سند) from matn when the text starts with "حدثنا/أخبرنا/سمعت"
const splitSanad = (text: string): { sanad?: string; matn: string } => {
  const m = text.match(/^((?:حدثنا|حدّثنا|أخبرنا|سمعت)[^:،.]*[:،.\-])\s*([\s\S]+)$/);
  if (m) return { sanad: m[1], matn: m[2] };
  return { matn: text };
};

const HadithCardV2 = ({
  hadith, index, searchQuery, isBookmarked, isCopied,
  onToggleBookmark, onCopy, onShare, onOpenDetails,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const book = getBookById(hadith.bookId);
  const badge = gradeBadge(hadith.grade);
  const { sanad, matn } = splitSanad(hadith.text);

  return (
    <article
      className="group relative rounded-2xl border border-border/50 bg-card/70 backdrop-blur p-5 shadow-sm hover:shadow-md transition-all animate-fade-in"
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      dir="rtl"
    >
      {/* gold corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl pointer-events-none">
        <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-[hsl(var(--gold-gradient-start)/0.25)] to-transparent rounded-full" />
      </div>

      {/* header: book/chapter/number + grade + bookmark */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground/80">{book?.nameAr}</span>
            <span className="opacity-50">·</span>
            <span>#{hadith.hadithNumber}</span>
          </div>
          {badge && (
            <Badge variant="outline" className={cn("mt-2 text-[10px] font-bold border", badge.cls)}>
              {badge.label}
            </Badge>
          )}
        </div>
        <button
          onClick={onToggleBookmark}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          aria-label={isBookmarked ? "إزالة من المحفوظات" : "حفظ"}
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-5 h-5 text-[hsl(var(--gold-gradient-end))]" />
          ) : (
            <Bookmark className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* sanad (if detected) */}
      {sanad && (
        <p className="text-[12px] text-muted-foreground mb-2 leading-relaxed opacity-80">
          {sanad}
        </p>
      )}

      {/* narrator */}
      {hadith.narrator && (
        <p className="text-sm font-bold mb-3 text-[hsl(var(--gold-gradient-end))]">
          عن {hadith.narrator}
        </p>
      )}

      {/* matn */}
      <div
        className={cn(
          "text-foreground/95 leading-[2.1] text-[19px]",
          !expanded && "line-clamp-4"
        )}
        style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
      >
        <HadithHighlightedText text={matn} query={searchQuery} />
      </div>

      {matn.length > 220 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 text-xs font-bold text-[hsl(var(--gold-gradient-end))] hover:underline"
        >
          اقرأ المزيد
        </button>
      )}

      {/* actions */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-1">
        <Button variant="ghost" size="sm" onClick={onShare} className="gap-1.5 text-xs h-9 rounded-full flex-1">
          <Share2 className="w-3.5 h-3.5" />
          مشاركة
        </Button>
        <Button variant="ghost" size="sm" onClick={onCopy} className="gap-1.5 text-xs h-9 rounded-full flex-1">
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          {isCopied ? "تم النسخ" : "نسخ"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenDetails} className="gap-1.5 text-xs h-9 rounded-full flex-1">
          <BookOpenText className="w-3.5 h-3.5" />
          شرح
        </Button>
      </div>
    </article>
  );
};

export default HadithCardV2;
