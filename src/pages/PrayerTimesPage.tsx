import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
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
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import LocationPickerModal from "@/components/LocationPickerModal";
import PrayerExportDialog from "@/components/PrayerExportDialog";
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

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

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
  const today = new Date();
  const formatTime = (t?: string) => (t ? t.split(" ")[0] : "--:--");
  const tzOffset = -new Date().getTimezoneOffset() / 60;
  const tzLabel = `GMT${tzOffset >= 0 ? "+" : ""}${tzOffset}`;

  return (
    <div
      className="min-h-screen bg-[#050B18] text-white pb-28 arabic-ui"
      dir="rtl"
      style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[420px] px-4 pt-5 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
            aria-label="إعدادات الموقع"
          >
            <Settings className="w-5 h-5 opacity-70" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">مواقيت الصلاة</h1>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center justify-center gap-1 mt-1 opacity-60 text-xs hover:opacity-100 transition"
            >
              <MapPin className="w-3 h-3" />
              <span>{settings.city_name || "تحديد الموقع"}</span>
              <span className="mx-1 text-[10px] opacity-60">|</span>
              <span dir="ltr">{tzLabel}</span>
            </button>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition"
            aria-label="رجوع"
          >
            <ChevronRight className="w-5 h-5 opacity-70" />
          </button>
        </div>

        {/* Hero countdown */}
        <div className="relative px-4 py-8 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1A5CBF] via-[#12418B] to-[#0A2451] shadow-xl shadow-blue-950/40">
          <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 100" className="w-full" preserveAspectRatio="none">
              <path
                fill="white"
                d="M0,100 L400,100 L400,80 L380,60 L360,80 L340,40 L320,80 L300,50 L280,80 L260,20 L240,80 L220,60 L200,80 L180,40 L160,80 L140,60 L120,80 L100,50 L80,80 L60,40 L40,80 L20,60 L0,80 Z"
              />
            </svg>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center">
            <div className="w-1/2 border-l border-white/10 text-center">
              <p className="text-blue-100/60 text-xs mb-1">الوقت المتبقي</p>
              <div className="text-3xl font-bold tabular-nums tracking-wider" dir="ltr">
                {fmt(countdown.hours)}:{fmt(countdown.minutes)}:{fmt(countdown.seconds)}
              </div>
              <div className="flex justify-center gap-4 mt-1 text-[10px] text-blue-100/50" dir="ltr">
                <span>ساعة</span>
                <span>دقيقة</span>
                <span>ثانية</span>
              </div>
            </div>
            <div className="w-1/2 text-center">
              <p className="text-blue-100/60 text-xs mb-1">الصلاة القادمة</p>
              <div className="text-3xl font-bold">{nextPrayer?.name || "—"}</div>
              <div className="text-lg opacity-80 mt-1 font-mono">{nextPrayer ? formatTime(nextPrayer.time) : "—"}</div>
            </div>
          </div>
        </div>

        {/* Today's times */}
        <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-bold text-base">مواقيت اليوم</h2>
                <p className="text-[10px] opacity-50">{hijriDate || "—"}</p>
              </div>
            </div>
            <span className="text-[10px] opacity-50 tracking-wide">
              {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {prayers.map((p) => {
              const Icon = p.icon;
              const isNext = nextPrayer?.key === p.key;
              const t = prayerTimes?.[p.key as keyof PrayerTimesData];
              return (
                <div
                  key={p.key}
                  className={cn(
                    "rounded-2xl p-3 flex flex-col items-center gap-1 transition-all",
                    isNext
                      ? "bg-blue-600 shadow-lg shadow-blue-900/40 ring-2 ring-blue-400/30"
                      : "bg-white/5 border border-white/5"
                  )}
                >
                  <Icon className={cn("w-5 h-5 mb-1", isNext ? "text-white" : "opacity-60")} />
                  <span className={cn("text-xs font-medium", isNext ? "text-white" : "opacity-70")}>{p.name}</span>
                  <span className={cn("text-sm font-bold font-mono", isNext ? "text-white" : "opacity-80")}>
                    {formatTime(t)}
                  </span>
                  <span className={cn("text-[9px]", isNext ? "text-white/70" : "opacity-40")}>{p.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly download card */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex flex-col gap-5">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1A3B6B] flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">تنزيل مواقيت الصلاة</h3>
              <p className="text-xs opacity-50 mt-1 leading-relaxed">
                حمّل جدول مواقيت الصلاة لشهر {monthNames[today.getMonth()]} {today.getFullYear()}م لمدينة{" "}
                {settings.city_name || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors" aria-label="الشهر السابق">
              <ChevronRight className="w-5 h-5 opacity-50" />
            </button>
            <span className="font-bold text-base">
              {monthNames[today.getMonth()]} {today.getFullYear()}م
            </span>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors" aria-label="الشهر التالي">
              <ChevronLeft className="w-5 h-5 opacity-50" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] opacity-60 px-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>متوافق مع منطقتك</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>صيغة PDF جاهزة</span>
            </div>
          </div>

          <Button
            onClick={() => setIsExportDialogOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-900/40 text-base h-auto"
          >
            <Download className="w-5 h-5" />
            تنزيل جدول الشهر (PDF)
          </Button>
        </div>

        <p className="text-center text-[10px] opacity-40 px-2">
          آخر تحديث: {new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

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
