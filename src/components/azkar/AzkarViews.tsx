import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Bell, BellOff, Check, ChevronLeft, ChevronRight, Download, Pause, Play, RotateCcw, Search, Settings,
  Share2, Star, X, LayoutGrid, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { arabicDigits as ar } from "@/lib/displayFormat";
import { AZKAR_FILTERS, searchAzkar, sectionInFilter, sectionProgress, type AzkarFilter, type AzkarSection, type AzkarDhikr } from "@/lib/azkarRules";
import { sectionIcon } from "./sectionIcons";
import DhikrText from "./DhikrText";
import { toast } from "sonner";

const FAV_KEY = "azkar_favorite_sections";
const LAST_KEY = "azkar_last_position";

const readFavs = (): number[] => { try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; } };
const readLast = (): { id: number; index: number } | null => { try { return JSON.parse(localStorage.getItem(LAST_KEY) || "null"); } catch { return null; } };

function Bar({ pct, className, label }: { pct: number; className?: string; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className={cn("w-full bg-muted overflow-hidden rounded-full", className)}>
      <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

function Ring({ pct, size = 64, stroke = 6, children }: { pct: number; size?: number; stroke?: number; children?: React.ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--muted))" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--primary))" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${(Math.min(100, pct) / 100) * c} ${c}`} className="transition-all duration-300" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function SectionCard({ s, progress, fav, onOpen, onFav }: { s: AzkarSection; progress: Record<string, number>; fav: boolean; onOpen: () => void; onFav: () => void }) {
  const Icon = sectionIcon(s.category);
  const p = sectionProgress(s, progress);
  return (
    <Card className="relative p-3 rounded-2xl hover:shadow-md transition-shadow">
      <button onClick={onOpen} className="w-full text-right flex flex-col gap-2 min-h-[8.5rem]" aria-label={`فتح ${s.category}`}>
        <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-6 h-6" strokeWidth={2} aria-hidden="true" />
        </span>
        <span className="font-bold text-sm text-foreground leading-snug line-clamp-2">{s.category}</span>
        <span className="text-xs text-muted-foreground arabic-digits">{ar(s.array.length)} {s.array.length >= 3 && s.array.length <= 10 ? "أذكار" : "ذكر"}</span>
        <Bar pct={p.pct} className="h-1.5 mt-auto" label={`التقدم ${ar(p.pct)}٪`} />
      </button>
      <button onClick={onFav} aria-label={fav ? "إزالة من المفضلة" : "إضافة للمفضلة"} aria-pressed={fav}
        className="absolute top-1.5 left-1.5 w-11 h-11 flex items-center justify-center rounded-full text-muted-foreground hover:text-primary">
        <Star className={cn("w-5 h-5", fav && "fill-current text-primary")} />
      </button>
    </Card>
  );
}

interface HomeProps {
  sections: AzkarSection[]; progress: Record<string, number>; searchQuery: string; onSearch: (q: string) => void;
  onOpen: (s: AzkarSection, index?: number) => void; morningReminderEnabled: boolean; onToggleReminder: () => void; onDownloadAll: () => void;
}

export function AzkarHome({ sections, progress, searchQuery, onSearch, onOpen, morningReminderEnabled, onToggleReminder, onDownloadAll }: HomeProps) {
  const [filter, setFilter] = useState<AzkarFilter>("all");
  const [favs, setFavs] = useState<number[]>(readFavs);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogQuery, setCatalogQuery] = useState("");
  const last = readLast();
  const lastSection = sections.find((s) => s.id === last?.id) ?? sections[0];
  const lastIndex = last && lastSection.id === last.id ? Math.min(last.index, lastSection.array.length - 1) : 0;
  const lastPct = sectionProgress(lastSection, progress).pct;
  const results = useMemo(() => searchAzkar(sections, searchQuery), [sections, searchQuery]);
  const shown = sections.filter((s) => sectionInFilter(s, filter, favs));
  const grid = filter === "all" ? shown.slice(0, 12) : shown;
  const catalog = sections.filter((s) => !catalogQuery.trim() || searchAzkar([s], catalogQuery).length);

  const toggleFav = (id: number) => setFavs((prev) => {
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    localStorage.setItem(FAV_KEY, JSON.stringify(next));
    return next;
  });

  return (
    <div className="min-h-screen bg-background pb-28 arabic-ui" dir="rtl">
      <header className="bg-primary text-primary-foreground px-4 pt-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onToggleReminder} aria-label={morningReminderEnabled ? "إيقاف تذكير الصباح" : "تفعيل تذكير الصباح"}
              className="w-11 h-11 rounded-full bg-primary-foreground/15 flex items-center justify-center">
              {morningReminderEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold">الأذكار</h1>
              <p className="text-sm opacity-90 mt-1">ذكر الله يطمئن القلب</p>
            </div>
            <Link to="/notification-settings" aria-label="إعدادات التنبيهات" className="w-11 h-11 rounded-full bg-primary-foreground/15 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <Input value={searchQuery} onChange={(e) => onSearch(e.target.value)} placeholder="ابحث في الأذكار والأدعية..."
              aria-label="بحث في الأذكار" className="pr-10 pl-11 h-12 bg-card text-foreground rounded-2xl border-0 shadow-lg" />
            {searchQuery && (
              <button onClick={() => onSearch("")} aria-label="مسح البحث" className="absolute left-0 top-0 w-12 h-12 flex items-center justify-center text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-10 space-y-5">
        {searchQuery.trim() ? (
          <section aria-label="نتائج البحث" className="space-y-3">
            <p className="text-sm text-muted-foreground arabic-digits">{results.length ? `${ar(results.length)} قسم مطابق` : ""}</p>
            {results.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">لا توجد نتائج لـ «{searchQuery}»</Card>
            ) : results.map((g) => {
              const Icon = sectionIcon(g.section.category);
              return (
                <Card key={g.section.id} className="p-3 rounded-2xl">
                  <button onClick={() => onOpen(g.section)} className="w-full flex items-center gap-3 text-right min-h-11">
                    <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Icon className="w-5 h-5" /></span>
                    <span className="flex-1 font-bold text-foreground">{g.section.category}</span>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                  </button>
                  {g.matches.map((m) => (
                    <button key={m.index} onClick={() => onOpen(g.section, m.index)}
                      className="w-full text-right text-sm text-muted-foreground line-clamp-2 py-2 px-2 mt-1 rounded-lg hover:bg-muted/60 font-quran leading-loose">
                      {m.text}
                    </button>
                  ))}
                </Card>
              );
            })}
          </section>
        ) : (
          <>
            <Card className="p-4 rounded-2xl shadow-lg flex items-center gap-4">
              <Ring pct={lastPct} size={72}>
                <span dir="ltr" className="text-sm font-bold text-primary arabic-digits">{ar(lastPct)}٪</span>
                <span className="text-[10px] text-muted-foreground">اليوم</span>
              </Ring>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">كمّل من حيث وقفت</p>
                <h2 className="font-bold text-foreground truncate">{lastSection.category}</h2>
                <p className="text-xs text-muted-foreground arabic-digits">الذكر {ar(lastIndex + 1)} من {ar(lastSection.array.length)}</p>
              </div>
              <Button className="rounded-full gap-1 min-h-11" onClick={() => onOpen(lastSection, lastIndex)}>
                متابعة <ChevronLeft className="w-4 h-4" />
              </Button>
            </Card>

            <div role="tablist" aria-label="تصفية الأقسام" className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scrollbar-hide">
              {AZKAR_FILTERS.map((f) => (
                <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
                  className={cn("shrink-0 h-11 px-4 rounded-full text-sm font-medium border whitespace-nowrap transition-colors flex items-center gap-1.5",
                    filter === f.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground")}>
                  {f.id === "fav" && <Star className="w-4 h-4" aria-hidden="true" />}
                  {f.label}
                </button>
              ))}
            </div>

            {grid.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                {filter === "fav" ? "لم تضف أقسامًا للمفضلة بعد. اضغط النجمة على أي قسم لإضافته." : "لا توجد أقسام هنا"}
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {grid.map((s) => (
                  <SectionCard key={s.id} s={s} progress={progress} fav={favs.includes(s.id)} onOpen={() => onOpen(s)} onFav={() => toggleFav(s.id)} />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 rounded-2xl gap-2" onClick={() => setCatalogOpen(true)}>
                <LayoutGrid className="w-5 h-5" /> <span className="arabic-digits">كل الأقسام ({ar(sections.length)})</span>
              </Button>
              <Button variant="outline" className="h-12 rounded-2xl gap-2" onClick={onDownloadAll}>
                <Download className="w-5 h-5" /> تنزيل للاستماع دون إنترنت
              </Button>
            </div>
          </>
        )}
      </main>

      <Sheet open={catalogOpen} onOpenChange={setCatalogOpen}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl flex flex-col arabic-ui" dir="rtl">
          <SheetHeader><SheetTitle className="text-right arabic-digits pr-10">كل الأقسام ({ar(sections.length)})</SheetTitle></SheetHeader>
          <div className="relative mt-2">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={catalogQuery} onChange={(e) => setCatalogQuery(e.target.value)} placeholder="ابحث عن قسم..." className="pr-9 h-11 rounded-xl" aria-label="بحث في الأقسام" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 arabic-digits">يظهر {ar(catalog.length)} من {ar(sections.length)} قسم</p>
          <div className="flex-1 overflow-y-auto mt-2 -mx-2">
            {catalog.map((s) => {
              const Icon = sectionIcon(s.category);
              const p = sectionProgress(s, progress);
              return (
                <button key={s.id} onClick={() => { setCatalogOpen(false); onOpen(s); }}
                  className="w-full flex items-center gap-3 px-2 py-2.5 min-h-12 rounded-xl hover:bg-muted/60 text-right">
                  <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>
                  <span className="flex-1 text-sm font-medium text-foreground">{s.category}</span>
                  {p.pct === 100 ? <Check className="w-4 h-4 text-primary" /> : <span className="text-xs text-muted-foreground arabic-digits">{ar(s.array.length)}</span>}
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface ReaderProps {
  section: AzkarSection; index: number; progress: Record<string, number>; isPlaying: boolean;
  onBack: () => void; onIndex: (i: number) => void; onCount: (d: AzkarDhikr) => void; onToggleAudio: (d: AzkarDhikr) => void;
  onReset: () => void; nextSection?: AzkarSection; onOpenSection: (s: AzkarSection) => void;
}

export function AzkarReader({ section, index, progress, isPlaying, onBack, onIndex, onCount, onToggleAudio, onReset, nextSection, onOpenSection }: ReaderProps) {
  const dhikr = section.array[index];
  const count = progress[`${section.id}_${dhikr.id}`] || 0;
  const remaining = Math.max(0, dhikr.count - count);
  const sp = sectionProgress(section, progress);
  const total = section.array.length;
  const touch = useRef<number | null>(null);
  const finished = sp.pct === 100;
  const [celebrate, setCelebrate] = useState(false);
  const wasFinished = useRef(finished);

  useEffect(() => { localStorage.setItem(LAST_KEY, JSON.stringify({ id: section.id, index })); }, [section.id, index]);
  useEffect(() => {
    if (finished && !wasFinished.current) setCelebrate(true);
    wasFinished.current = finished;
  }, [finished]);

  const tap = () => {
    if (remaining === 0) { if (index < total - 1) onIndex(index + 1); return; }
    onCount(dhikr);
    if (remaining === 1 && index < total - 1) setTimeout(() => onIndex(index + 1), 450);
  };
  const share = async () => {
    const text = `${dhikr.text}\n\n— نور الفرقان`;
    if (navigator.share) { try { await navigator.share({ title: section.category, text }); } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(text); toast.success("تم نسخ الذكر"); }
  };

  if (celebrate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 arabic-ui" dir="rtl">
        <Card className="p-8 rounded-3xl text-center max-w-sm w-full space-y-4">
          <span className="w-16 h-16 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center"><PartyPopper className="w-8 h-8" /></span>
          <h2 className="text-2xl font-bold text-foreground">تقبّل الله منك</h2>
          <p className="text-muted-foreground">أتممت «{section.category}»</p>
          {nextSection && (
            <Button className="w-full h-12 rounded-2xl gap-1" onClick={() => { setCelebrate(false); onOpenSection(nextSection); }}>
              القسم التالي: {nextSection.category} <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" className="w-full h-12 rounded-2xl" onClick={onBack}>العودة للأقسام</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-40 arabic-ui" dir="rtl"
      onTouchStart={(e) => { touch.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
        if (Math.abs(dx) < 60) return;
        if (dx > 0 && index < total - 1) onIndex(index + 1); // RTL: swipe right = next
        if (dx < 0 && index > 0) onIndex(index - 1);
      }}>
      <header className="sticky top-0 z-20 bg-background/95 border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center gap-2">
          <button onClick={onBack} aria-label="رجوع" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted"><ArrowRight className="w-5 h-5" /></button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-foreground truncate">{section.category}</h1>
            <p className="text-xs text-muted-foreground arabic-digits">الذكر {ar(index + 1)} من {ar(total)} · <span dir="ltr" className="inline-block">{ar(sp.pct)}٪</span> من القسم</p>
          </div>
          <button onClick={onReset} aria-label="إعادة تعيين تقدم القسم" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"><RotateCcw className="w-5 h-5" /></button>
        </div>
        <Bar pct={sp.pct} className="h-1 rounded-none" label="تقدم القسم" />
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">
        <Card role="button" tabIndex={0} onClick={tap} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(); } }}
          aria-label="اضغط على البطاقة للعد"
          className={cn("p-6 rounded-3xl cursor-pointer select-none active:scale-[0.99] transition-transform", remaining === 0 && "ring-2 ring-primary")}>
          <DhikrText text={dhikr.text} />
        </Card>

        <div className="grid grid-cols-[minmax(0,1fr)_112px_minmax(0,1fr)] items-center gap-2 sm:gap-5 mx-1 sm:mx-4">
          <Button variant="outline" onClick={share} className="h-12 w-full min-w-0 rounded-full gap-1.5 px-2 sm:px-4"><Share2 className="w-4 h-4 shrink-0" /> مشاركة</Button>
          <button onClick={tap} aria-label={remaining ? `عدّ، المتبقي ${remaining}` : "تم"} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Ring pct={(count / dhikr.count) * 100} size={112} stroke={8}>
              <span className={cn("w-[88px] h-[88px] rounded-full flex flex-col items-center justify-center", remaining ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
                {remaining ? (<><span className="text-3xl font-bold arabic-digits leading-none">{ar(remaining)}</span><span className="text-xs mt-1">متبقي</span></>)
                  : <Check className="w-9 h-9" />}
              </span>
            </Ring>
          </button>
          {dhikr.audio ? <Button variant="outline" onClick={() => onToggleAudio(dhikr)} className="h-12 w-full min-w-0 rounded-full gap-1.5 px-2 sm:px-4">
            {isPlaying ? <Pause className="w-4 h-4 shrink-0" /> : <Play className="w-4 h-4 shrink-0" />} {isPlaying ? "إيقاف" : "استماع"}
          </Button> : <span aria-hidden="true" />}
        </div>
        <p className="text-center text-xs text-muted-foreground arabic-digits">التكرار {ar(count)} من {ar(dhikr.count)} · اضغط البطاقة أو الدائرة للعد</p>
      </main>

      <nav className="fixed inset-x-0 bottom-16 md:bottom-0 z-30 bg-background/95 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 py-2 grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 rounded-2xl gap-1" disabled={index === 0} onClick={() => onIndex(index - 1)}>
            <ChevronRight className="w-5 h-5" /> السابق
          </Button>
          <Button className="h-12 rounded-2xl gap-1" disabled={index >= total - 1} onClick={() => onIndex(index + 1)}>
            التالي <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
