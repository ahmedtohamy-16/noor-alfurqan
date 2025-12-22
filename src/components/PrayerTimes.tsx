import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSettings } from "@/hooks/useUserSettings";

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

// Default location: Makkah
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

const PrayerTimes = () => {
  const { settings } = useUserSettings();
  const [location, setLocation] = useState<Location | null>(null);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  useEffect(() => {
    // Priority 1: User settings from database/localStorage
    if (settings.latitude && settings.longitude) {
      setLocation({
        latitude: settings.latitude,
        longitude: settings.longitude,
        city: settings.city_name || undefined,
      });
      if (settings.city_name) {
        setLocationMessage(settings.city_name);
      }
      return;
    }

    // Priority 2: Saved prayer location in localStorage
    const savedLocation = localStorage.getItem("prayerLocation");
    if (savedLocation) {
      const parsed = JSON.parse(savedLocation);
      setLocation(parsed);
      if (parsed.city) {
        setLocationMessage(parsed.city);
      }
      return;
    }

    // Priority 3: Use default location (Makkah) immediately
    // Don't wait for geolocation - use default right away for better UX
    setLocation(DEFAULT_LOCATION);
    setLocationMessage("مكة المكرمة (افتراضي)");

    // Try to get actual location in background
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(loc);
          setLocationMessage("موقعك الحالي");
          localStorage.setItem("prayerLocation", JSON.stringify(loc));
        },
        () => {
          // Keep using default location - no error message needed
        },
        { timeout: 5000, maximumAge: 300000 }
      );
    }
  }, [settings.latitude, settings.longitude, settings.city_name]);

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

      {locationMessage && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          <span>{locationMessage}</span>
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
