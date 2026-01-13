import { useState, useEffect } from "react";
import { Clock, MapPin, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Link } from "react-router-dom";
import LocationButton from "./LocationButton";

// Get widget ID based on city
const getCityWidgetId = (cityName: string | null): string => {
  const defaultId = "8198";
  
  if (!cityName) return defaultId;
  
  const cityWidgetMap: Record<string, string> = {
    "القاهرة": "8198",
    "cairo": "8198",
    "الإسكندرية": "8199",
    "مكة المكرمة": "8096",
    "mecca": "8096",
    "المدينة المنورة": "8097",
    "الرياض": "8089",
    "جدة": "8095",
    "دبي": "8121",
    "أبوظبي": "8120",
    "الكويت": "8174",
    "الدوحة": "8212",
    "عمان": "8158",
    "غزة": "8210",
    "القدس": "8209",
  };
  
  const lowerCityName = cityName.toLowerCase();
  for (const [key, value] of Object.entries(cityWidgetMap)) {
    if (lowerCityName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCityName)) {
      return value;
    }
  }
  
  return defaultId;
};

const NextPrayerWidgetEnhanced = () => {
  const { settings } = useUserSettings();
  const [widgetId, setWidgetId] = useState<string>("8198");

  const hasLocation = settings.latitude && settings.longitude;

  useEffect(() => {
    const id = getCityWidgetId(settings.city_name || null);
    setWidgetId(id);
  }, [settings.city_name]);

  // No location set - show prompt
  if (!hasLocation) {
    return (
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">مواقيت الصلاة</p>
              <p className="font-bold text-foreground">يجب تحديد الموقع أولاً</p>
              <p className="text-xs text-muted-foreground mt-1">لعرض أوقات الصلاة الدقيقة</p>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <LocationButton />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Link to="/prayer-times">
      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer">
        {settings.city_name && (
          <div className="flex items-center gap-2 p-2 bg-muted/30 border-b">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-foreground">{settings.city_name}</span>
            <Clock className="w-3 h-3 text-muted-foreground mr-auto" />
            <span className="text-xs text-muted-foreground">اضغط للتفاصيل</span>
          </div>
        )}
        <div className="w-full" style={{ height: "280px" }}>
          <iframe
            id="prayer-widget-home"
            style={{
              background: "transparent",
              border: "0",
              width: "100%",
              overflow: "hidden",
              height: "100%",
            }}
            src={`https://timesprayer.today/widget_frame.php?frame=2&id=${widgetId}&sound=false`}
            title="مواقيت الصلاة"
            loading="lazy"
          />
        </div>
      </Card>
    </Link>
  );
};

export default NextPrayerWidgetEnhanced;
