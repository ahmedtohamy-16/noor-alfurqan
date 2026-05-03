import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTasbih } from "@/hooks/useTasbih";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import tasbihBeads from "@/assets/tasbih-beads.png";

const TasbihCounter = () => {
  const { count, increment, reset, saveSession } = useTasbih();
  const [isPressed, setIsPressed] = useState(false);

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
  };

  const handleClick = () => {
    increment();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
    if (count > 0 && (count + 1) % 33 === 0) {
      toast.success(`✨ ${convertToArabicNumber((count + 1) / 33)} × ٣٣`);
    }
  };

  const handleReset = () => {
    if (count > 0) saveSession();
    reset();
  };

  return (
    <div className="relative arabic-ui">
      <button
        onClick={handleClick}
        className={cn(
          "relative w-full aspect-square max-w-sm mx-auto flex items-center justify-center select-none transition-transform duration-150",
          isPressed ? "scale-[0.98]" : "active:scale-[0.98]"
        )}
        aria-label="عدّاد التسبيح"
      >
        <img
          src={tasbihBeads}
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow-2xl"
          loading="lazy"
        />
        <div className="relative z-10 flex flex-col items-center justify-center -mt-6">
          <span className="text-7xl md:text-8xl font-bold text-foreground tabular-nums">
            {convertToArabicNumber(count)}
          </span>
          <span className="text-sm text-muted-foreground mt-1">سبحة</span>
        </div>
      </button>

      <div className="flex items-center justify-center mt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="w-12 h-12 rounded-full bg-card border shadow-sm"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default TasbihCounter;
