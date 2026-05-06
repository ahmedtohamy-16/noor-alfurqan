import { Card } from "@/components/ui/card";
import { BookOpen, Share2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Curated daily verses with surah/ayah refs for navigation
const VERSES = [
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translation: "وقل رب زدني علماً",
    surah: "سورة طه",
    surahNumber: 20,
    ayahNumber: 114,
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "إن مع العسر يسراً",
    surah: "سورة الشرح",
    surahNumber: 94,
    ayahNumber: 6,
  },
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    translation: "ومن يتق الله يجعل له مخرجاً",
    surah: "سورة الطلاق",
    surahNumber: 65,
    ayahNumber: 2,
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translation: "فاذكروني أذكركم",
    surah: "سورة البقرة",
    surahNumber: 2,
    ayahNumber: 152,
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "إن الله مع الصابرين",
    surah: "سورة البقرة",
    surahNumber: 2,
    ayahNumber: 153,
  },
];

const VerseOfTheDayCard = () => {
  const navigate = useNavigate();
  const dayIndex = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const verse = VERSES[dayIndex % VERSES.length];

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${verse.arabic}\n\n${verse.translation}\n— ${verse.surah} (${verse.ayahNumber})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "آية اليوم", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
  };

  const goToAyah = () => {
    navigate(`/surah/${verse.surahNumber}?ayah=${verse.ayahNumber}`);
  };

  return (
    <Card
      onClick={goToAyah}
      className="p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20 cursor-pointer hover:shadow-md transition-all arabic-ui"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter") goToAyah(); }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={handleShare}
              aria-label="مشاركة"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
            <p className="text-xs font-bold text-primary">آية اليوم</p>
          </div>
          <p className="font-quran text-xl leading-loose text-right text-foreground mb-2">
            {verse.arabic}
          </p>
          <p className="text-xs text-muted-foreground mb-2">{verse.translation}</p>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold">
              اذهب للآية
              <ChevronLeft className="w-3 h-3" />
            </span>
            <p className="text-[11px] text-muted-foreground/80">
              {verse.surah} • الآية {verse.ayahNumber}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VerseOfTheDayCard;
