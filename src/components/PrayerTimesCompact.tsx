import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Link } from "react-router-dom";
import LocationButton from "./LocationButton";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const prayerNames: { [key: string]: string } = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const fetchPrayerTimes = async (lat: number, lng: number, method: number = 4): Promise<PrayerTimesData> => {
  const date = new Date();
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
  );
  const data = await response.json();
  return data.data.timings;
};

const PrayerTimesCompact = () => {
  const { settings } = useUserSettings();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const hasLocation = settings.latitude && settings.longitude;

  const { data: prayerTimes, isLoading } = useQuery({
    queryKey: ["prayerTimesCompact", settings.latitude, settings.longitude, settings.prayer_method],
    queryFn: () => fetchPrayerTimes(settings.latitude!, settings.longitude!, settings.prayer_method || 4),
    enabled: !!hasLocation,
    staleTime: 1000 * 60 * 60,
  });

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    const prayers = Object.entries(prayerTimes)
      .filter(([key]) => key in prayerNames)
      .map(([key, time]) => {
        const [hours, minutes] = time.split(":").map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);
        return { name: key, time, date: prayerDate };
      });

    for (const prayer of prayers) {
      if (prayer.date > now) {
        return prayer;
      }
    }
    return { name: "Fajr", time: prayerTimes.Fajr, date: new Date() };
  };

  const nextPrayer = getNextPrayer();

  if (isLoading) {
    return (
      <Card className="p-4 arabic-ui">
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  return (
    <>
      <Link to="/prayer-times">
        <Card className="p-4 arabic-ui hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">مواقيت الصلاة</h3>
            </div>
            <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
          </div>

          {hasLocation && settings.city_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              <span>{settings.city_name}</span>
            </div>
          )}

          {/* Next Prayer Highlight */}
          {hasLocation && nextPrayer && (
            <div className="bg-primary/10 rounded-lg p-3 mb-3">
              <p className="text-xs text-muted-foreground mb-1">الصلاة القادمة</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary text-lg">{prayerNames[nextPrayer.name]}</span>
                <span className="font-bold text-foreground text-lg">{nextPrayer.time}</span>
              </div>
            </div>
          )}

          {/* Prayer Times Grid */}
          <div className="space-y-2">
            {Object.keys(prayerNames).map((key) => (
              <div
                key={key}
                onClick={(e) => {
                  if (!hasLocation) {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLocationPrompt(true);
                  }
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  hasLocation && key === nextPrayer?.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                <span className={`text-sm font-medium ${hasLocation && key === nextPrayer?.name ? "" : "text-foreground"}`}>
                  {prayerNames[key]}
                </span>
                <span className={`font-bold ${hasLocation && key === nextPrayer?.name ? "" : "text-foreground"}`}>
                  {hasLocation && prayerTimes ? prayerTimes[key as keyof PrayerTimesData] : "..."}
                </span>
              </div>
            ))}
          </div>

          {!hasLocation && (
            <div className="mt-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                يجب تحديد الموقع لعرض المواقيت الدقيقة
              </p>
            </div>
          )}
        </Card>
      </Link>

      {/* Location prompt dialog */}
      {showLocationPrompt && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLocationPrompt(false)}
        >
          <Card 
            className="p-6 max-w-sm w-full arabic-ui"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-bold text-foreground">تحديد الموقع مطلوب</h3>
              <p className="text-sm text-muted-foreground mt-2">
                يجب تحديد موقعك أولاً لعرض مواقيت الصلاة الدقيقة لمنطقتك
              </p>
            </div>
            <LocationButton />
            <button
              onClick={() => setShowLocationPrompt(false)}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              إغلاق
            </button>
          </Card>
        </div>
      )}
    </>
  );
};

export default PrayerTimesCompact;
