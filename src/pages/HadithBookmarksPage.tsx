import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { ChevronRight, BookMarked, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHadithBookmarks, type HadithBookmark } from "@/hooks/useHadithBookmarks";
import { hadithBooks, getBookById } from "@/data/hadithBooks";
import { cn } from "@/lib/utils";

const SwipeRow = ({
  b,
  onDelete,
}: {
  b: HadithBookmark;
  onDelete: () => void;
}) => {
  const [offset, setOffset] = useState(0);
  const startX = useRef<number | null>(null);
  const book = getBookById(b.bookId);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* delete affordance behind */}
      <div className="absolute inset-y-0 left-0 w-24 bg-rose-500/90 flex items-center justify-center">
        <button
          onClick={onDelete}
          className="text-white text-xs font-bold flex flex-col items-center gap-1"
          aria-label="حذف"
        >
          <Trash2 className="w-5 h-5" />
          حذف
        </button>
      </div>

      <div
        className={cn(
          "relative bg-card border border-border/40 p-4 transition-transform select-none",
          "rounded-2xl"
        )}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchMove={(e) => {
          if (startX.current === null) return;
          const dx = e.touches[0].clientX - startX.current;
          // RTL: swipe left to reveal (negative dx)
          if (dx < 0 && dx > -120) setOffset(dx);
        }}
        onTouchEnd={() => {
          startX.current = null;
          setOffset((o) => (o < -60 ? -96 : 0));
        }}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-2 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">{book?.nameAr}</span>
          <span>#{b.hadithNumber}</span>
        </div>
        {b.narrator && (
          <p className="text-xs font-bold text-[hsl(var(--gold-gradient-end))] mb-1.5">
            عن {b.narrator}
          </p>
        )}
        <p
          className="text-[16px] leading-[2] line-clamp-3"
          style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
        >
          {b.text}
        </p>
        {b.grade && (
          <Badge variant="outline" className="mt-2 text-[10px]">{b.grade}</Badge>
        )}
      </div>
    </div>
  );
};

const HadithBookmarksPage = () => {
  const navigate = useNavigate();
  const { bookmarks, remove, loading } = useHadithBookmarks();

  const grouped = useMemo(() => {
    const map = new Map<string, HadithBookmark[]>();
    hadithBooks.forEach((b) => map.set(b.id, []));
    bookmarks.forEach((b) => {
      const arr = map.get(b.bookId) || [];
      arr.push(b);
      map.set(b.bookId, arr);
    });
    return Array.from(map.entries()).filter(([, items]) => items.length > 0);
  }, [bookmarks]);

  return (
    <>
      <Helmet>
        <title>المحفوظات | الأحاديث النبوية | نور الفرقان</title>
      </Helmet>

      <div className="min-h-screen bg-background pb-28" dir="rtl">
        <div className="fixed inset-0 islamic-pattern opacity-[0.04] pointer-events-none" />

        <header className="relative pt-6 pb-4 px-4 flex items-center justify-between gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full" aria-label="رجوع">
            <ChevronRight className="w-5 h-5" />
          </Button>
          <h1
            className="text-lg font-bold"
            style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
          >
            الأحاديث المحفوظة
          </h1>
          <div className="w-9" />
        </header>

        <main className="relative z-10 px-4">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground py-12">جاري التحميل...</p>
          ) : bookmarks.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[hsl(var(--gold-gradient-start))] to-[hsl(var(--gold-gradient-end))] text-white flex items-center justify-center mb-4">
                <BookMarked className="w-7 h-7" />
              </div>
              <p
                className="text-base font-bold mb-1"
                style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
              >
                لا توجد أحاديث محفوظة بعد
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                استخدم أيقونة الحفظ لإضافة أحاديثك المفضلة هنا
              </p>
              <Button onClick={() => navigate("/hadith")} className="rounded-full">تصفح الأحاديث</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([bookId, items]) => {
                const book = getBookById(bookId);
                return (
                  <section key={bookId}>
                    <div className="flex items-center justify-between mb-3">
                      <h2
                        className="text-sm font-bold"
                        style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                      >
                        {book?.nameAr}
                      </h2>
                      <Badge variant="outline" className="text-[10px]">
                        {items.length.toLocaleString("ar-EG")}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {items.map((b) => (
                        <SwipeRow
                          key={`${b.bookId}-${b.hadithNumber}`}
                          b={b}
                          onDelete={() => remove({ bookId: b.bookId, hadithNumber: b.hadithNumber })}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
              <p className="text-center text-[10px] text-muted-foreground pt-4">
                اسحب لليسار لحذف حديث
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default HadithBookmarksPage;
