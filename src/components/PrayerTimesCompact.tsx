import { useState, useEffect } from "react";
import { Clock, MapPin, ChevronLeft } from "lucide-react";
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
    "المدينة المنورة": "8097",
    "الرياض": "8089",
    "جدة": "8095",
    "دبي": "8121",
    "أبوظبي": "8120",
    "الكويت": "8174",
    "الدوحة": "8212",
    "عمان": "8158",
  };
  
  const lowerCityName = cityName.toLowerCase();
  for (const [key, value] of Object.entries(cityWidgetMap)) {
    if (lowerCityName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCityName)) {
      return value;
    }
  }
  
  return defaultId;
};

const PrayerTimesCompact = () => {
  const { settings } = useUserSettings();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [widgetId, setWidgetId] = useState<string>("8198");

  const hasLocation = settings.latitude && settings.longitude;

  useEffect(() => {
    const id = getCityWidgetId(settings.city_name || null);
    setWidgetId(id);
  }, [settings.city_name]);

  return (
    <>
      <Link to="/prayer-times">
        <Card className="overflow-hidden arabic-ui hover:shadow-lg transition-shadow cursor-pointer group">
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">مواقيت الصلاة</h3>
            </div>
            <div className="flex items-center gap-2">
              {hasLocation && settings.city_name && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{settings.city_name}</span>
                </div>
              )}
              <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </div>

          {hasLocation ? (
            <div className="w-full" style={{ height: "230px" }}>
              <iframe
                id="prayer-times-compact-widget"
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
          ) : (
            <div 
              className="p-4"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowLocationPrompt(true);
              }}
            >
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      يجب تحديد الموقع أولاً
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      لعرض مواقيت الصلاة الدقيقة
                    </p>
                  </div>
                  <LocationButton />
                </div>
              </div>
            </div>
          )}
        </Card>
      </Link>

      {/* Location prompt dialog */}
      {showLocationPrompt && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLocationPrompt(false)}
        >
          <Card 
            className="p-6 max-w-sm w-full arabic-ui"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-bold text-foreground">تحديد الموقع مطلوب</h3>
              <p className="text-sm text-muted-foreground mt-2">
                يجب تحديد موقعك أولاً لعرض مواقيت الصلاة الدقيقة لمنطقتك
              </p>
            </div>
            <div className="flex justify-center">
              <LocationButton />
            </div>
            <button
              onClick={() => setShowLocationPrompt(false)}
              className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              إغلاق
            </button>
          </Card>
        </div>
      )}
    </>
  );
};

export default PrayerTimesCompact;
