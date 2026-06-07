import { useState, useMemo } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { TasbihAppearance } from "@/hooks/useTasbih";

const BEADS = 33;

interface TasbihCounterProps {
  count: number;
  increment: () => void;
  reset: () => void;
  saveSession: () => void;
  appearance: TasbihAppearance;
}

const TasbihCounter = ({ count, increment, reset, saveSession, appearance }: TasbihCounterProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const arabic = (n: number): string =>
    n.toString().split("").map((d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)] ?? d).join("");

  // Rotation angle: one bead step per tap
  const rotation = useMemo(() => (count * (360 / BEADS)) % 360, [count]);
  const activeBead = count % BEADS;
  const cycles = Math.floor(count / BEADS);

  const handleClick = () => {
    increment();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 120);
    if (count > 0 && (count + 1) % 33 === 0) {
      toast.success(`✨ ${arabic((count + 1) / 33)} × ٣٣`);
    }
  };

  const handleReset = () => {
    if (count > 0) saveSession();
    reset();
  };

  // Marker positions based on markerCount
  const markerIndices = useMemo(() => {
    const indices: number[] = [];
    if (appearance.markerCount <= 0) return indices;
    const step = BEADS / appearance.markerCount;
    for (let i = 0; i < appearance.markerCount; i++) {
      indices.push(Math.round(i * step) % BEADS);
    }
    return indices;
  }, [appearance.markerCount]);

  // Generate beads on a circle
  const radius = 130; // px from center
  const beadSize = 20;
  const beads = Array.from({ length: BEADS }, (_, i) => {
    const angle = (i / BEADS) * 2 * Math.PI - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return { i, x, y, angle };
  });

  return (
    <div className="relative arabic-ui flex flex-col items-center">
      <button
        onClick={handleClick}
        className={cn(
          "relative w-[320px] h-[320px] sm:w-[360px] sm:h-[360px] flex items-center justify-center select-none transition-transform duration-150",
          isPressed ? "scale-[0.97]" : "active:scale-[0.97]"
        )}
        aria-label="عدّاد التسبيح"
      >
        {/* Glow */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-2xl" />

        {/* Rotating beads ring */}
        <div
          className="absolute inset-0 transition-transform ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${appearance.beadSpeed}ms`,
          }}
        >
          <div className="relative w-full h-full">
            {/* Thread (subtle circle) */}
            <svg className="absolute inset-0 w-full h-full" viewBox="-160 -160 320 320">
              <circle
                cx="0"
                cy="0"
                r={radius}
                fill="none"
                stroke="hsl(var(--primary) / 0.18)"
                strokeWidth="1.5"
                strokeDasharray="2 4"
              />
            </svg>

            {beads.map(({ i, x, y }) => {
              const isActive = i === activeBead;
              const isPast = count > 0 && i < activeBead;
              const isMarker = markerIndices.includes(i);
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  }}
                >
                  <div
                    className={cn(
                      "rounded-full transition-all ease-out shadow-md",
                      isMarker ? "ring-1 ring-primary/40" : "",
                      isActive
                        ? "bg-gradient-to-br from-primary to-primary/70 scale-150 shadow-primary/50"
                        : isPast
                        ? "bg-primary/70"
                        : "bg-gradient-to-br from-muted-foreground/30 to-muted-foreground/10"
                    )}
                    style={{
                      width: isMarker ? beadSize + 4 : beadSize,
                      height: isMarker ? beadSize + 4 : beadSize,
                      transitionDuration: `${appearance.beadSpeed}ms`,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Center counter (does NOT rotate) */}
        <div className="relative z-10 flex flex-col items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-card to-muted/50 border border-primary/20 shadow-xl">
          <span className="text-6xl font-bold text-foreground tabular-nums leading-none">
            {arabic(count)}
          </span>
          <span className="text-xs text-muted-foreground mt-2">سبحة</span>
          {cycles > 0 && (
            <span className="mt-1 text-[11px] text-primary font-semibold">
              {arabic(cycles)} × ٣٣
            </span>
          )}
        </div>
      </button>

      <div className="flex items-center justify-center mt-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="w-12 h-12 rounded-full bg-card border shadow-sm hover:bg-muted"
          aria-label="تصفير"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default TasbihCounter;
