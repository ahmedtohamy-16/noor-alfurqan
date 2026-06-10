import { cn } from "@/lib/utils";
import { hadithBooks } from "@/data/hadithBooks";

interface Props {
  selectedBookId: string; // 'all' or book id
  onSelect: (id: string) => void;
}

const TABS = [
  { id: "all", nameAr: "الكل" },
  ...hadithBooks.map((b) => ({ id: b.id, nameAr: b.nameAr })),
];

const HadithBookTabs = ({ selectedBookId, onSelect }: Props) => {
  return (
    <div className="relative">
      <div
        className="overflow-x-auto scrollbar-none px-4"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex items-center gap-1 min-w-max" dir="rtl">
          {TABS.map((t) => {
            const active = selectedBookId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelect(t.id)}
                className={cn(
                  "relative px-4 py-3 text-sm whitespace-nowrap transition-colors",
                  active
                    ? "font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
              >
                {t.nameAr}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-gradient-to-r from-[hsl(var(--gold-gradient-start))] to-[hsl(var(--gold-gradient-end))]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HadithBookTabs;
