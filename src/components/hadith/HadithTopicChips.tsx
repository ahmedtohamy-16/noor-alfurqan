import { Heart, Coins, Moon, HeartHandshake, Sparkles, HandHeart, BookOpen, Users, Shield, GraduationCap, Scale, Gem, type LucideIcon } from "lucide-react";
import { KaabaIcon, MosqueIcon } from "@/components/icons/IslamicIcons";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  iman: Heart, salah: MosqueIcon, zakat: Coins, siyam: Moon, hajj: KaabaIcon, akhlaq: HeartHandshake,
  athkar: Sparkles, dua: HandHeart, quran: BookOpen, family: Users, jihad: Shield, ilm: GraduationCap,
  muamala: Scale, manners: Gem,
};
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
      className="overflow-x-auto scrollbar-none px-4"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="flex items-center gap-2 min-w-max py-1" dir="rtl">
        {HADITH_TOPICS.map((t) => {
          const active = selected.includes(t.id);
          const Icon = TOPIC_ICONS[t.id] ?? Heart;
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
              <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
              {t.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default HadithTopicChips;
