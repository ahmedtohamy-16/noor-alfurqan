import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
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
            <Button variant="ghost"
              key={t.id}
              onClick={() => onToggle(t.id)}
              className={cn(
                "h-11 px-3.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
                active
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent shadow-sm"
                  : "bg-card/60 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              {t.id === "iman" ? <Heart aria-hidden="true" className="h-4 w-4" /> : <span aria-hidden="true" className="mr-1">{t.emoji}</span>}
              {t.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default HadithTopicChips;
