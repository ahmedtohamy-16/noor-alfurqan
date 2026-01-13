import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { useUserSettings } from "@/hooks/useUserSettings";
import LocationButton from "./LocationButton";

// Widget IDs based on major cities - can be expanded
const getCityWidgetId = (cityName: string | null, lat: number | null, lng: number | null): string => {
  // Default widget ID (Cairo, Egypt)
  const defaultId = "8198";
  
  if (!cityName && !lat && !lng) return defaultId;
  
  // Map of known cities to their timesprayer.today widget IDs
  // You can add more cities as needed
  const cityWidgetMap: Record<string, string> = {
    // Egypt
    "القاهرة": "8198",
    "cairo": "8198",
    "الإسكندرية": "8199",
    "alexandria": "8199",
    "الجيزة": "8198",
    "giza": "8198",
    // Saudi Arabia
    "مكة المكرمة": "8096",
    "mecca": "8096",
    "makkah": "8096",
    "المدينة المنورة": "8097",
    "medina": "8097",
    "madinah": "8097",
    "الرياض": "8089",
    "riyadh": "8089",
    "جدة": "8095",
    "jeddah": "8095",
    // UAE
    "دبي": "8121",
    "dubai": "8121",
    "أبوظبي": "8120",
    "abu dhabi": "8120",
    // Kuwait
    "الكويت": "8174",
    "kuwait": "8174",
    // Qatar
    "الدوحة": "8212",
    "doha": "8212",
    // Jordan
    "عمان": "8158",
    "amman": "8158",
    // Palestine
    "غزة": "8210",
    "gaza": "8210",
    "القدس": "8209",
    "jerusalem": "8209",
    // Morocco
    "الرباط": "8189",
    "rabat": "8189",
    "الدار البيضاء": "8185",
    "casablanca": "8185",
    // Algeria
    "الجزائر": "8130",
    "algiers": "8130",
    // Tunisia
    "تونس": "8227",
    "tunis": "8227",
    // Iraq
    "بغداد": "8144",
    "baghdad": "8144",
    // Syria
    "دمشق": "8223",
    "damascus": "8223",
    // Lebanon
    "بيروت": "8178",
    "beirut": "8178",
    // Turkey
    "إسطنبول": "8231",
    "istanbul": "8231",
    "أنقرة": "8228",
    "ankara": "8228",
    // Indonesia
    "جاكرتا": "8138",
    "jakarta": "8138",
    // Malaysia
    "كوالالمبور": "8181",
    "kuala lumpur": "8181",
  };
  
  if (cityName) {
    const lowerCityName = cityName.toLowerCase();
    for (const [key, value] of Object.entries(cityWidgetMap)) {
      if (lowerCityName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCityName)) {
        return value;
      }
    }
  }
  
  // Return default if no match found
  return defaultId;
};

interface PrayerTimesWidgetProps {
  showLocationButton?: boolean;
  height?: number;
}

const PrayerTimesWidget = ({ showLocationButton = true, height = 320 }: PrayerTimesWidgetProps) => {
  const { settings } = useUserSettings();
  const [widgetId, setWidgetId] = useState<string>("8198");
  
  const hasLocation = settings.latitude && settings.longitude;

  useEffect(() => {
    const id = getCityWidgetId(settings.city_name || null, settings.latitude || null, settings.longitude || null);
    setWidgetId(id);
  }, [settings.city_name, settings.latitude, settings.longitude]);

  // No location set - show prompt
  if (!hasLocation && showLocationButton) {
    return (
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-foreground">مواقيت الصلاة</p>
            <p className="text-sm text-muted-foreground">يجب تحديد الموقع أولاً</p>
          </div>
        </div>
        <div className="flex justify-center">
          <LocationButton />
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {settings.city_name && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 border-b">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{settings.city_name}</span>
        </div>
      )}
      <div className="w-full" style={{ height: `${height}px` }}>
        <iframe
          id="prayer-times-widget"
          style={{
            background: "transparent",
            border: "0",
            width: "100%",
            overflow: "hidden",
            height: "100%",
          }}
          src={`https://timesprayer.today/widget_frame.php?frame=2&id=${widgetId}&sound=true`}
          title="مواقيت الصلاة"
          loading="lazy"
        />
      </div>
    </Card>
  );
};

export default PrayerTimesWidget;
