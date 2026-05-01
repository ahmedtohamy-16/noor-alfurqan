import { Card } from "@/components/ui/card";
import { BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Curated daily verses
const VERSES = [
  {
    arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا",
    translation: "And say, \"My Lord, increase me in knowledge.\"",
    surah: "Surah Taha (20:114)",
  },
  {
    arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    surah: "Surah Ash-Sharh (94:6)",
  },
  {
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    translation: "Whoever fears Allah, He will make a way out for him.",
    surah: "Surah At-Talaq (65:2)",
  },
  {
    arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    translation: "Remember Me, I will remember you.",
    surah: "Surah Al-Baqarah (2:152)",
  },
  {
    arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Indeed, Allah is with the patient.",
    surah: "Surah Al-Baqarah (2:153)",
  },
];

const VerseOfTheDayCard = () => {
  // Pick verse by day of year for stability
  const dayIndex = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const verse = VERSES[dayIndex % VERSES.length];

  const handleShare = async () => {
    const text = `${verse.arabic}\n\n${verse.translation}\n— ${verse.surah}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "آية اليوم", text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {}
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-primary">Verse of the Day</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={handleShare}
              aria-label="مشاركة"
            >
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="font-quran text-xl leading-loose text-right text-foreground mb-2">
            {verse.arabic}
          </p>
          <p className="text-xs text-muted-foreground italic mb-1">"{verse.translation}"</p>
          <p className="text-[11px] text-muted-foreground/80">{verse.surah}</p>
        </div>
      </div>
    </Card>
  );
};

export default VerseOfTheDayCard;
