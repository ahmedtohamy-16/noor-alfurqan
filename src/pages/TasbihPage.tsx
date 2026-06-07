import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, BarChart3, Menu, Edit, Plus, Clock, Settings2, Rabbit, Turtle, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import TasbihCounter from "@/components/TasbihCounter";
import { useTasbih } from "@/hooks/useTasbih";
import mosqueBg from "@/assets/mosque-night-hero.jpg";
import { cn } from "@/lib/utils";

const quickDhikrs = [
  { text: "سبحان الله", count: 33 },
  { text: "الحمد لله", count: 33 },
  { text: "الله أكبر", count: 34 },
  { text: "لا إله إلا الله", count: 33 },
  { text: "استغفر الله", count: 33 },
  { text: "لا حول ولا قوة إلا بالله", count: 33 },
];

const TasbihPage = () => {
  const { stats, currentDhikr, changeDhikr, count, increment, reset, saveSession, appearance, updateAppearance } = useTasbih();
  const [dailyGoal, setDailyGoal] = useState(1000);
  const [greeting, setGreeting] = useState("مساء الخير");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tasbih_daily_goal");
    if (stored) setDailyGoal(parseInt(stored));
    const h = new Date().getHours();
    if (h < 12) setGreeting("صباح الخير");
    else if (h < 18) setGreeting("ظهرك سعيد");
    else setGreeting("مساء الخير");
  }, []);

  const arabic = (n: number) => {
    const a = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return n.toString().split("").map((d) => a[parseInt(d)] ?? d).join("");
  };

  const goalProgress = Math.min(100, Math.round((stats.todayCount / dailyGoal) * 100));

  const speedLabel = appearance.beadSpeed <= 180 ? "سريع" : appearance.beadSpeed >= 500 ? "بطيء" : "متوسط";

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero with mosque */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mosqueBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/80 to-primary" />
        <div className="relative px-4 pt-6 pb-32 arabic-ui" dir="rtl">
          <div className="flex items-center justify-between mb-6">
            <button className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-center text-white">
              <p className="text-sm opacity-90">{greeting} <span>👋</span></p>
            </div>
            <Link
              to="/reading-stats"
              className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white"
            >
              <BarChart3 className="w-5 h-5" />
            </Link>
          </div>

          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-1">التسبيح</h1>
            <p className="opacity-90 text-sm">{currentDhikr}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-24 relative z-10 arabic-ui" dir="rtl">
        {/* Counter card */}
        <Card className="bg-white dark:bg-card rounded-3xl p-6 shadow-2xl border-0">
          <TasbihCounter
            count={count}
            increment={increment}
            reset={reset}
            saveSession={saveSession}
            appearance={appearance}
          />
        </Card>

        {/* Appearance Settings */}
        <Card className="mt-4 p-5">
          <button
            onClick={() => setShowSettings((s) => !s)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground">تخصيص السبحة</h3>
            </div>
            <ChevronLeft className={cn("w-4 h-4 text-muted-foreground transition-transform", showSettings && "-rotate-90")} />
          </button>

          {showSettings && (
            <div className="mt-4 space-y-5 animate-fade-in">
              {/* Speed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge className="w-4 h-4" />
                    <span>سرعة حركة الخرز</span>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {speedLabel}
                  </span>
                </div>
                <Slider
                  value={[appearance.beadSpeed]}
                  onValueChange={([v]) => updateAppearance({ beadSpeed: v })}
                  min={100}
                  max={800}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span className="flex items-center gap-0.5"><Rabbit className="w-3 h-3" /> سريع</span>
                  <span className="flex items-center gap-0.5"><Turtle className="w-3 h-3" /> بطيء</span>
                </div>
              </div>

              {/* Markers */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border-2 border-primary/40" />
                    <span>عدد العلامات</span>
                  </div>
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {arabic(appearance.markerCount)}
                  </span>
                </div>
                <Slider
                  value={[appearance.markerCount]}
                  onValueChange={([v]) => updateAppearance({ markerCount: v })}
                  min={0}
                  max={11}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>بدون</span>
                  <span>١١ علامة</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Quick adhkar */}
        <Card className="mt-6 p-5">
          <h3 className="text-center font-bold text-foreground mb-4">أذكار سريعة</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {quickDhikrs.map((d) => {
              const active = currentDhikr === d.text;
              return (
                <button
                  key={d.text}
                  onClick={() => changeDhikr(d.text)}
                  className={cn(
                    "rounded-xl py-3 px-2 text-center transition-all border",
                    active
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-muted/40 hover:bg-muted border-transparent text-foreground"
                  )}
                >
                  <p className="text-sm font-bold leading-tight">{d.text}</p>
                  <p className={cn("text-[10px] mt-1", active ? "opacity-90" : "text-muted-foreground")}>
                    {arabic(d.count)} مرة
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Daily Goal */}
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">هدفك اليومي</h3>
            <Edit className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="hsl(var(--muted))" strokeWidth="6" fill="none" />
                <circle
                  cx="40" cy="40" r="34"
                  stroke="hsl(var(--primary))"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(goalProgress / 100) * 213.6} 213.6`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-primary">{arabic(goalProgress)}%</span>
              </div>
            </div>
            <div className="flex-1 text-center">
              <p className="text-2xl font-bold">
                <span className="text-primary">{arabic(stats.todayCount)}</span>
                <span className="text-muted-foreground"> / {arabic(dailyGoal)}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">سبحة</p>
            </div>
          </div>
        </Card>

        {/* Last session */}
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">آخر جلسة</h3>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{arabic(stats.todayCount || 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">سبحة</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-xs text-muted-foreground mt-1">دقيقة</p>
            </div>
            <div>
              <p className="text-base font-bold text-foreground">اليوم</p>
              <p className="text-xs text-muted-foreground mt-1">--:--</p>
            </div>
          </div>
        </Card>

        <Button className="w-full mt-5 h-14 text-base rounded-2xl gap-2 shadow-lg shadow-primary/30">
          <Plus className="w-5 h-5" />
          جلسة جديدة
        </Button>
      </main>
    </div>
  );
};

export default TasbihPage;
