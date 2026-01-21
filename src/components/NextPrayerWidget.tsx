import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Link } from "react-router-dom";
import LocationPickerModal from "./LocationPickerModal";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const prayers = [
  { key: "Fajr", name: "الفجر" },
  { key: "Dhuhr", name: "الظهر" },
  { key: "Asr", name: "العصر" },
  { key: "Maghrib", name: "المغرب" },
  { key: "Isha", name: "العشاء" },
];

const fetchPrayerTimes = async (lat: number, lng: number, method: number): Promise<PrayerTimesData> => {
  const today = new Date();
  const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
  );
  const data = await response.json();
  return data.data.timings;
};

const NextPrayerWidget = () => {
  const { settings } = useUserSettings();
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const lat = settings.latitude;
  const lng = settings.longitude;
  const method = settings.prayer_method || 4;
  const hasLocation = lat && lng;

  const { data: prayerTimes } = useQuery({
    queryKey: ["prayerTimesWidget", lat, lng, method],
    queryFn: () => fetchPrayerTimes(lat!, lng!, method),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (!prayerTimes) return;

    const updateNextPrayer = () => {
      const now = new Date();
      let found = false;

      for (const prayer of prayers) {
        const [hours, minutes] = prayerTimes[prayer.key as keyof PrayerTimesData].split(":").map(Number);
        const prayerDate = new Date();
        prayerDate.setHours(hours, minutes, 0, 0);

        if (prayerDate > now) {
          setNextPrayer({ name: prayer.name, time: prayerTimes[prayer.key as keyof PrayerTimesData] });
          found = true;
          break;
        }
      }

      if (!found) {
        setNextPrayer({ name: "الفجر", time: prayerTimes.Fajr });
      }
    };

    updateNextPrayer();
    const interval = setInterval(updateNextPrayer, 60000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

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

  // Show location prompt if no location
  if (!hasLocation) {
    return (
      <>
        <Card
          className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setIsLocationModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">مواقيت الصلاة</p>
                <p className="text-sm text-muted-foreground">اضغط لتحديد موقعك</p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>
        <LocationPickerModal open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen} />
      </>
    );
  }

  if (!nextPrayer) return null;

  return (
    <Link to="/prayer-times">
      <Card className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الصلاة القادمة</p>
              <p className="text-xl font-bold text-foreground">{nextPrayer.name}</p>
              <p className="text-sm text-primary font-medium">{nextPrayer.time}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">متبقي</p>
            <div className="flex items-center gap-1 text-xl font-bold text-primary font-mono" dir="ltr">
              <span>{formatNumber(countdown.hours)}</span>
              <span className="animate-pulse">:</span>
              <span>{formatNumber(countdown.minutes)}</span>
              <span className="animate-pulse">:</span>
              <span>{formatNumber(countdown.seconds)}</span>
            </div>
          </div>
        </div>

        {settings.city_name && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{settings.city_name}</span>
          </div>
        )}
      </Card>
    </Link>
  );
};

export default NextPrayerWidget;
