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

const CitySearchCombobox = ({
  onSelect,
  disabled,
  loading,
  placeholder = "ابحث عن مدينتك...",
  className,
}: Props) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    return allCities
      .filter(
        (c) =>
          normalize(c.name_ar).includes(q) ||
          c.name_en.toLowerCase().includes(q.toLowerCase()) ||
          normalize(c.country_ar).includes(q)
      )
      .slice(0, 8);
  }, [query]);

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
    setOpen(false);
  };

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
          disabled={disabled || loading}
          className="h-11 pr-10 pl-9 rounded-xl text-sm"
        />
        {loading ? (
          <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted"
            aria-label="مسح"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        ) : null}
      </div>

      {open && query && (
        <div className="absolute z-50 left-0 right-0 mt-2 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              لا توجد نتائج. جرّب اسماً آخر أو حدد يدوياً.
            </div>
          ) : (
            results.map((c) => (
              <button
                key={`${c.country_code}-${c.name_en}`}
                type="button"
                onClick={() => handlePick(c)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-accent transition text-right border-b last:border-b-0 border-border/40"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name_ar}</div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {c.country_ar} · {c.name_en}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CitySearchCombobox;
