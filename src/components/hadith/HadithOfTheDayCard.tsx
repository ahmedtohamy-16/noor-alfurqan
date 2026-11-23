import { Share2, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Hadith } from "@/data/hadithBooks";
import { getBookById } from "@/data/hadithBooks";

interface Props {
  hadith: Hadith | null;
  loading: boolean;
  onShare: (h: Hadith) => void;
}

const HadithOfTheDayCard = ({ hadith, loading, onShare }: Props) => {
  const book = hadith ? getBookById(hadith.bookId) : undefined;

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 mt-2 border border-primary/25 bg-card shadow-sm">
      <div className="relative p-6 text-card-foreground">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <Sparkles className="w-4 h-4" />
          <span className="text-[11px] font-semibold tracking-wide uppercase opacity-90">
            حديث اليوم
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-7 h-7 animate-spin opacity-80" />
          </div>
        ) : hadith ? (
          <>
            <p
              className="text-center text-lg sm:text-xl leading-loose line-clamp-5"
              style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
              dir="rtl"
            >
              «{hadith.text}»
            </p>

            <div className="mt-5 text-center text-sm">
              {hadith.narrator && (
                <p className="opacity-95 font-medium">— {hadith.narrator}</p>
              )}
              <p className="opacity-80 mt-1 text-xs">
                {book?.nameAr} · رقم {hadith.hadithNumber}
              </p>
            </div>

            <Button
              onClick={() => hadith && onShare(hadith)}
              variant="secondary"
              className="mt-5 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-2"
            >
              <Share2 className="w-4 h-4" />
              شارك حديث اليوم
            </Button>
          </>
        ) : (
          <p className="text-center opacity-90 py-8">
            لا يمكن تحميل حديث اليوم الآن
          </p>
        )}
      </div>
    </div>
  );
};

export default HadithOfTheDayCard;
