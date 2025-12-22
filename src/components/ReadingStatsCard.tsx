import { BookOpen, Clock, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useReadingStats } from "@/hooks/useReadingStats";

const ReadingStatsCard = () => {
  const { stats, isLoading } = useReadingStats();

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} ساعة ${mins > 0 ? `و ${mins} دقيقة` : ""}`;
  };

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num
      .toString()
      .split("")
      .map((digit) => arabicNumbers[parseInt(digit)] || digit)
      .join("");
  };

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-24 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">إحصائيات القراءة</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background/60 rounded-lg p-3 text-center">
          <BookOpen className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">
            {convertToArabicNumber(stats.pagesRead)}
          </p>
          <p className="text-xs text-muted-foreground">صفحات مقروءة</p>
        </div>

        <div className="bg-background/60 rounded-lg p-3 text-center">
          <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">
            {stats.totalReadingTime > 0 ? formatTime(stats.totalReadingTime) : "٠"}
          </p>
          <p className="text-xs text-muted-foreground">وقت القراءة</p>
        </div>

        <div className="bg-background/60 rounded-lg p-3 text-center">
          <Calendar className="w-5 h-5 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">
            {convertToArabicNumber(stats.streakDays)}
          </p>
          <p className="text-xs text-muted-foreground">أيام متتالية</p>
        </div>

        <div className="bg-background/60 rounded-lg p-3 text-center">
          <BookOpen className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">
            {convertToArabicNumber(stats.todayPagesRead)}
          </p>
          <p className="text-xs text-muted-foreground">صفحات اليوم</p>
        </div>
      </div>
    </Card>
  );
};

export default ReadingStatsCard;
