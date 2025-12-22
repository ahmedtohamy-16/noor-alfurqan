import { useState } from "react";
import { RotateCcw, Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasbih } from "@/hooks/useTasbih";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TasbihCounter = () => {
  const { count, currentDhikr, increment, reset, saveSession, changeDhikr, dhikrOptions } = useTasbih();
  const [isPressed, setIsPressed] = useState(false);

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
  };

  const handleClick = () => {
    increment();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);
  };

  const handleSave = () => {
    if (count > 0) {
      saveSession();
      toast.success(`تم حفظ ${convertToArabicNumber(count)} تسبيحة`);
    }
  };

  const handleReset = () => {
    reset();
    toast.info("تم إعادة العداد");
  };

  return (
    <Card className="p-6 arabic-ui">
      <div className="flex flex-col items-center">
        {/* Dhikr Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-xl font-bold mb-4 gap-2">
              {currentDhikr}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="arabic-ui">
            {dhikrOptions.map((dhikr) => (
              <DropdownMenuItem
                key={dhikr}
                onClick={() => changeDhikr(dhikr)}
                className={cn(
                  "text-lg cursor-pointer",
                  currentDhikr === dhikr && "bg-primary/10 text-primary"
                )}
              >
                {dhikr}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Counter Button */}
        <button
          onClick={handleClick}
          className={cn(
            "w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-2xl transition-all duration-150 select-none",
            isPressed ? "scale-95 shadow-lg" : "scale-100 hover:scale-[1.02] active:scale-95"
          )}
        >
          <span className="text-6xl font-bold">{convertToArabicNumber(count)}</span>
        </button>

        {/* Milestone indicator */}
        {count > 0 && count % 33 === 0 && (
          <p className="text-primary text-sm mt-2 animate-pulse">
            ✨ {convertToArabicNumber(count / 33)} × ٣٣
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button variant="outline" size="lg" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            إعادة
          </Button>
          <Button size="lg" onClick={handleSave} className="gap-2" disabled={count === 0}>
            <Save className="w-4 h-4" />
            حفظ
          </Button>
        </div>

        {/* Quick info */}
        <p className="text-sm text-muted-foreground mt-4">
          اضغط على الدائرة للتسبيح
        </p>
      </div>
    </Card>
  );
};

export default TasbihCounter;
