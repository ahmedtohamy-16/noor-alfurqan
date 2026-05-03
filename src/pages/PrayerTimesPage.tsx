import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  MapPin,
  Download,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Calendar,
  FileText,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import LocationPickerModal from "@/components/LocationPickerModal";
import PrayerExportDialog from "@/components/PrayerExportDialog";
import mosqueBg from "@/assets/mosque-night-hero.jpg";
import { cn } from "@/lib/utils";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const prayers = [
  { key: "Fajr", name: "الفجر", icon: Moon, period: "ص" },
  { key: "Sunrise", name: "الشروق", icon: Sunrise, period: "ص" },
  { key: "Dhuhr", name: "الظهر", icon: Sun, period: "م" },
  { key: "Asr", name: "العصر", icon: CloudSun, period: "م" },
  { key: "Maghrib", name: "المغرب", icon: Sunset, period: "م" },
  { key: "Isha", name: "العشاء", icon: Moon, period: "م" },
];

const fetchPrayerTimes = async (lat: number, lng: number, method: number, madhab: number): Promise<PrayerTimesData> => {
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const r = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${madhab}`);
  const d = await r.json();
  return d.data.timings;
};

const PrayerTimesPage = () => {
  const navigate = useNavigate();
  const { settings } = useUserSettings();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; key: string } | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");

  const lat = settings.latitude || 21.4225;
  const lng = settings.longitude || 39.8262;
  const method = settings.prayer_method || 4;
  const madhab = settings.prayer_madhab || 0;
  const hasLocation = settings.latitude && settings.longitude;

  const { data: prayerTimes } = useQuery({
    queryKey: ["prayerTimes", lat, lng, method, madhab],
    queryFn: () => fetchPrayerTimes(lat, lng, method, madhab),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    fetch(`https://api.aladhan.com/v1/gToH?date=${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}`)
      .then((r) => r.json())
      .then((d) => {
        const h = d.data.hijri;
        setHijriDate(`${h.weekday.ar}، ${h.day} ${h.month.ar} ${h.year}هـ`);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!prayerTimes) return;
    const update = () => {
      const now = new Date();
      let found = false;
      for (const p of prayers) {
        if (p.key === "Sunrise") continue;
        const [h, m] = (prayerTimes[p.key as keyof PrayerTimesData] as string).split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        if (d > now) {
          setNextPrayer({ name: p.name, time: prayerTimes[p.key as keyof PrayerTimesData] as string, key: p.key });
          found = true;
          break;
        }
      }
      if (!found) setNextPrayer({ name: "الفجر", time: prayerTimes.Fajr, key: "Fajr" });
    };
    update();
    const i = setInterval(update, 60000);
    return () => clearInterval(i);
  }, [prayerTimes]);

  useEffect(() => {
    if (!nextPrayer) return;
    const tick = () => {
      const now = new Date();
      const [h, m] = nextPrayer.time.split(":").map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      if (d < now) d.setDate(d.getDate() + 1);
      const diff = d.getTime() - now.getTime();
      setCountdown({
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [nextPrayer]);

  useEffect(() => {
    if (!hasLocation) setIsLocationModalOpen(true);
  }, [hasLocation]);

  const fmt = (n: number) => n.toString().padStart(2, "0");
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const today = new Date();
  const formatTime = (t?: string) => (t ? t.split(" ")[0] : "--:--");

  return (
    <div className="min-h-screen bg-background pb-28 arabic-ui" dir="rtl">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mosqueBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/85 to-primary" />
        <div className="relative px-4 pt-6 pb-32">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold">مواقيت الصلاة</h1>
              <button onClick={() => setIsLocationModalOpen(true)} className="flex items-center gap-1 mx-auto mt-1 text-sm opacity-90">
                <MapPin className="w-3.5 h-3.5" />
                {settings.city_name || "تحديد الموقع"}
              </button>
              <p className="text-xs opacity-75 mt-0.5">التوقيت: GMT{new Date().getTimezoneOffset() <= 0 ? "+" : "-"}{Math.abs(new Date().getTimezoneOffset() / 60)}</p>
            </div>
            <button onClick={() => setIsLocationModalOpen(true)} className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-24 relative z-10">
        {/* Countdown card */}
        <Card className="rounded-2xl border-0 shadow-2xl bg-gradient-to-br from-primary to-[hsl(216,80%,30%)] text-white p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <p className="text-xs opacity-80 mb-2">الصلاة القادمة</p>
              <h2 className="text-3xl font-bold mb-1">{nextPrayer?.name || "—"}</h2>
              <p className="text-xs opacity-75">إن شاء الله</p>
            </div>
            <div className="w-px h-20 bg-white/20" />
            <div className="text-center flex-1">
              <p className="text-xs opacity-80 mb-2">الوقت المتبقي</p>
              <p className="text-3xl font-bold tabular-nums tracking-wider" dir="ltr">
                {fmt(countdown.hours)}:{fmt(countdown.minutes)}:{fmt(countdown.seconds)}
              </p>
              <div className="flex justify-center gap-4 text-[10px] opacity-75 mt-1" dir="ltr">
                <span>ساعة</span>
                <span>دقيقة</span>
                <span>ثانية</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Today times */}
        <Card className="rounded-2xl mt-5 p-5 border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">مواقيت اليوم</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary" />
              <div className="text-right">
                {hijriDate && <p>{hijriDate}</p>}
                <p>الموافق {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()} م</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {prayers.map((p) => {
              const Icon = p.icon;
              const isNext = nextPrayer?.key === p.key;
              const t = prayerTimes?.[p.key as keyof PrayerTimesData];
              return (
                <div
                  key={p.key}
                  className={cn(
                    "rounded-xl py-3 px-1 text-center transition-all",
                    isNext ? "bg-primary text-primary-foreground shadow-md" : "bg-muted/40"
                  )}
                >
                  <Icon className={cn("w-5 h-5 mx-auto mb-1.5", isNext ? "text-white" : "text-primary")} />
                  <p className={cn("text-xs font-bold mb-1", isNext ? "text-white" : "text-foreground")}>{p.name}</p>
                  <p className={cn("text-sm font-mono tabular-nums", isNext ? "text-white" : "text-foreground")}>{formatTime(t)}</p>
                  <p className={cn("text-[10px]", isNext ? "text-white/80" : "text-muted-foreground")}>{p.period}</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Download monthly */}
        <Card className="rounded-2xl mt-4 p-5 border">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">تنزيل مواقيت الصلاة</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                حمّل جدول مواقيت الصلاة لشهر {monthNames[today.getMonth()]} {today.getFullYear()}م لمدينة {settings.city_name || "—"}
              </p>
            </div>
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-primary" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mb-4 text-xs">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-muted">
              <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <p className="font-bold text-sm">{monthNames[today.getMonth()]} {today.getFullYear()}م</p>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-muted">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />متوافق مع منطقتك</span>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />يشمل ٦ صلوات يومياً</span>
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" />صيغة PDF جاهزة للطباعة</span>
          </div>

          <Button onClick={() => setIsExportDialogOpen(true)} className="w-full h-12 rounded-xl gap-2 text-base">
            <Download className="w-5 h-5" />
            تنزيل جدول الشهر (PDF)
          </Button>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4 px-2">
          تتغير المواقيت تلقائياً حسب موقعك الجغرافي • آخر تحديث: {new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </main>

      <LocationPickerModal open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen} />
      <PrayerExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        currentMonth={today.getMonth() + 1}
        currentYear={today.getFullYear()}
        defaultLat={lat}
        defaultLng={lng}
        defaultCityName={settings.city_name || undefined}
        method={method}
        madhab={madhab}
      />
    </div>
  );
};

export default PrayerTimesPage;
