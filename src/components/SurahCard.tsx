import { Link } from "react-router-dom";
import { Surah } from "@/data/surahs";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

const toArabicDigits = (n: number) =>
  n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

const SurahCard = ({ surah, index }: SurahCardProps) => {
  const isMeccan = surah.revelationType === "Meccan";

  return (
    <Link
      to={`/surah/${surah.number}`}
      className="group block animate-slide-up focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl"
      style={{ animationDelay: `${index * 25}ms` }}
      aria-label={`سورة ${surah.name}`}
    >
      <div
        dir="rtl"
        className="relative flex items-center gap-5 rounded-2xl bg-card border border-border/60 px-5 py-4 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_hsl(var(--primary)/0.35)] hover:-translate-y-0.5"
      >
        {/* Ornate Surah Number */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rotate-45 rounded-md bg-gradient-to-br from-primary to-primary/70 shadow-md shadow-primary/20 flex items-center justify-center">
            <span className="-rotate-45 text-primary-foreground font-arabic font-bold text-base leading-none">
              {toArabicDigits(surah.number)}
            </span>
          </div>
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <h3 className="font-quran font-bold text-2xl text-foreground group-hover:text-primary transition-colors leading-tight truncate">
            {surah.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${
                isMeccan
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/25 text-accent-foreground"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isMeccan ? "bg-primary" : "bg-accent-foreground/70"
                }`}
              />
              {isMeccan ? "مكية" : "مدنية"}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="tabular-nums">
              {toArabicDigits(surah.numberOfAyahs)} آية
            </span>
          </div>
        </div>

        {/* Decorative chevron */}
        <div className="shrink-0 text-muted-foreground/40 group-hover:text-primary/60 transition-colors font-arabic text-lg">
          ﴿
        </div>
      </div>
    </Link>
  );
};

export default SurahCard;
