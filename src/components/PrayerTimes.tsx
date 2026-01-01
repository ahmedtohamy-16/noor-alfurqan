import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSettings } from "@/hooks/useUserSettings";
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

const PrayerTimes = () => {
  const { settings } = useUserSettings();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const hasLocation = settings.latitude && settings.longitude;

  const { data: prayerTimes, isLoading, refetch } = useQuery({
    queryKey: ["prayerTimes", settings.latitude, settings.longitude, settings.prayer_method],
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
        return prayer.name;
      }
    }
    return "Fajr";
  };

  const nextPrayer = getNextPrayer();

  if (isLoading) {
    return (
      <Card className="p-4 arabic-ui">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">مواقيت الصلاة</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4 arabic-ui">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">مواقيت الصلاة</h3>
          </div>
          {hasLocation && (
            <Button variant="ghost" size="icon" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {hasLocation && settings.city_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <MapPin className="w-3 h-3" />
            <span>{settings.city_name}</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {Object.keys(prayerNames).map((key) => (
            <div
              key={key}
              onClick={() => {
                if (!hasLocation) {
                  setShowLocationPrompt(true);
                }
              }}
              className={`p-3 rounded-lg text-center transition-colors cursor-pointer ${
                hasLocation && key === nextPrayer
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <p className="text-xs font-medium opacity-80">
                {prayerNames[key]}
              </p>
              <p className="text-lg font-bold">
                {hasLocation && prayerTimes ? prayerTimes[key as keyof PrayerTimesData] : "..."}
              </p>
            </div>
          ))}
        </div>

        {!hasLocation && (
          <div className="mt-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  يجب تحديد الموقع أولاً
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  لعرض مواقيت الصلاة الدقيقة لمنطقتك
                </p>
              </div>
              <LocationButton />
            </div>
          </div>
        )}
      </Card>

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
                يجب تحديد موقعك أولاً لعرض مواقيت الصلاة الدقيقة لمنطقتك.
                <br />
                يمكنك تحديد الموقع تلقائياً أو يدوياً.
              </p>
            </div>
            <div className="flex justify-center">
              <LocationButton />
            </div>
            <button
              onClick={() => setShowLocationPrompt(false)}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              إغلاق
            </button>
          </Card>
        </div>
      )}
    </>
  );
};

export default PrayerTimes;
