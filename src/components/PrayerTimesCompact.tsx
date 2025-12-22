import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Link } from "react-router-dom";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
}

const prayerNames: { [key: string]: string } = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

const DEFAULT_LOCATION: Location = { 
  latitude: 21.4225, 
  longitude: 39.8262, 
  city: "مكة المكرمة" 
};

const fetchPrayerTimes = async (lat: number, lng: number): Promise<PrayerTimesData> => {
  const date = new Date();
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`
  );
  const data = await response.json();
  return data.data.timings;
};

const PrayerTimesCompact = () => {
  const { settings } = useUserSettings();
  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    if (settings.latitude && settings.longitude) {
      setLocation({
        latitude: settings.latitude,
        longitude: settings.longitude,
        city: settings.city_name || undefined,
      });
    } else {
      setLocation(DEFAULT_LOCATION);
    }
  }, [settings.latitude, settings.longitude, settings.city_name]);

  const { data: prayerTimes, isLoading } = useQuery({
    queryKey: ["prayerTimesCompact", location?.latitude, location?.longitude],
    queryFn: () => fetchPrayerTimes(location!.latitude, location!.longitude),
    enabled: !!location,
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

  if (isLoading || !location) {
    return (
      <Card className="p-4 arabic-ui">
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  return (
    <Link to="/prayer-times">
      <Card className="p-4 arabic-ui hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">مواقيت الصلاة</h3>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{location.city || "مكة المكرمة"}</span>
        </div>

        {/* Next Prayer Highlight */}
        {nextPrayer && (
          <div className="bg-primary/10 rounded-lg p-3 mb-3">
            <p className="text-xs text-muted-foreground mb-1">الصلاة القادمة</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary text-lg">{prayerNames[nextPrayer.name]}</span>
              <span className="font-bold text-foreground text-lg">{nextPrayer.time}</span>
            </div>
          </div>
        )}

        {/* Prayer Times Grid - Vertical */}
        <div className="space-y-2">
          {prayerTimes &&
            Object.entries(prayerTimes)
              .filter(([key]) => key in prayerNames)
              .map(([key, time]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    key === nextPrayer?.name
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <span className={`text-sm font-medium ${key === nextPrayer?.name ? "" : "text-foreground"}`}>
                    {prayerNames[key]}
                  </span>
                  <span className={`font-bold ${key === nextPrayer?.name ? "" : "text-foreground"}`}>
                    {time}
                  </span>
                </div>
              ))}
        </div>
      </Card>
    </Link>
  );
};

export default PrayerTimesCompact;
