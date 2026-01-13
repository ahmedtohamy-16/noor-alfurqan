import { useState } from "react";
import { MapPin, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import PrayerTimesWidget from "@/components/PrayerTimesWidget";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

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
  const { settings, updateLocation, requestLocation } = useUserSettings();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const hasLocation = settings.latitude && settings.longitude;

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Header with Settings */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
              مواقيت الصلاة
            </h1>
            <p className="text-muted-foreground text-sm">
              أوقات الصلاة لمنطقتك
            </p>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2 className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="arabic-ui">
              <SheetHeader>
                <SheetTitle>إعدادات الموقع</SheetTitle>
                <SheetDescription>
                  حدد موقعك لعرض مواقيت الصلاة الدقيقة
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6">
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
                    {isRequestingLocation ? "جاري التحديد..." : "تحديث الموقع تلقائياً"}
                  </Button>
                  <div className="flex justify-center">
                    <LocationButton />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Location Card */}
        {hasLocation && (
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {settings.city_name || "موقعك"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    الموقع المحدد
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRequestLocation}
                disabled={isRequestingLocation}
              >
                تحديث
              </Button>
            </div>
          </Card>
        )}

        {/* Prayer Times Widget */}
        <PrayerTimesWidget height={450} />
        
        {/* Info Card */}
        <Card className="p-4 mt-4 bg-muted/30">
          <p className="text-sm text-muted-foreground text-center">
            مواقيت الصلاة مقدمة من timesprayer.today
          </p>
        </Card>
      </main>
    </div>
  );
};

export default PrayerTimesPage;
