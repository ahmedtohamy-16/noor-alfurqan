import { ArrowUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type HadithSort = "default" | "most_shared" | "random" | "by_narrator";

const LABELS: Record<HadithSort, string> = {
  default: "الترتيب الافتراضي",
  most_shared: "الأكثر مشاركة",
  random: "عشوائي",
  by_narrator: "حسب الراوي",
};

interface Props {
  value: HadithSort;
  onChange: (v: HadithSort) => void;
}

const HadithSortMenu = ({ value, onChange }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full bg-card/60 backdrop-blur border-border/60 text-xs h-9"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{LABELS[value]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {(Object.keys(LABELS) as HadithSort[]).map((k) => (
          <DropdownMenuItem
            key={k}
            onClick={() => onChange(k)}
            className="justify-between gap-3"
          >
            <span>{LABELS[k]}</span>
            {value === k && <Check className="w-4 h-4 text-[hsl(var(--gold-gradient-end))]" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HadithSortMenu;
