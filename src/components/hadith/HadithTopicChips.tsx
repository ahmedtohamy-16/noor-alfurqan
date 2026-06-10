import { cn } from "@/lib/utils";
import { HADITH_TOPICS } from "@/data/hadithTopics";

interface Props {
  selected: string[];
  onToggle: (id: string) => void;
}

const HadithTopicChips = ({ selected, onToggle }: Props) => {
  return (
    <div
      className="overflow-x-auto scrollbar-none px-4 -mx-1"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex items-center gap-2 min-w-max py-1" dir="rtl">
        {HADITH_TOPICS.map((t) => {
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              className={cn(
                "h-9 px-3.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                active
                  ? "bg-gradient-to-r from-[hsl(var(--gold-gradient-start))] to-[hsl(var(--gold-gradient-end))] text-white border-transparent shadow-sm"
                  : "bg-card/60 border-border/60 text-muted-foreground hover:text-foreground hover:border-[hsl(var(--gold-gradient-end)/0.4)]"
              )}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HadithTopicChips;
