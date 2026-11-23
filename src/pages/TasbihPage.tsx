import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, BarChart3, Edit, Plus, Clock, Settings2, Rabbit, Turtle, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import TasbihCounter from "@/components/TasbihCounter";
import { useTasbih } from "@/hooks/useTasbih";
import mosqueBg from "@/assets/mosque-night-hero.jpg";
import { cn } from "@/lib/utils";
import MobileMenu from "@/components/MobileMenu";
import { greetingForTime } from "@/lib/displayFormat";

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
  const greeting = greetingForTime();
  const [showSettings, setShowSettings] = useState(false);
  const [customDhikr, setCustomDhikr] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const saveGoal = (n: number) => {
    if (!Number.isFinite(n) || n < 1) return;
    const v = Math.min(100000, Math.floor(n));
    setDailyGoal(v);
    localStorage.setItem("tasbih_daily_goal", String(v));
    setGoalInput("");
  };

  useEffect(() => {
    const stored = localStorage.getItem("tasbih_daily_goal");
    if (stored) setDailyGoal(parseInt(stored));
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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/85 to-primary/95" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-background" />
        <div className="relative px-4 pt-6 pb-32 arabic-ui" dir="rtl">
          <div className="flex items-center justify-between mb-6">
            <Link to="/reading-stats" aria-label="إحصائيات التسبيح" className="w-11 h-11 rounded-full bg-primary-foreground/15 flex items-center justify-center text-primary-foreground">
              <BarChart3 className="w-5 h-5" />
            </Link>
            <div className="text-center text-primary-foreground">
              <p className="text-sm opacity-90">{greeting}</p>
            </div>
            <MobileMenu className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25" />
          </div>

          <div className="text-center text-primary-foreground">
            <h1 className="text-3xl font-bold mb-1">التسبيح</h1>
            <p className="opacity-90 text-sm break-words">{currentDhikr}</p>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-24 relative z-10 arabic-ui" dir="rtl">
        {/* Counter card */}
        <Card className="bg-card rounded-3xl p-4 sm:p-6 shadow-2xl border-0 min-w-0">
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
            type="button"
            onClick={() => setShowSettings((s) => !s)}
            aria-expanded={showSettings}
            className="relative z-10 flex items-center justify-between w-full min-h-11"
          >
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-foreground">تخصيص السبحة</h3>
            </div>
            <ChevronLeft className={cn("w-4 h-4 text-muted-foreground transition-transform", showSettings && "-rotate-90")} />
          </button>

          {showSettings && (
            <div className="mt-4 space-y-5 animate-fade-in">
              <div>
                <p className="text-sm text-muted-foreground mb-2">ذكر مخصص</p>
                <form className="flex gap-2 min-w-0" onSubmit={(e) => { e.preventDefault(); const t = customDhikr.trim(); if (t) { changeDhikr(t.slice(0, 200)); setCustomDhikr(""); } }}>
                  <Input value={customDhikr} onChange={(e) => setCustomDhikr(e.target.value)} placeholder="اكتب الذكر الذي تريده" maxLength={200} className="h-11 min-w-0" />
                  <Button type="submit" className="h-11 shrink-0" disabled={!customDhikr.trim()}>اعتماد</Button>
                </form>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">الهدف اليومي</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {[100, 300, 500, 1000].map((g) => (
                    <button key={g} type="button" onClick={() => saveGoal(g)} className={cn("min-h-10 px-3 rounded-full border text-sm arabic-digits", dailyGoal === g ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 border-transparent")}>{arabic(g)}</button>
                  ))}
                </div>
                <form className="flex gap-2 min-w-0" onSubmit={(e) => { e.preventDefault(); saveGoal(Number(goalInput)); }}>
                  <Input type="number" inputMode="numeric" min={1} value={goalInput} onChange={(e) => setGoalInput(e.target.value)} placeholder="عدد مخصص" className="h-11 min-w-0" />
                  <Button type="submit" variant="outline" className="h-11 shrink-0" disabled={!goalInput}>حفظ</Button>
                </form>
              </div>
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
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full arabic-digits">
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
                  <p className="text-sm font-bold leading-tight break-words">{d.text}</p>
                  <p className={cn("text-[10px] mt-1 arabic-digits", active ? "opacity-90" : "text-muted-foreground")}>
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
            <button type="button" aria-label="تعديل الهدف" onClick={() => setShowSettings(true)} className="w-11 h-11 -m-3 flex items-center justify-center"><Edit className="w-4 h-4 text-primary" /></button>
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
                <span dir="ltr" className="text-base font-bold text-primary arabic-digits">{arabic(goalProgress)}٪</span>
              </div>
            </div>
            <div className="flex-1 min-w-0 text-center">
              <p className={cn("font-bold arabic-digits break-all", String(stats.todayCount).length <= 5 ? "text-2xl" : "text-base")}>
                <span className="text-primary">{arabic(stats.todayCount)}</span>
                <span className="text-muted-foreground"> / {arabic(dailyGoal)}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">سبحة</p>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <Card className="mt-4 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">إحصائياتك</h3>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            {[
              { v: stats.todayCount, l: "اليوم" },
              { v: stats.weekCount, l: "آخر ٧ أيام" },
              { v: stats.totalCount, l: "الإجمالي" },
              { v: stats.streakDays, l: "أيام متتالية" },
            ].map((x) => (
              <div key={x.l} className="rounded-2xl bg-muted/40 py-3 px-2 min-w-0">
                <p className={cn("font-bold text-primary arabic-digits break-all", String(x.v || 0).length <= 6 ? "text-2xl" : "text-base")}>{arabic(x.v || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">{x.l}</p>
              </div>
            ))}
          </div>
          {stats.dhikrTypes.length > 0 && (
            <div className="mt-4 space-y-2">
              {stats.dhikrTypes.slice(0, 4).map((d) => (
                <div key={d.type} className="flex items-center justify-between text-sm">
                  <span className="truncate min-w-0">{d.type}</span>
                  <span className="text-primary font-bold arabic-digits shrink-0 break-all max-w-[50%]">{arabic(d.count)}</span>
                </div>
              ))}
            </div>
          )}
          {stats.lastSession && (
            <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1 min-w-0">
              <Clock className="w-3.5 h-3.5 shrink-0" /><span className="min-w-0 break-words [overflow-wrap:anywhere]">آخر جلسة: {arabic(stats.lastSession.count)} — {stats.lastSession.dhikr}</span>
            </p>
          )}
        </Card>

        <Button onClick={() => saveSession()} disabled={count === 0} className="w-full mt-5 h-14 text-base rounded-2xl gap-2 shadow-lg shadow-primary/30">
          <Plus className="w-5 h-5" />
          حفظ الجلسة وبدء جلسة جديدة
        </Button>
      </main>
    </div>
  );
};

export default TasbihPage;
