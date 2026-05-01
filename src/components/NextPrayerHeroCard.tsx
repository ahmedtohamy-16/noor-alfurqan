import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Link } from "react-router-dom";
import LocationPickerModal from "./LocationPickerModal";
import mosqueHero from "@/assets/mosque-hero.jpg";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const prayers = [
  { key: "Fajr", name: "الفجر", en: "Fajr" },
  { key: "Dhuhr", name: "الظهر", en: "Dhuhr" },
  { key: "Asr", name: "العصر", en: "Asr" },
  { key: "Maghrib", name: "المغرب", en: "Maghrib" },
  { key: "Isha", name: "العشاء", en: "Isha" },
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

const formatTime12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hh = ((h + 11) % 12) + 1;
  return { time: `${hh.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`, period };
};

const NextPrayerHeroCard = () => {
  const { settings } = useUserSettings();
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [nextPrayer, setNextPrayer] = useState<{ name: string; en: string; time: string } | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const lat = settings.latitude;
  const lng = settings.longitude;
  const method = settings.prayer_method || 4;
  const hasLocation = lat && lng;

  const { data: prayerTimes } = useQuery({
    queryKey: ["prayerTimesHero", lat, lng, method],
    queryFn: () => fetchPrayerTimes(lat!, lng!, method),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (!prayerTimes) return;
    const update = () => {
      const now = new Date();
      let found = false;
      for (const p of prayers) {
        const [h, m] = prayerTimes[p.key as keyof PrayerTimesData].split(":").map(Number);
        const d = new Date();
        d.setHours(h, m, 0, 0);
        if (d > now) {
          setNextPrayer({ name: p.name, en: p.en, time: prayerTimes[p.key as keyof PrayerTimesData] });
          found = true;
          break;
        }
      }
      if (!found) setNextPrayer({ name: prayers[0].name, en: prayers[0].en, time: prayerTimes.Fajr });
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
        hours: Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [nextPrayer]);

  const f = (n: number) => n.toString().padStart(2, "0");

  if (!hasLocation) {
    return (
      <>
        <Card
          className="p-4 bg-gradient-to-br from-primary to-primary/70 border-0 cursor-pointer text-primary-foreground"
          onClick={() => setIsLocationModalOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">مواقيت الصلاة</p>
                <p className="text-xs opacity-90">اضغط لتحديد موقعك</p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5" />
          </div>
        </Card>
        <LocationPickerModal open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen} />
      </>
    );
  }

  if (!nextPrayer) {
    return (
      <Card className="h-44 bg-primary/20 animate-pulse rounded-2xl" />
    );
  }

  const { time, period } = formatTime12(nextPrayer.time);

  return (
    <Link to="/prayer-times" className="block">
      <Card className="relative overflow-hidden border-0 rounded-2xl shadow-lg shadow-primary/20">
        {/* Background image */}
        <img
          src={mosqueHero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          width={1024}
          height={640}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-primary/40 via-primary/70 to-primary/95" />

        <div className="relative p-5 text-white min-h-[170px]">
          <div className="text-right">
            <p className="text-xs opacity-90 font-medium">Next Prayer</p>
            <p className="text-lg font-bold">{nextPrayer.en} • {nextPrayer.name}</p>

            <div className="flex items-baseline gap-2 mt-2" dir="ltr">
              <span className="text-4xl font-extrabold tracking-tight">{time}</span>
              <span className="text-sm font-bold opacity-90">{period}</span>
            </div>

            <div className="mt-3">
              <p className="text-[11px] opacity-80">Time left</p>
              <div
                className="inline-flex items-center gap-1 text-lg font-bold font-mono bg-white/15 backdrop-blur-sm px-3 py-1 rounded-lg mt-0.5"
                dir="ltr"
              >
                <span>{f(countdown.hours)}</span>
                <span className="animate-pulse opacity-70">:</span>
                <span>{f(countdown.minutes)}</span>
                <span className="animate-pulse opacity-70">:</span>
                <span>{f(countdown.seconds)}</span>
              </div>
            </div>

            {settings.city_name && (
              <div className="flex items-center gap-1 mt-3 text-xs opacity-90">
                <MapPin className="w-3 h-3" />
                <span>{settings.city_name}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default NextPrayerHeroCard;
