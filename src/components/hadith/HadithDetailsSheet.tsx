import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { BookOpenText, Lightbulb, Sparkles, Loader2 } from "lucide-react";
import { useHadith } from "@/hooks/useHadith";
import { getBookById, type Hadith } from "@/data/hadithBooks";
import { normalizeArabic } from "@/lib/arabicNormalize";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  hadith: Hadith | null;
}

// Extract bullet points from an elaboration block (loose heuristic).
const extractBenefits = (elaboration?: string): string[] => {
  if (!elaboration) return [];
  const lines = elaboration
    .split(/\n+|(?:^|\s)[-•*]\s+|(?<=\.)\s+(?=\d+[\-\.\)])/g)
    .map((l) => l.replace(/^[-•*\d\)\.\s]+/, "").trim())
    .filter((l) => l.length > 8 && l.length < 240);
  return lines.slice(0, 6);
};

// Pick 4-6 distinctive words from the matn for similar-search.
const distinctiveWords = (text: string): string => {
  const tokens = normalizeArabic(text)
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of tokens) {
    if (!seen.has(w)) {
      seen.add(w);
      out.push(w);
    }
    if (out.length >= 4) break;
  }
  return out.join(" ");
};

const HadithDetailsSheet = ({ open, onOpenChange, hadith }: Props) => {
  const { searchHadiths } = useHadith();
  const [similar, setSimilar] = useState<Hadith[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  useEffect(() => {
    if (!open || !hadith) return;
    const q = distinctiveWords(hadith.text);
    if (!q) return;
    setLoadingSimilar(true);
    searchHadiths(hadith.bookId, q)
      .then((res) => {
        const filtered = (res.results || [])
          .filter((h) => h.hadithNumber !== hadith.hadithNumber)
          .slice(0, 4);
        setSimilar(filtered);
      })
      .catch(() => setSimilar([]))
      .finally(() => setLoadingSimilar(false));
  }, [open, hadith?.bookId, hadith?.hadithNumber]);

  if (!hadith) return null;
  const book = getBookById(hadith.bookId);
  const benefits = extractBenefits(hadith.elaboration);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl max-h-[88vh] overflow-y-auto p-0"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/40 px-5 pt-5 pb-3">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-4" />
          <SheetHeader className="text-right">
            <SheetTitle
              className="text-base"
              style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
            >
              {book?.nameAr} — حديث رقم {hadith.hadithNumber}
            </SheetTitle>
          </SheetHeader>
        </div>

        <div className="px-5 py-6 space-y-7">
          {/* Full text */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BookOpenText className="w-4 h-4 text-[hsl(var(--gold-gradient-end))]" />
              <h3 className="text-sm font-bold">نص الحديث كاملاً</h3>
            </div>
            {hadith.narrator && (
              <p className="text-sm font-bold mb-2 text-[hsl(var(--gold-gradient-end))]">
                عن {hadith.narrator}
              </p>
            )}
            <p
              className="text-[20px] leading-[2.1] text-foreground/95"
              style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
            >
              «{hadith.text}»
            </p>
          </section>

          {/* Explanation */}
          <section className="rounded-2xl bg-card/60 border border-border/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[hsl(var(--gold-gradient-end))]" />
              <h3 className="text-sm font-bold">الشرح</h3>
            </div>
            {hadith.elaboration ? (
              <p
                className="text-[15px] leading-loose text-foreground/85 whitespace-pre-wrap"
                style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
              >
                {hadith.elaboration}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                لا يتوفر شرح علمي مدوّن لهذا الحديث حالياً.
              </p>
            )}
          </section>

          {/* Benefits */}
          {benefits.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-[hsl(var(--gold-gradient-end))]" />
                <h3 className="text-sm font-bold">الفوائد المستخلصة</h3>
              </div>
              <ul className="space-y-2.5">
                {benefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-relaxed text-foreground/80"
                  >
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[hsl(var(--gold-gradient-start))] to-[hsl(var(--gold-gradient-end))] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Similar */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold">أحاديث مشابهة</h3>
              {loadingSimilar && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
            </div>
            {similar.length === 0 && !loadingSimilar ? (
              <p className="text-xs text-muted-foreground">لم يُعثر على أحاديث مشابهة.</p>
            ) : (
              <div className="space-y-3">
                {similar.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-xl border border-border/40 bg-card/40 p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-muted-foreground">#{h.hadithNumber}</span>
                      {h.grade && (
                        <Badge variant="outline" className="text-[10px]">{h.grade}</Badge>
                      )}
                    </div>
                    <p
                      className="text-sm leading-relaxed line-clamp-3"
                      style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                    >
                      {h.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default HadithDetailsSheet;
