import { usePrayerSchedule } from "@/hooks/usePrayerSchedule";
import { recommendedPrayerMethod } from "@/lib/prayerMethods";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Link } from "react-router-dom";
import LocationPickerModal from "./LocationPickerModal";
import { arabicCityLabel, hasLocationCoordinates } from "@/lib/cityNames";
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
  { key: "Fajr", name: "الفجر" },
  { key: "Dhuhr", name: "الظهر" },
  { key: "Asr", name: "العصر" },
  { key: "Maghrib", name: "المغرب" },
  { key: "Isha", name: "العشاء" },
];

const formatTime12 = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "م" : "ص";
  const hh = ((h + 11) % 12) + 1;
  return { time: `${hh.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]), period };
};

const NextPrayerHeroCard = () => {
  const { settings } = useUserSettings();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { nextPrayer, countdown, hasLocation } = usePrayerSchedule();

  const f = (n: number) => n.toString().padStart(2, "0").replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

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
      <Card className="h-44 loading-placeholder animate-pulse motion-reduce:animate-none rounded-2xl" />
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
            <p className="text-xs opacity-90 font-medium">الصلاة القادمة</p>
            <p className="text-lg font-bold">{nextPrayer.name}</p>

            <div className="flex items-baseline gap-2 mt-2" dir="ltr">
              <span className="text-4xl font-extrabold tracking-tight">{time}</span>
              <span className="text-sm font-bold opacity-90">{period}</span>
            </div>

            <div className="mt-3">
              <p className="text-[11px] opacity-80">الوقت المتبقي</p>
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
                <span>{arabicCityLabel(settings.city_name)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default NextPrayerHeroCard;
