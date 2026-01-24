import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { TimePeriod } from "@/hooks/useAdvancedStats";

interface StatsComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  changePercent: number;
  unit: string;
  period: TimePeriod;
  icon: React.ReactNode;
  color: string;
}

const StatsComparisonCard = ({
  title,
  currentValue,
  previousValue,
  changePercent,
  unit,
  period,
  icon,
  color,
}: StatsComparisonCardProps) => {
  const isPositive = changePercent > 0;
  const isNeutral = changePercent === 0;

  const getPeriodLabel = (p: TimePeriod): string => {
    switch (p) {
      case "today": return "مقارنة بالأمس";
      case "week": return "مقارنة بالأسبوع السابق";
      case "30days": return "مقارنة بالـ 30 يوم السابقة";
      case "60days": return "مقارنة بالـ 60 يوم السابقة";
      case "90days": return "مقارنة بالـ 90 يوم السابقة";
      case "all": return "";
      default: return "";
    }
  };

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => {
      if (digit === "-") return "-";
      return arabicNumbers[parseInt(digit)] || digit;
    }).join("");
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-background to-muted/20">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {period !== "all" && (
            <p className="text-xs text-muted-foreground">{getPeriodLabel(period)}</p>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-foreground">
            {convertToArabicNumber(currentValue)}
          </p>
          <p className="text-sm text-muted-foreground">{unit}</p>
        </div>

        {period !== "all" && (
          <div className="text-left">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              isPositive 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : isNeutral 
                  ? "bg-muted text-muted-foreground"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : isNeutral ? (
                <Minus className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{isPositive ? "+" : ""}{convertToArabicNumber(changePercent)}%</span>
            </div>
            
            {previousValue > 0 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <span>{convertToArabicNumber(previousValue)}</span>
                <ArrowRight className="w-3 h-3" />
                <span>{convertToArabicNumber(currentValue)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsComparisonCard;
