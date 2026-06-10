import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  isSearching: boolean;
  resultsCount?: number;
  showCount: boolean;
}

const HadithSearchBar = ({
  value, onChange, onClear, isSearching, resultsCount = 0, showCount,
}: Props) => {
  return (
    <div className="px-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          dir="rtl"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ابحث في الأحاديث، الراوي، أو الموضوع..."
          className="h-12 pr-10 pl-10 rounded-2xl bg-card/70 backdrop-blur border-border/60 text-sm focus-visible:ring-[hsl(var(--gold-gradient-end))]"
          style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
        />
        {isSearching ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[hsl(var(--gold-gradient-end))]" />
        ) : value ? (
          <button
            type="button"
            onClick={onClear}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted"
            aria-label="مسح"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {showCount && (
        <p className="mt-2 text-[11px] text-muted-foreground text-right" dir="rtl">
          {resultsCount > 0
            ? `${resultsCount.toLocaleString("ar-EG")} نتيجة`
            : "لا توجد نتائج مطابقة"}
        </p>
      )}
    </div>
  );
};

export default HadithSearchBar;
