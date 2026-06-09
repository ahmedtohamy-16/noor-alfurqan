import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Download,
  ChevronRight,
  Settings,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudSun,
  Calendar,
  FileText,
  Bell,
  BellOff,
  Navigation,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useTheme } from "@/hooks/useTheme";
import { useAdhanAudio, adhanSounds, type AdhanSoundId } from "@/hooks/useAdhanAudio";
import LocationPickerModal from "@/components/LocationPickerModal";
import PrayerExportDialog from "@/components/PrayerExportDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

const fetchPrayerTimes = async (lat: number, lng: number, method: number, madhab: number): Promise<PrayerTimesData> => {
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const r = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${madhab}`);
  const d = await r.json();
  return d.data.timings;
};

const PrayerTimesPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, autoDetectLocation } = useUserSettings();
  const { theme } = useTheme();
  const { playAdhan, previewAdhan, getAdhanUrl, stopAdhan } = useAdhanAudio();
  const isDark = theme === "dark";

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
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

  // In-app adhan + reminder scheduler
  useEffect(() => {
    if (!prayerTimes) return;
    const enabledMap: Record<string, boolean> = {
      Fajr: settings.prayer_fajr_enabled,
      Dhuhr: settings.prayer_dhuhr_enabled,
      Asr: settings.prayer_asr_enabled,
      Maghrib: settings.prayer_maghrib_enabled,
      Isha: settings.prayer_isha_enabled,
    };
    const timers: number[] = [];
    const reminderMin = settings.prayer_reminder_minutes || 0;
    prayers.forEach((p) => {
      if (p.key === "Sunrise" || !enabledMap[p.key]) return;
      const [h, m] = (prayerTimes[p.key as keyof PrayerTimesData] as string).split(":").map(Number);
      const t = new Date();
      t.setHours(h, m, 0, 0);
      const now = Date.now();
      if (reminderMin > 0) {
        const rem = t.getTime() - reminderMin * 60000;
        if (rem > now) {
          timers.push(window.setTimeout(() => {
            toast.info(`⏰ تذكير: صلاة ${p.name} بعد ${reminderMin} دقيقة`, { duration: 8000 });
          }, rem - now));
        }
      }
      if (t.getTime() > now) {
        timers.push(window.setTimeout(() => {
          toast.success(`🕌 حان الآن وقت صلاة ${p.name}`, { duration: 10000 });
          if (settings.notifications_enabled) {
            playAdhan(getAdhanUrl(settings.adhan_sound as AdhanSoundId, p.key === "Fajr"), p.name);
          }
        }, t.getTime() - now));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [prayerTimes, settings.prayer_reminder_minutes, settings.adhan_sound, settings.notifications_enabled,
      settings.prayer_fajr_enabled, settings.prayer_dhuhr_enabled, settings.prayer_asr_enabled,
      settings.prayer_maghrib_enabled, settings.prayer_isha_enabled, playAdhan, getAdhanUrl]);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    await autoDetectLocation();
    setIsDetecting(false);
  };

  const fmt = (n: number) => n.toString().padStart(2, "0");
  const today = new Date();
  const formatTime = (t?: string) => (t ? t.split(" ")[0] : "--:--");
  const tzOffset = -new Date().getTimezoneOffset() / 60;
  const tzLabel = `GMT${tzOffset >= 0 ? "+" : ""}${tzOffset}`;

  // theme palette
  const palette = useMemo(() => isDark ? {
    page: "bg-[#050B18] text-white",
    chip: "bg-white/5 border-white/10 hover:bg-white/10",
    card: "bg-white/5 border-white/5",
    subText: "text-white/60",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-400",
    heroGrad: "from-[#1A5CBF] via-[#12418B] to-[#0A2451]",
    activePrayer: "bg-blue-600 shadow-lg shadow-blue-900/40 ring-2 ring-blue-400/30 text-white",
    inactivePrayer: "bg-white/5 border border-white/5",
    btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40",
  } : {
    page: "bg-gradient-to-b from-sky-50 via-white to-sky-50 text-slate-900",
    chip: "bg-white/70 border-slate-200 hover:bg-white shadow-sm backdrop-blur",
    card: "bg-white/70 border-white shadow-sm backdrop-blur",
    subText: "text-slate-500",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    heroGrad: "from-sky-400 via-blue-500 to-indigo-600",
    activePrayer: "bg-blue-600 shadow-lg shadow-blue-300/50 ring-2 ring-blue-300 text-white",
    inactivePrayer: "bg-white/80 border border-slate-100 text-slate-700",
    btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-300/50",
  }, [isDark]);

  return (
    <div
      className={cn("min-h-screen pb-28 arabic-ui transition-colors", palette.page)}
      dir="rtl"
      style={{ fontFamily: "'Tajawal','Cairo',sans-serif" }}
    >
      <div className="mx-auto w-full max-w-[420px] px-4 pt-5 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className={cn(
              "flex items-center gap-2 rounded-full border transition px-3 h-10 max-w-[60%]",
              palette.chip,
              hasLocation && "border-blue-500/30"
            )}
            aria-label="تغيير الموقع"
          >
            <span className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
              hasLocation ? "bg-blue-600 text-white" : "bg-amber-500/20 text-amber-500"
            )}>
              <MapPin className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-bold truncate">
              {hasLocation ? settings.city_name : "حدد موقعك"}
            </span>
          </button>
          <h1 className="text-base font-bold tracking-tight">مواقيت الصلاة</h1>
          <button
            onClick={() => navigate(-1)}
            className={cn("w-10 h-10 flex items-center justify-center rounded-full border transition shrink-0", palette.chip)}
            aria-label="رجوع"
          >
            <ChevronRight className="w-5 h-5 opacity-70" />
          </button>
        </div>


        {/* Hero countdown */}
        <div className={cn("relative px-4 py-8 rounded-3xl overflow-hidden bg-gradient-to-br shadow-xl", palette.heroGrad,
          isDark ? "shadow-blue-950/40" : "shadow-blue-300/40")}>
          <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none">
            <svg viewBox="0 0 400 100" className="w-full" preserveAspectRatio="none">
              <path fill="white" d="M0,100 L400,100 L400,80 L380,60 L360,80 L340,40 L320,80 L300,50 L280,80 L260,20 L240,80 L220,60 L200,80 L180,40 L160,80 L140,60 L120,80 L100,50 L80,80 L60,40 L40,80 L20,60 L0,80 Z" />
            </svg>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center text-white">
            <div className="w-1/2 border-l border-white/20 text-center">
              <p className="text-white/70 text-xs mb-1">الوقت المتبقي</p>
              <div className="text-3xl font-bold tabular-nums tracking-wider" dir="ltr">
                {fmt(countdown.hours)}:{fmt(countdown.minutes)}:{fmt(countdown.seconds)}
              </div>
              <div className="flex justify-center gap-4 mt-1 text-[10px] text-white/60" dir="ltr">
                <span>ساعة</span><span>دقيقة</span><span>ثانية</span>
              </div>
            </div>
            <div className="w-1/2 text-center">
              <p className="text-white/70 text-xs mb-1">الصلاة القادمة</p>
              <div className="text-3xl font-bold">{nextPrayer?.name || "—"}</div>
              <div className="text-lg opacity-90 mt-1 font-mono">{nextPrayer ? formatTime(nextPrayer.time) : "—"}</div>
            </div>
          </div>
        </div>

        {/* Location card */}
        <div className={cn("rounded-3xl p-4 border", palette.card)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", palette.iconBg)}>
                <MapPin className={cn("w-5 h-5", palette.iconColor)} />
              </div>
              <div>
                <h2 className="font-bold text-base">الموقع</h2>
                <p className={cn("text-[11px]", palette.subText)}>{settings.city_name || "لم يتم التحديد"}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleAutoDetect} disabled={isDetecting} variant="outline"
              className="h-11 gap-1.5 rounded-xl text-xs">
              <Navigation className="w-4 h-4" />
              {isDetecting ? "جاري التحديد..." : "تلقائي"}
            </Button>
            <Button onClick={() => setIsLocationModalOpen(true)} variant="outline"
              className="h-11 gap-1.5 rounded-xl text-xs">
              <MapPin className="w-4 h-4" />
              اختيار مدينة
            </Button>
          </div>
        </div>

        {/* Today's times */}
        <div className={cn("rounded-3xl p-5 border", palette.card)}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", palette.iconBg)}>
                <Calendar className={cn("w-5 h-5", palette.iconColor)} />
              </div>
              <div>
                <h2 className="font-bold text-base">مواقيت اليوم</h2>
                <p className={cn("text-[10px]", palette.subText)}>{hijriDate || "—"}</p>
              </div>
            </div>
            <span className={cn("text-[10px] tracking-wide", palette.subText)}>
              {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {prayers.map((p) => {
              const Icon = p.icon;
              const isNext = nextPrayer?.key === p.key;
              const t = prayerTimes?.[p.key as keyof PrayerTimesData];
              return (
                <div key={p.key} className={cn(
                  "rounded-2xl p-3 flex flex-col items-center gap-1 transition-all",
                  isNext ? palette.activePrayer : palette.inactivePrayer
                )}>
                  <Icon className={cn("w-5 h-5 mb-1", isNext ? "text-white" : "opacity-60")} />
                  <span className={cn("text-xs font-medium", isNext ? "text-white" : "opacity-70")}>{p.name}</span>
                  <span className={cn("text-sm font-bold font-mono", isNext ? "text-white" : "opacity-80")}>{formatTime(t)}</span>
                  <span className={cn("text-[9px]", isNext ? "text-white/70" : "opacity-40")}>{p.period}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reminders & Adhan card */}
        <div className={cn("rounded-3xl p-5 border space-y-4", palette.card)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", palette.iconBg)}>
                <Bell className={cn("w-5 h-5", palette.iconColor)} />
              </div>
              <div>
                <h2 className="font-bold text-base">تنبيهات الأذان</h2>
                <p className={cn("text-[11px]", palette.subText)}>تذكير قبل الصلاة وتشغيل الأذان</p>
              </div>
            </div>
            <button
              onClick={() => {
                const newVal = !settings.notifications_enabled;
                updateSettings({ notifications_enabled: newVal });
                if (!newVal) stopAdhan();
              }}
              className={cn("w-10 h-10 rounded-full flex items-center justify-center transition",
                settings.notifications_enabled ? "bg-blue-600 text-white" : palette.chip)}
            >
              {settings.notifications_enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-2">
            <label className={cn("text-xs font-medium", palette.subText)}>تذكير قبل الأذان</label>
            <Select
              value={String(settings.prayer_reminder_minutes ?? 15)}
              onValueChange={(v) => updateSettings({ prayer_reminder_minutes: parseInt(v) })}
            >
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">بدون تذكير مسبق</SelectItem>
                <SelectItem value="5">قبل ٥ دقائق</SelectItem>
                <SelectItem value="10">قبل ١٠ دقائق</SelectItem>
                <SelectItem value="15">قبل ١٥ دقيقة</SelectItem>
                <SelectItem value="30">قبل ٣٠ دقيقة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className={cn("text-xs font-medium", palette.subText)}>صوت الأذان</label>
            <div className="flex gap-2">
              <Select
                value={settings.adhan_sound || "makkah"}
                onValueChange={(v) => updateSettings({ adhan_sound: v })}
              >
                <SelectTrigger className="h-11 rounded-xl flex-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(adhanSounds) as AdhanSoundId[]).map((id) => (
                    <SelectItem key={id} value={id}>{adhanSounds[id].name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => previewAdhan((settings.adhan_sound || "makkah") as AdhanSoundId)}
                className="h-11 w-11 rounded-xl shrink-0"
                aria-label="معاينة"
              >
                <Play className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Monthly download card */}
        <div className={cn("rounded-3xl p-6 border flex flex-col gap-5", palette.card)}>
          <div className="flex gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", palette.iconBg)}>
              <FileText className={cn("w-7 h-7", palette.iconColor)} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">تنزيل جدول المواقيت</h3>
              <p className={cn("text-xs mt-1 leading-relaxed", palette.subText)}>
                تصدير شهر هجري أو ميلادي كامل أو أسبوع واحد بصيغة PDF أو صورة لمدينة {settings.city_name || "—"}
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsExportDialogOpen(true)}
            className={cn("w-full py-6 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] text-base h-auto", palette.btn)}
          >
            <Download className="w-5 h-5" />
            تصدير الجدول
          </Button>
        </div>

        <p className={cn("text-center text-[10px] px-2", palette.subText)}>
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
