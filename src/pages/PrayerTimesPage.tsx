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
  Loader2,
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
import CitySearchCombobox from "@/components/CitySearchCombobox";

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

const PRAYER_CACHE_PREFIX = "prayerTimesCache:v1:";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const cacheKey = (lat: number, lng: number, method: number, madhab: number, dateStr: string) =>
  `${PRAYER_CACHE_PREFIX}${lat.toFixed(3)}|${lng.toFixed(3)}|${method}|${madhab}|${dateStr}`;

const readCache = (key: string): PrayerTimesData | null => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: PrayerTimesData };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
};

const writeCache = (key: string, data: PrayerTimesData) => {
  try {
    localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
};

const fetchPrayerTimes = async (lat: number, lng: number, method: number, madhab: number): Promise<PrayerTimesData> => {
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const key = cacheKey(lat, lng, method, madhab, dateStr);
  const cached = readCache(key);
  if (cached) return cached;
  const r = await fetch(`https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${madhab}`);
  if (!r.ok) throw new Error(`Prayer API error: ${r.status}`);
  const d = await r.json();
  const timings = d?.data?.timings;
  if (!timings) throw new Error("بيانات المواقيت غير متاحة");
  writeCache(key, timings);
  return timings;
};

const PrayerTimesPage = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, updateLocation, autoDetectLocation } = useUserSettings();
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

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const { data: prayerTimes, isLoading: isLoadingTimes, isFetching: isFetchingTimes, error: prayerError, refetch: refetchPrayer } = useQuery({
    queryKey: ["prayerTimes", lat, lng, method, madhab],
    queryFn: () => fetchPrayerTimes(lat, lng, method, madhab),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 6,
    retry: 1,
  });

  // Error alert with retry button on fetch failure
  useEffect(() => {
    if (!prayerError) return;
    toast.error("تعذّر تحديث مواقيت الصلاة", {
      description: "تحقق من الاتصال بالإنترنت وحاول مرة أخرى.",
      duration: 10000,
      action: {
        label: "إعادة المحاولة",
        onClick: () => refetchPrayer(),
      },
    });
  }, [prayerError, refetchPrayer]);


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

  const locationBusy = isDetecting || isFetchingTimes || isSavingSettings;

  // Wrapped settings update — acquires lock so location-update actions cannot fire mid-write
  const safeUpdateSettings = async (patch: Parameters<typeof updateSettings>[0]) => {
    if (locationBusy) {
      toast.info("يرجى الانتظار حتى انتهاء التحديث الحالي");
      return;
    }
    setIsSavingSettings(true);
    try {
      await updateSettings(patch);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAutoDetect = async () => {
    if (locationBusy) return;
    setIsDetecting(true);
    try {
      const ok = await autoDetectLocation();
      if (!ok) {
        toast.error("تعذّر تحديد موقعك", {
          description: "يمكنك إعادة المحاولة أو اختيار مدينتك يدوياً.",
          duration: 9000,
          action: { label: "إعادة المحاولة", onClick: () => handleAutoDetect() },
        });
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleCityPick = async (city: { latitude: number; longitude: number; name_ar: string; country_code: string }) => {
    if (locationBusy) return;
    if (
      settings.city_name === city.name_ar &&
      Math.abs((settings.latitude || 0) - city.latitude) < 0.001 &&
      Math.abs((settings.longitude || 0) - city.longitude) < 0.001
    ) {
      return;
    }
    setIsDetecting(true);
    try {
      await updateLocation(city.latitude, city.longitude, city.name_ar);
      await updateSettings({ country_code: city.country_code });
    } catch {
      toast.error("تعذّر تحديث الموقع", {
        action: { label: "إعادة المحاولة", onClick: () => handleCityPick(city) },
      });
    } finally {
      setIsDetecting(false);
    }
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

        {/* Location card — two states */}
        {hasLocation ? (
          <div className={cn("rounded-3xl p-4 border space-y-3", palette.card)}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", palette.iconBg)}>
                    {locationBusy ? (
                      <Loader2 className={cn("w-6 h-6 animate-spin", palette.iconColor)} />
                    ) : (
                      <MapPin className={cn("w-6 h-6", palette.iconColor)} />
                    )}
                  </div>
                  {!locationBusy && (
                    <span className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={cn("text-[10px] mb-0.5", palette.subText)}>
                    {locationBusy ? "جاري التحديث..." : "موقعك الحالي"}
                  </p>
                  <h2 className="font-bold text-base truncate">{settings.city_name}</h2>
                  <p className={cn("text-[10px]", palette.subText)} dir="ltr">{tzLabel}</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <Button
                  onClick={() => setIsLocationModalOpen(true)}
                  variant="outline"
                  size="sm"
                  disabled={locationBusy}
                  className="h-8 gap-1 rounded-full text-[10px] px-2.5"
                >
                  <Settings className="w-3 h-3" />
                  تغيير
                </Button>
                <Button
                  onClick={handleAutoDetect}
                  disabled={locationBusy}
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 rounded-full text-[10px] px-2.5"
                >
                  {isDetecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                  {isDetecting ? "..." : "تحديث GPS"}
                </Button>
              </div>
            </div>
            <CitySearchCombobox
              onSelect={handleCityPick}
              loading={locationBusy}
              disabled={locationBusy}
              placeholder="ابحث عن مدينة أخرى..."
            />
          </div>
        ) : (
          <div className={cn(
            "relative rounded-3xl p-5 border-2 border-dashed overflow-hidden",
            isDark ? "border-amber-500/40 bg-amber-500/5" : "border-amber-500/50 bg-amber-50"
          )}>
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center animate-pulse">
                {locationBusy ? (
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                ) : (
                  <MapPin className="w-8 h-8 text-amber-500" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-base mb-1">
                  {locationBusy ? "جاري تحديد الموقع..." : "لم تحدد موقعك بعد"}
                </h2>
                <p className={cn("text-xs leading-relaxed max-w-[260px]", palette.subText)}>
                  ابحث عن مدينتك أو استخدم تحديد الموقع التلقائي لعرض المواقيت بدقة
                </p>
              </div>
              <CitySearchCombobox
                onSelect={handleCityPick}
                loading={locationBusy}
                disabled={locationBusy}
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  onClick={handleAutoDetect}
                  disabled={locationBusy}
                  className={cn("h-11 gap-1.5 rounded-xl text-xs font-bold", palette.btn)}
                >
                  {isDetecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                  {isDetecting ? "جاري التحديد..." : "تلقائي (GPS)"}
                </Button>
                <Button
                  onClick={() => setIsLocationModalOpen(true)}
                  variant="outline"
                  disabled={locationBusy}
                  className="h-11 gap-1.5 rounded-xl text-xs font-bold border-amber-500/40"
                >
                  <MapPin className="w-4 h-4" />
                  مزيد من الخيارات
                </Button>
              </div>
            </div>
          </div>
        )}



        {/* Today's times */}
        <div className={cn("relative rounded-3xl p-5 border", palette.card)}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", palette.iconBg)}>
                <Calendar className={cn("w-5 h-5", palette.iconColor)} />
              </div>
              <div>
                <h2 className="font-bold text-base flex items-center gap-1.5">
                  مواقيت اليوم
                  {isFetchingTimes && !isLoadingTimes && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin opacity-60" />
                  )}
                </h2>
                <p className={cn("text-[10px]", palette.subText)}>{hijriDate || "—"}</p>
              </div>
            </div>
            <span className={cn("text-[10px] tracking-wide", palette.subText)}>
              {today.getDate()} {monthNames[today.getMonth()]} {today.getFullYear()}
            </span>
          </div>

          {isLoadingTimes ? (
            <div className="grid grid-cols-3 gap-2">
              {prayers.map((p) => (
                <div
                  key={p.key}
                  className={cn(
                    "rounded-2xl p-3 h-[92px] animate-pulse",
                    palette.inactivePrayer
                  )}
                />
              ))}
            </div>
          ) : (
            <div className={cn("grid grid-cols-3 gap-2 transition-opacity", isFetchingTimes && "opacity-60")}>
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
          )}
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
                safeUpdateSettings({ notifications_enabled: newVal });
                if (!newVal) stopAdhan();
              }}
              disabled={locationBusy}
              className={cn("w-10 h-10 rounded-full flex items-center justify-center transition disabled:opacity-50",
                settings.notifications_enabled ? "bg-blue-600 text-white" : palette.chip)}
            >
              {settings.notifications_enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
          </div>

          <div className="space-y-2">
            <label className={cn("text-xs font-medium", palette.subText)}>تذكير قبل الأذان</label>
            <Select
              value={String(settings.prayer_reminder_minutes ?? 15)}
              onValueChange={(v) => safeUpdateSettings({ prayer_reminder_minutes: parseInt(v) })}
              disabled={locationBusy}
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
