import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

const fetchPrayerTimes = async (lat: number, lng: number): Promise<PrayerTimesData> => {
  const date = new Date();
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=4`
  );
  const data = await response.json();
  return data.data.timings;
};

const PrayerTimes = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Try to get saved location first
    const savedLocation = localStorage.getItem("prayerLocation");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
      return;
    }

    // Otherwise request location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(loc);
          localStorage.setItem("prayerLocation", JSON.stringify(loc));
        },
        (error) => {
          // Default to Makkah
          const defaultLoc = { latitude: 21.4225, longitude: 39.8262, city: "مكة المكرمة" };
          setLocation(defaultLoc);
          setLocationError("تم استخدام موقع مكة المكرمة كموقع افتراضي");
        }
      );
    }
  }, []);

  const { data: prayerTimes, isLoading, refetch } = useQuery({
    queryKey: ["prayerTimes", location?.latitude, location?.longitude],
    queryFn: () => fetchPrayerTimes(location!.latitude, location!.longitude),
    enabled: !!location,
    staleTime: 1000 * 60 * 60, // 1 hour
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
    return "Fajr"; // Next day's Fajr
  };

  const nextPrayer = getNextPrayer();

  if (!location || isLoading) {
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
    <Card className="p-4 arabic-ui">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">مواقيت الصلاة</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {locationError && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{locationError}</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {prayerTimes &&
          Object.entries(prayerTimes)
            .filter(([key]) => key in prayerNames)
            .map(([key, time]) => (
              <div
                key={key}
                className={`p-3 rounded-lg text-center transition-colors ${
                  key === nextPrayer
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50"
                }`}
              >
                <p className="text-xs font-medium opacity-80">
                  {prayerNames[key]}
                </p>
                <p className="text-lg font-bold">{time}</p>
              </div>
            ))}
      </div>
    </Card>
  );
};

export default PrayerTimes;
