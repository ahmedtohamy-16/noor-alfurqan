import { Link } from "react-router-dom";
import { Surah } from "@/data/surahs";

interface SurahCardProps {
  surah: Surah;
  index: number;
}

const SurahCard = ({ surah, index }: SurahCardProps) => {
  return (
    <Link
      to={`/surah/${surah.number}`}
      className="group block animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="relative bg-card hover:bg-surah-card-hover border border-border/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/30">
        {/* Surah Number Badge */}
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-arabic font-bold text-sm shadow-md">
          {surah.number}
        </div>

        <div className="flex items-center gap-4 arabic-ui">
          {/* Surah Info */}
          <div className="flex-1 text-right">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors font-quran">
              {surah.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {surah.englishNameTranslation}
            </p>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-border" />

          {/* Meta Info */}
          <div className="text-left min-w-[80px]">
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                surah.revelationType === "Meccan"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/20 text-accent-foreground"
              }`}
            >
              {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {surah.numberOfAyahs} آية
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SurahCard;
