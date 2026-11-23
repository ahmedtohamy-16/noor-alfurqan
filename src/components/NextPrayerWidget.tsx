import { usePrayerSchedule } from "@/hooks/usePrayerSchedule";
import { recommendedPrayerMethod } from "@/lib/prayerMethods";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Link } from "react-router-dom";
import LocationPickerModal from "./LocationPickerModal";
import { arabicDigits } from "@/lib/displayFormat";
import { arabicCityLabel, hasLocationCoordinates } from "@/lib/cityNames";

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

const NextPrayerWidget = () => {
  const { settings } = useUserSettings();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const { nextPrayer, countdown, hasLocation } = usePrayerSchedule();

  const formatNumber = (num: number) => arabicDigits(num.toString().padStart(2, "0"));

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
              <p className="text-sm text-primary font-medium arabic-digits" dir="ltr">{arabicDigits(nextPrayer.time)}</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">متبقي</p>
            <div className="flex items-center gap-1 text-xl font-bold text-primary arabic-digits" dir="ltr">
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
            <span>{arabicCityLabel(settings.city_name)}</span>
          </div>
        )}
      </Card>
    </Link>
  );
};

export default NextPrayerWidget;
