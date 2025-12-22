import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, RefreshCw, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

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

const prayers = [
  { key: "Fajr", name: "الفجر", icon: Moon, description: "صلاة الفجر" },
  { key: "Sunrise", name: "الشروق", icon: Sunrise, description: "شروق الشمس" },
  { key: "Dhuhr", name: "الظهر", icon: Sun, description: "صلاة الظهر" },
  { key: "Asr", name: "العصر", icon: Sun, description: "صلاة العصر" },
  { key: "Maghrib", name: "المغرب", icon: Sunset, description: "صلاة المغرب" },
  { key: "Isha", name: "العشاء", icon: Moon, description: "صلاة العشاء" },
];

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

const PrayerTimesPage = () => {
  const { settings, updateLocation, requestLocation } = useUserSettings();
  const [location, setLocation] = useState<Location | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

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

  const { data: prayerTimes, isLoading, refetch } = useQuery({
    queryKey: ["prayerTimes", location?.latitude, location?.longitude],
    queryFn: () => fetchPrayerTimes(location!.latitude, location!.longitude),
    enabled: !!location,
    staleTime: 1000 * 60 * 60,
  });

  const handleRequestLocation = async () => {
    setIsRequestingLocation(true);
    try {
      const loc = await requestLocation();
      await updateLocation(loc.lat, loc.lng, "موقعك الحالي");
      toast.success("تم تحديث الموقع بنجاح");
    } catch (error) {
      toast.error("تعذر الحصول على الموقع. يرجى السماح بالوصول للموقع من إعدادات المتصفح.");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    
    const now = new Date();
    for (const prayer of prayers) {
      const [hours, minutes] = prayerTimes[prayer.key as keyof PrayerTimesData].split(":").map(Number);
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);
      if (prayerDate > now) {
        return prayer.key;
      }
    }
    return "Fajr";
  };

  const nextPrayer = getNextPrayer();

  const getTimeUntilNextPrayer = () => {
    if (!prayerTimes || !nextPrayer) return null;
    
    const now = new Date();
    const [hours, minutes] = prayerTimes[nextPrayer as keyof PrayerTimesData].split(":").map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);
    
    if (prayerDate < now) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }
    
    const diff = prayerDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursLeft} ساعة و ${minutesLeft} دقيقة`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            مواقيت الصلاة
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("ar-SA", { 
              weekday: "long", 
              year: "numeric", 
              month: "long", 
              day: "numeric" 
            })}
          </p>
        </div>

        {/* Location Card */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {location?.city || "مكة المكرمة"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {settings.latitude && settings.longitude 
                    ? "موقعك المحدد" 
                    : "الموقع الافتراضي"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRequestLocation}
                disabled={isRequestingLocation}
              >
                {isRequestingLocation ? "جاري التحديد..." : "تحديد موقعي"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Next Prayer Highlight */}
        {prayerTimes && nextPrayer && (
          <Card className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">الصلاة القادمة</p>
              <h2 className="text-4xl font-bold text-primary mb-2">
                {prayers.find(p => p.key === nextPrayer)?.name}
              </h2>
              <p className="text-2xl font-bold text-foreground mb-2">
                {prayerTimes[nextPrayer as keyof PrayerTimesData]}
              </p>
              <p className="text-muted-foreground">
                متبقي {getTimeUntilNextPrayer()}
              </p>
            </div>
          </Card>
        )}

        {/* Prayer Times List */}
        <div className="grid gap-4">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          ) : (
            prayers.map((prayer) => {
              const Icon = prayer.icon;
              const isNext = nextPrayer === prayer.key;
              const time = prayerTimes?.[prayer.key as keyof PrayerTimesData];
              
              return (
                <Card
                  key={prayer.key}
                  className={`p-4 transition-all ${
                    isNext 
                      ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]" 
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isNext ? "bg-primary-foreground/20" : "bg-primary/10"
                      }`}>
                        <Icon className={`w-6 h-6 ${isNext ? "text-primary-foreground" : "text-primary"}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isNext ? "" : "text-foreground"}`}>
                          {prayer.name}
                        </h3>
                        <p className={`text-sm ${isNext ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {prayer.description}
                        </p>
                      </div>
                    </div>
                    <div className={`text-2xl font-bold ${isNext ? "" : "text-foreground"}`}>
                      {time || "--:--"}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default PrayerTimesPage;
