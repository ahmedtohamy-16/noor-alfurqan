import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Clock,
  MapPin,
  Download,
  Image,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CloudSun,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useUserSettings } from "@/hooks/useUserSettings";
import LocationPickerModal from "@/components/LocationPickerModal";
import { toast } from "sonner";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface MonthlyPrayerDay {
  date: {
    readable: string;
    gregorian: { date: string; day: string };
    hijri: { date: string; day: string; month: { ar: string } };
  };
  timings: PrayerTimesData;
}

const prayers = [
  { key: "Fajr", name: "الفجر", icon: Moon },
  { key: "Sunrise", name: "الشروق", icon: Sunrise },
  { key: "Dhuhr", name: "الظهر", icon: Sun },
  { key: "Asr", name: "العصر", icon: CloudSun },
  { key: "Maghrib", name: "المغرب", icon: Sunset },
  { key: "Isha", name: "العشاء", icon: Moon },
];

const fetchPrayerTimes = async (
  lat: number,
  lng: number,
  method: number,
  madhab: number
): Promise<PrayerTimesData> => {
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}&school=${madhab}`
  );
  const data = await response.json();
  return data.data.timings;
};

const fetchMonthlyPrayerTimes = async (
  lat: number,
  lng: number,
  method: number,
  madhab: number,
  month: number,
  year: number
): Promise<MonthlyPrayerDay[]> => {
  const response = await fetch(
    `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}&school=${madhab}`
  );
  const data = await response.json();
  return data.data;
};

const PrayerTimesPage = () => {
  const { settings } = useUserSettings();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; key: string } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const calendarRef = useRef<HTMLDivElement>(null);

  const lat = settings.latitude || 21.4225;
  const lng = settings.longitude || 39.8262;
  const method = settings.prayer_method || 4;
  const madhab = settings.prayer_madhab || 0;
  const hasLocation = settings.latitude && settings.longitude;

  const { data: prayerTimes, isLoading } = useQuery({
    queryKey: ["prayerTimes", lat, lng, method, madhab],
    queryFn: () => fetchPrayerTimes(lat, lng, method, madhab),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60,
  });

  const { data: monthlyTimes } = useQuery({
    queryKey: ["monthlyPrayerTimes", lat, lng, method, madhab, currentMonth, currentYear],
    queryFn: () => fetchMonthlyPrayerTimes(lat, lng, method, madhab, currentMonth, currentYear),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60 * 24,
  });

  // Calculate next prayer and countdown
  useEffect(() => {
    if (!prayerTimes) return;

    const updateNextPrayer = () => {
      const now = new Date();
      let found = false;

      for (const prayer of prayers) {
        if (prayer.key === "Sunrise") continue; // Skip sunrise for next prayer
        const timeStr = prayerTimes[prayer.key as keyof PrayerTimesData];
        const [hours, minutes] = timeStr.split(":").map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        if (prayerDate > now) {
          setNextPrayer({ name: prayer.name, time: timeStr, key: prayer.key });
          found = true;
          break;
        }
      }

      if (!found) {
        setNextPrayer({ name: "الفجر", time: prayerTimes.Fajr, key: "Fajr" });
      }
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Countdown timer
  useEffect(() => {
    if (!prayerTimes || !nextPrayer) return;

    const updateCountdown = () => {
      const now = new Date();
      const [hours, minutes] = nextPrayer.time.split(":").map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      if (prayerDate < now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      const diff = prayerDate.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes, nextPrayer]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const handleExportJSON = () => {
    if (!monthlyTimes) return;

    const exportData = monthlyTimes.map((day) => ({
      date: day.date.gregorian.date,
      hijri: day.date.hijri.date,
      fajr: day.timings.Fajr,
      sunrise: day.timings.Sunrise,
      dhuhr: day.timings.Dhuhr,
      asr: day.timings.Asr,
      maghrib: day.timings.Maghrib,
      isha: day.timings.Isha,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prayer-times-${currentMonth}-${currentYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الملف بنجاح");
  };

  const handleExportImage = async () => {
    if (!monthlyTimes || !calendarRef.current) return;

    try {
      // Dynamic import for html2canvas
      const html2canvasModule = await import("html2canvas");
      const html2canvas = html2canvasModule.default;
      
      const canvas = await html2canvas(calendarRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      // Add watermark
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#10b981";
        ctx.textAlign = "center";
        ctx.fillText("نور الفرقان", canvas.width / 2, canvas.height - 20);
      }

      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `prayer-times-${currentMonth}-${currentYear}.png`;
      a.click();
      toast.success("تم تحميل الصورة بنجاح");
    } catch (error) {
      console.error("Image export error:", error);
      toast.error("حدث خطأ في تحميل الصورة");
    }
  };

  const monthNames = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Prompt location if not set
  useEffect(() => {
    if (!hasLocation) {
      setIsLocationModalOpen(true);
    }
  }, [hasLocation]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui" dir="rtl">
        {/* Location header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">
              {settings.city_name || "لم يتم تحديد الموقع"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            تغيير
          </Button>
        </div>

        {/* Next Prayer Card with Countdown */}
        <Card 
          className={`p-6 mb-6 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 ${!hasLocation ? "cursor-pointer" : ""}`}
          onClick={() => !hasLocation && setIsLocationModalOpen(true)}
        >
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">الصلاة القادمة</p>
            {hasLocation && nextPrayer && prayerTimes ? (
              <>
                <h2 className="text-3xl font-bold text-primary mb-2">{nextPrayer.name}</h2>
                <p className="text-xl text-foreground mb-4">{nextPrayer.time}</p>

                {/* Countdown - Hours on left, Seconds on right */}
                <div className="flex justify-center items-center gap-2">
                  <p className="text-sm text-muted-foreground">متبقي:</p>
                  <div className="flex items-center gap-1 text-3xl font-bold text-primary font-mono bg-primary/10 px-4 py-2 rounded-xl" dir="ltr">
                    <span>{formatNumber(countdown.hours)}</span>
                    <span className="animate-pulse">:</span>
                    <span>{formatNumber(countdown.minutes)}</span>
                    <span className="animate-pulse">:</span>
                    <span>{formatNumber(countdown.seconds)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-4">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg text-muted-foreground">--:--</p>
                <p className="text-sm text-muted-foreground mt-2">اضغط لتحديد موقعك</p>
              </div>
            )}
          </div>
        </Card>

        {/* Today's Prayer Times */}
        <h3 className="text-xl font-bold text-foreground mb-4">مواقيت اليوم</h3>
        {isLoading ? (
          <Card className="p-8 text-center">
            <Clock className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
            <p className="mt-2 text-muted-foreground">جاري تحميل المواقيت...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {prayers.map((prayer) => {
              const Icon = prayer.icon;
              const isNext = nextPrayer?.key === prayer.key && hasLocation;
              const timeValue = prayerTimes?.[prayer.key as keyof PrayerTimesData];
              return (
                <Card
                  key={prayer.key}
                  className={`p-4 text-center transition-all ${
                    isNext
                      ? "bg-primary/10 border-primary shadow-lg scale-105"
                      : "hover:shadow-md"
                  } ${!hasLocation ? "cursor-pointer" : ""}`}
                  onClick={() => !hasLocation && setIsLocationModalOpen(true)}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      isNext ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-foreground">{prayer.name}</p>
                  <p className={`text-lg font-mono ${isNext ? "text-primary" : "text-muted-foreground"}`}>
                    {hasLocation && timeValue ? timeValue : "--:--"}
                  </p>
                </Card>
              );
            })}
          </div>
        )}

        {/* Monthly Calendar */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground">التقويم الشهري</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-2 mb-4">
          <Button variant="outline" onClick={handleExportJSON} className="gap-2">
            <Download className="w-4 h-4" />
            تحميل JSON
          </Button>
          <Button variant="outline" onClick={handleExportImage} className="gap-2">
            <Image className="w-4 h-4" />
            تحميل كصورة
          </Button>
        </div>

        {/* Monthly table */}
        <div ref={calendarRef} className="bg-card rounded-lg overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-right">التاريخ</th>
                  <th className="p-3">الفجر</th>
                  <th className="p-3">الشروق</th>
                  <th className="p-3">الظهر</th>
                  <th className="p-3">العصر</th>
                  <th className="p-3">المغرب</th>
                  <th className="p-3">العشاء</th>
                </tr>
              </thead>
              <tbody>
                {monthlyTimes?.map((day, index) => (
                  <tr key={index} className="border-t border-border hover:bg-muted/50">
                    <td className="p-3 text-right">
                      <span className="font-medium">{day.date.gregorian.day}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        ({day.date.hijri.day} {day.date.hijri.month.ar})
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">{day.timings.Fajr.split(" ")[0]}</td>
                    <td className="p-3 text-center font-mono">{day.timings.Sunrise.split(" ")[0]}</td>
                    <td className="p-3 text-center font-mono">{day.timings.Dhuhr.split(" ")[0]}</td>
                    <td className="p-3 text-center font-mono">{day.timings.Asr.split(" ")[0]}</td>
                    <td className="p-3 text-center font-mono">{day.timings.Maghrib.split(" ")[0]}</td>
                    <td className="p-3 text-center font-mono">{day.timings.Isha.split(" ")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Watermark for image export */}
          <div className="p-4 text-center bg-gradient-to-r from-primary/10 to-accent/10 border-t">
            <p className="text-primary font-bold">نور الفرقان</p>
            <p className="text-xs text-muted-foreground">تطبيق لقراءة القرآن الكريم</p>
          </div>
        </div>
      </main>

      <LocationPickerModal open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen} />
    </div>
  );
};

export default PrayerTimesPage;
