import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Clock, MapPin, RefreshCw, Sun, Moon, Sunrise, Sunset, 
  ChevronRight, ChevronLeft, Calendar, Settings2, CalendarDays
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import PrayerNotificationSettings from "@/components/PrayerNotificationSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Header from "@/components/Header";
import LocationButton from "@/components/LocationButton";
import { useUserSettings } from "@/hooks/useUserSettings";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";
import { toast } from "sonner";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";
import { ar } from "date-fns/locale";

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface HijriDate {
  day: string;
  month: { ar: string };
  year: string;
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

const calculationMethods = [
  { id: 1, name: "جامعة العلوم الإسلامية، كراتشي", region: "باكستان" },
  { id: 2, name: "الجمعية الإسلامية لأمريكا الشمالية (ISNA)", region: "أمريكا الشمالية" },
  { id: 3, name: "رابطة العالم الإسلامي", region: "عالمي" },
  { id: 4, name: "جامعة أم القرى، مكة المكرمة", region: "السعودية" },
  { id: 5, name: "الهيئة المصرية العامة للمساحة", region: "مصر" },
  { id: 7, name: "معهد الجيوفيزياء، جامعة طهران", region: "إيران" },
  { id: 8, name: "منطقة الخليج", region: "الخليج العربي" },
  { id: 9, name: "الكويت", region: "الكويت" },
  { id: 10, name: "قطر", region: "قطر" },
  { id: 11, name: "مجلس سنغافورة الإسلامي (MUIS)", region: "سنغافورة" },
  { id: 12, name: "اتحاد المنظمات الإسلامية في فرنسا", region: "فرنسا" },
  { id: 13, name: "إدارة الشؤون الإسلامية والأوقاف، تركيا", region: "تركيا" },
  { id: 14, name: "الإدارة الروحية لمسلمي روسيا", region: "روسيا" },
  { id: 15, name: "وزارة الأوقاف، دبي", region: "الإمارات" },
];

const DEFAULT_LOCATION: Location = { 
  latitude: 21.4225, 
  longitude: 39.8262, 
  city: "مكة المكرمة" 
};

const fetchPrayerTimes = async (
  lat: number, 
  lng: number, 
  date: Date,
  method: number = 4
): Promise<{ timings: PrayerTimesData; hijri: HijriDate }> => {
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  
  const response = await fetch(
    `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
  );
  const data = await response.json();
  return {
    timings: data.data.timings,
    hijri: data.data.date.hijri,
  };
};

// IP-based geolocation fallback
const getLocationByIP = async (): Promise<{ lat: number; lng: number; city: string } | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || "موقعك",
      };
    }
  } catch (error) {
    console.error("IP geolocation failed:", error);
  }
  return null;
};

const PrayerTimesPage = () => {
  const { settings, updateSettings, updateLocation, requestLocation } = useUserSettings();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calculationMethod, setCalculationMethod] = useState<number>(settings.prayer_method || 4);

  const hasLocation = settings.latitude && settings.longitude;

  useEffect(() => {
    if (settings.prayer_method) {
      setCalculationMethod(settings.prayer_method);
    }
  }, [settings.prayer_method]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["prayerTimes", settings.latitude, settings.longitude, selectedDate.toDateString(), calculationMethod],
    queryFn: () => fetchPrayerTimes(settings.latitude!, settings.longitude!, selectedDate, calculationMethod),
    enabled: !!hasLocation,
    staleTime: 1000 * 60 * 60,
  });

  const prayerTimes = data?.timings;
  const hijriDate = data?.hijri;

  // Schedule prayer notifications with adhan
  usePrayerNotifications(prayerTimes ?? null);

  const handleRequestLocation = async () => {
    setIsRequestingLocation(true);
    try {
      const loc = await requestLocation();
      
      // Try to get city name via reverse geocoding
      let cityName = "موقعك الحالي";
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}&accept-language=ar`
        );
        const data = await response.json();
        cityName = data.address?.city || data.address?.town || data.address?.village || cityName;
      } catch (e) {
        console.error("Reverse geocoding failed:", e);
      }
      
      await updateLocation(loc.lat, loc.lng, cityName);
      toast.success("تم تحديث الموقع بنجاح");
    } catch (error) {
      // Try IP-based fallback
      const ipLocation = await getLocationByIP();
      if (ipLocation) {
        await updateLocation(ipLocation.lat, ipLocation.lng, ipLocation.city);
        toast.success("تم تحديد الموقع عبر IP");
      } else {
        toast.error("تعذر الحصول على الموقع. يرجى السماح بالوصول للموقع من إعدادات المتصفح.");
      }
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleMethodChange = (value: string) => {
    const method = parseInt(value);
    setCalculationMethod(method);
    updateSettings({ prayer_method: method });
  };

  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  const getDateLabel = () => {
    if (isToday(selectedDate)) return "اليوم";
    if (isTomorrow(selectedDate)) return "غداً";
    if (isYesterday(selectedDate)) return "أمس";
    return format(selectedDate, "EEEE", { locale: ar });
  };

  const getNextPrayer = () => {
    if (!prayerTimes || !isToday(selectedDate)) return null;
    
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
    if (!prayerTimes || !nextPrayer || !isToday(selectedDate)) return null;
    
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
        {/* Header with Settings */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              مواقيت الصلاة
            </h1>
            {hijriDate && (
              <p className="text-muted-foreground">
                {hijriDate.day} {hijriDate.month.ar} {hijriDate.year} هـ
              </p>
            )}
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="arabic-ui">
              <SheetHeader>
                <SheetTitle>إعدادات المواقيت</SheetTitle>
                <SheetDescription>
                  اختر طريقة الحساب المناسبة لمنطقتك
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">طريقة الحساب</label>
                  <Select value={calculationMethod.toString()} onValueChange={handleMethodChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر طريقة الحساب" />
                    </SelectTrigger>
                    <SelectContent className="arabic-ui max-h-80">
                      {calculationMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id.toString()}>
                          <div className="text-right">
                            <p className="font-medium">{method.name}</p>
                            <p className="text-xs text-muted-foreground">{method.region}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">الموقع الحالي</label>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">{settings.city_name || "غير محدد"}</span>
                    </div>
                    {hasLocation && (
                      <p className="text-xs text-muted-foreground">
                        {settings.latitude?.toFixed(4)}, {settings.longitude?.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleRequestLocation}
                    disabled={isRequestingLocation}
                  >
                    {isRequestingLocation ? "جاري التحديد..." : "تحديث الموقع"}
                  </Button>
                </div>
              </div>
            </SheetContent>
        </Sheet>
        </div>

        {/* Tabs for Daily vs Monthly view */}
        <Tabs defaultValue="daily" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="daily" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>اليوم</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>التقويم الشهري</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-4 space-y-4">
            {/* Date Navigation */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={goToNextDay}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
                
                <div className="text-center flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-bold text-lg text-foreground">{getDateLabel()}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, "d MMMM yyyy", { locale: ar })}
                  </p>
                  {!isToday(selectedDate) && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-primary mt-1 h-auto p-0"
                      onClick={goToToday}
                    >
                      العودة لليوم
                    </Button>
                  )}
                </div>
                
                <Button variant="ghost" size="icon" onClick={goToPreviousDay}>
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>
            </Card>

            {/* Location Card */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {hasLocation ? (settings.city_name || "موقعك") : "لم يتم تحديد الموقع"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calculationMethods.find(m => m.id === calculationMethod)?.name || "جامعة أم القرى"}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => refetch()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Next Prayer Highlight - Only show for today */}
            {prayerTimes && nextPrayer && isToday(selectedDate) && (
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
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
            <div className="grid gap-3">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : (
                prayers.map((prayer) => {
                  const Icon = prayer.icon;
                  const isNext = nextPrayer === prayer.key && isToday(selectedDate);
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

            {/* Notification Settings */}
            <PrayerNotificationSettings />
          </TabsContent>

          <TabsContent value="monthly" className="mt-4">
            <MonthlyCalendar />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PrayerTimesPage;
