import { Button } from "@/components/ui/button";
import { TimePeriod } from "@/hooks/useAdvancedStats";

interface StatsPeriodFilterProps {
  activePeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const periods: { value: TimePeriod; label: string; shortLabel: string }[] = [
  { value: "today", label: "اليوم", shortLabel: "اليوم" },
  { value: "week", label: "أسبوع", shortLabel: "٧ أيام" },
  { value: "30days", label: "٣٠ يومًا", shortLabel: "٣٠" },
  { value: "60days", label: "٦٠ يومًا", shortLabel: "٦٠" },
  { value: "90days", label: "٩٠ يومًا", shortLabel: "٩٠" },
  { value: "all", label: "الكل", shortLabel: "الكل" },
];

const StatsPeriodFilter = ({ activePeriod, onPeriodChange }: StatsPeriodFilterProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 p-2 bg-muted/30 rounded-xl">
      {periods.map((p) => (
        <Button
          key={p.value}
          variant={activePeriod === p.value ? "default" : "ghost"}
          size="sm"
          onClick={() => onPeriodChange(p.value)}
          className={`min-w-[60px] text-xs sm:text-sm transition-all ${
            activePeriod === p.value 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "hover:bg-muted"
          }`}
        >
          <span className="hidden sm:inline">{p.label}</span>
          <span className="sm:hidden">{p.shortLabel}</span>
        </Button>
      ))}
    </div>
  );
};

export default StatsPeriodFilter;
