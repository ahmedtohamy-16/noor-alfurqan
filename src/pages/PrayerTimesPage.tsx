import { useState } from "react";
import { MapPin, Settings2, Loader2 } from "lucide-react";
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
import LocationSettings from "@/components/LocationSettings";
import PrayerTimesWidget from "@/components/PrayerTimesWidget";
import { useUserSettings } from "@/hooks/useUserSettings";

const PrayerTimesPage = () => {
  const { settings, autoDetectLocation } = useUserSettings();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const hasLocation = settings.latitude && settings.longitude;

  const handleRequestLocation = async () => {
    setIsRequestingLocation(true);
    try {
      await autoDetectLocation();
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
              <div className="py-6">
                <LocationSettings />
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
                {isRequestingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "تحديث"
                )}
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
