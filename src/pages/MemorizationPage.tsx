import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, BookOpenCheck, EyeOff, Eye, RotateCcw, Sparkles,
  ChevronRight, ChevronLeft, Crown, Check, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { surahs } from "@/data/surahs";
import { getAyahsBySurahAsync, type QuranAyah } from "@/data/quranAyats";
import { useMemorization, type MemoStatus } from "@/hooks/useMemorization";
import { usePro } from "@/hooks/usePro";
import { toast } from "sonner";

const PRO_COLOR = "#0074fc";

const statusColor: Record<MemoStatus, string> = {
  new: "bg-muted text-muted-foreground",
  learning: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  review: "bg-rose-500/20 text-rose-700 dark:text-rose-300",
  memorized: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
};
const statusLabel: Record<MemoStatus, string> = {
  new: "جديدة", learning: "قيد الحفظ", review: "تحتاج مراجعة", memorized: "محفوظة",
};

/** Hide last N words of an ayah, replacing with overlined blanks */
const hideWords = (text: string, n: number) => {
  if (n <= 0) return text;
  const words = text.trim().split(/\s+/);
  if (n >= words.length) return "ـــ ".repeat(words.length).trim();
  const visible = words.slice(0, words.length - n).join(" ");
  const hidden = Array(n).fill("ـــــ").join(" ");
  return `${visible} ${hidden}`;
};

const MemorizationPage = () => {
  const navigate = useNavigate();
  const { isPro, isLoading: proLoading } = usePro();
  const { records, grade, reset, dueToday, memorizedCount, getStatus } = useMemorization();

  const [surahNum, setSurahNum] = useState<number>(1);
  const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
  const [loadingAyahs, setLoadingAyahs] = useState(false);
  const [hideCount, setHideCount] = useState(0);
  const [mode, setMode] = useState<"study" | "test" | "due">("study");
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (proLoading) return;
    if (!isPro) {
      toast.info("هذه الميزة من مزايا Pro");
      navigate("/pro");
    }
  }, [isPro, proLoading, navigate]);

  useEffect(() => {
    let alive = true;
    setLoadingAyahs(true);
    getAyahsBySurahAsync(surahNum).then((data) => {
      if (alive) {
        setAyahs(data);
        setLoadingAyahs(false);
        setRevealed({});
      }
    });
    return () => { alive = false; };
  }, [surahNum]);

  const dueAyahs = useMemo(() => {
    if (mode !== "due") return [];
    const list = Object.values(records)
      .filter((r) => r.nextReview <= Date.now() && r.status !== "memorized")
      .slice(0, 30);
    return list;
  }, [mode, records]);

  const surahMeta = surahs.find((s) => s.number === surahNum);

  if (proLoading || !isPro) return null;

  const renderAyah = (a: QuranAyah) => {
    const key = `${a.sura_id}_${a.ayat_number_in_sura}`;
    const isRevealed = revealed[key];
    const status = getStatus(a.sura_id, a.ayat_number_in_sura);
    const displayText =
      mode === "test"
        ? isRevealed ? a.text_uthmani : a.text_uthmani.split(/\s+/).slice(0, 2).join(" ") + " ..."
        : isRevealed ? a.text_uthmani : hideWords(a.text_uthmani, hideCount);

    return (
      <Card key={key} className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <Badge className={statusColor[status]}>{statusLabel[status]}</Badge>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>آية {a.ayat_number_in_sura}</span>
          </div>
        </div>

        <p
          className="text-right leading-loose text-2xl font-amiri select-none"
          style={{ fontFamily: 'Amiri, "Scheherazade New", serif' }}
        >
          {displayText}
        </p>

        <div className="flex flex-wrap gap-2 justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
          >
            {isRevealed ? <EyeOff className="w-4 h-4 ml-1" /> : <Eye className="w-4 h-4 ml-1" />}
            {isRevealed ? "إخفاء" : "إظهار"}
          </Button>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="destructive"
              onClick={() => grade(a.sura_id, a.ayat_number_in_sura, "again")}>
              <AlertTriangle className="w-3 h-3 ml-1" /> أعد
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => grade(a.sura_id, a.ayat_number_in_sura, "hard")}>
              صعبة
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => grade(a.sura_id, a.ayat_number_in_sura, "good")}>
              جيدة
            </Button>
            <Button
              size="sm"
              className="text-white"
              style={{ background: PRO_COLOR }}
              onClick={() => grade(a.sura_id, a.ayat_number_in_sura, "easy")}
            >
              <Check className="w-3 h-3 ml-1" /> سهلة
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="font-bold text-lg flex items-center gap-2">
            <BookOpenCheck className="w-5 h-5" style={{ color: PRO_COLOR }} />
            وضع الحافظ
            <Sparkles className="w-3 h-3" style={{ color: PRO_COLOR }} />
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-4 arabic-ui">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <div className="text-xs text-muted-foreground">محفوظة</div>
            <div className="text-2xl font-bold" style={{ color: PRO_COLOR }}>{memorizedCount}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xs text-muted-foreground">مستحقة اليوم</div>
            <div className="text-2xl font-bold">{dueToday.length}</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-xs text-muted-foreground">قيد الحفظ</div>
            <div className="text-2xl font-bold">
              {Object.values(records).filter((r) => r.status === "learning").length}
            </div>
          </Card>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="study">دراسة</TabsTrigger>
            <TabsTrigger value="test">اختبار</TabsTrigger>
            <TabsTrigger value="due">المراجعة ({dueToday.length})</TabsTrigger>
          </TabsList>

          {(mode === "study" || mode === "test") && (
            <Card className="p-3 mt-3 space-y-3">
              <div className="flex items-center gap-2">
                <Select value={String(surahNum)} onValueChange={(v) => setSurahNum(Number(v))}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {surahs.map((s) => (
                      <SelectItem key={s.number} value={String(s.number)}>
                        {s.number}. {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon"
                  onClick={() => setSurahNum((n) => Math.max(1, n - 1))}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon"
                  onClick={() => setSurahNum((n) => Math.min(114, n + 1))}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              {mode === "study" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">إخفاء آخر كلمات</span>
                    <span className="font-bold">{hideCount}</span>
                  </div>
                  <Slider
                    value={[hideCount]}
                    onValueChange={(v) => setHideCount(v[0])}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground text-center">
                {surahMeta?.name} — {ayahs.length} آية
              </div>
            </Card>
          )}
        </Tabs>

        {/* Ayah list */}
        <div className="space-y-3">
          {mode === "due" ? (
            dueAyahs.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                لا توجد آيات تحتاج مراجعة الآن — أحسنت! 🌿
              </Card>
            ) : (
              dueAyahs.map((r) => {
                const a = ayahs.find(
                  (x) => x.sura_id === r.surah && x.ayat_number_in_sura === r.ayah
                );
                if (!a) return (
                  <Card key={r.id} className="p-4 flex items-center justify-between">
                    <span className="text-sm">سورة {r.surah} - آية {r.ayah}</span>
                    <Button size="sm" variant="outline" onClick={() => { setSurahNum(r.surah); setMode("study"); }}>
                      افتح
                    </Button>
                  </Card>
                );
                return renderAyah(a);
              })
            )
          ) : loadingAyahs ? (
            <Card className="p-8 text-center text-muted-foreground">جارٍ التحميل…</Card>
          ) : (
            ayahs.map(renderAyah)
          )}
        </div>
      </main>
    </div>
  );
};

export default MemorizationPage;
