import { useMemo, useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { countries, type City } from "@/data/locationData";
import { cn } from "@/lib/utils";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();

interface FlatCity extends City {
  country_code: string;
  country_ar: string;
}

const allCities: FlatCity[] = countries.flatMap((c) =>
  c.cities.map((city) => ({
    ...city,
    country_code: c.code,
    country_ar: c.name_ar,
  }))
);

interface Props {
  onSelect: (city: FlatCity) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}

// Highlight matched substring inside a label (operates on normalized form for matching)
const Highlight = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const nText = normalize(text);
  const nQuery = normalize(query);
  const idx = nText.indexOf(nQuery);
  if (idx === -1) return <>{text}</>;
  // Map back to original text by char index (normalize keeps length-ish; safe approximation)
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + nQuery.length);
  const after = text.slice(idx + nQuery.length);
  return (
    <>
      {before}
      <mark className="bg-primary/20 text-primary rounded px-0.5">{match}</mark>
      {after}
    </>
  );
};

const CitySearchCombobox = ({
  onSelect,
  disabled,
  loading,
  placeholder = "ابحث عن مدينتك...",
  className,
}: Props) => {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // debounce
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 220);
    return () => clearTimeout(id);
  }, [query]);

  const isSearching = query !== debounced && query.length > 0;

  const results = useMemo(() => {
    const q = normalize(debounced);
    if (!q) return [];
    const scored: { c: FlatCity; score: number }[] = [];
    for (const c of allCities) {
      const nAr = normalize(c.name_ar);
      const nEn = c.name_en.toLowerCase();
      const nCountry = normalize(c.country_ar);
      let score = -1;
      if (nAr === q || nEn === q) score = 100;
      else if (nAr.startsWith(q)) score = 80;
      else if (nEn.startsWith(q)) score = 70;
      else if (nAr.includes(q)) score = 50;
      else if (nEn.includes(q)) score = 40;
      else if (nCountry.includes(q)) score = 20;
      if (score >= 0) scored.push({ c, score });
    }
    scored.sort((a, b) => b.score - a.score || a.c.name_ar.length - b.c.name_ar.length);
    return scored.slice(0, 8).map((s) => s.c);
  }, [debounced]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePick = (city: FlatCity) => {
    onSelect(city);
    setQuery(city.name_ar);
    setSelectedKey(`${city.country_code}-${city.name_en}`);
    setOpen(false);
  };

  const showSpinner = loading || isSearching;

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          dir="rtl"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query && setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="h-11 pr-10 pl-9 rounded-xl text-sm"
        />
        {showSpinner ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebounced("");
              setOpen(false);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted"
            aria-label="مسح"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {open && debounced && (
        <div className="absolute z-50 left-0 right-0 mt-2 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              لا توجد نتائج. جرّب اسماً آخر أو حدد يدوياً.
            </div>
          ) : (
            results.map((c) => {
              const key = `${c.country_code}-${c.name_en}`;
              const isSelected = selectedKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePick(c)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 transition text-right border-b last:border-b-0 border-border/40",
                    isSelected ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-accent"
                  )}
                >
                  <MapPin className={cn("w-4 h-4 shrink-0", isSelected ? "text-primary" : "text-primary/70")} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      <Highlight text={c.name_ar} query={debounced} />
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      <Highlight text={c.country_ar} query={debounced} /> ·{" "}
                      <Highlight text={c.name_en} query={debounced} />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default CitySearchCombobox;
