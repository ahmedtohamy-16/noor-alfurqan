import { BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface LastReadCardProps {
  surahName: string;
  surahNumber: number;
  ayahNumber: number;
  progress: number;
}

const LastReadCard = ({ surahName, surahNumber, ayahNumber, progress }: LastReadCardProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 arabic-ui">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm opacity-90">آخر قراءة</span>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
            {Math.round(progress)}% مكتمل
          </span>
        </div>

        <h3 className="text-2xl font-bold mb-1 font-quran">{surahName}</h3>
        <p className="text-sm opacity-80 mb-4">الآية {ayahNumber}</p>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full mb-4">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Link to={`/surah/${surahNumber}?ayah=${ayahNumber}`}>
          <Button
            variant="secondary"
            className="w-full gap-2 bg-white/20 hover:bg-white/30 border-0 text-primary-foreground"
          >
            <Play className="w-4 h-4" />
            متابعة القراءة
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default LastReadCard;
