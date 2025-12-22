import { useState } from "react";
import { MapPin, Navigation, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

// Common cities
const cities = [
  { name: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
  { name: "المدينة المنورة", lat: 24.5247, lng: 39.5692 },
  { name: "الرياض", lat: 24.7136, lng: 46.6753 },
  { name: "جدة", lat: 21.5433, lng: 39.1728 },
  { name: "القاهرة", lat: 30.0444, lng: 31.2357 },
  { name: "دبي", lat: 25.2048, lng: 55.2708 },
  { name: "الكويت", lat: 29.3759, lng: 47.9774 },
  { name: "عمّان", lat: 31.9454, lng: 35.9284 },
  { name: "بيروت", lat: 33.8938, lng: 35.5018 },
  { name: "الدوحة", lat: 25.2854, lng: 51.5310 },
];

const LocationSettings = () => {
  const { settings, updateLocation, requestLocation } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAutoLocation = async () => {
    setIsLoading(true);
    try {
      const { lat, lng } = await requestLocation();
      await updateLocation(lat, lng, "موقعك الحالي");
    } catch (error) {
      toast.error("تعذر الحصول على الموقع. يرجى السماح بالوصول للموقع.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCitySelect = async (city: typeof cities[0]) => {
    await updateLocation(city.lat, city.lng, city.name);
  };

  const filteredCities = cities.filter((city) =>
    city.name.includes(searchQuery)
  );

  return (
    <Card className="p-4 arabic-ui">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">الموقع</h3>
      </div>

      {settings.city_name && (
        <div className="bg-primary/10 rounded-lg p-3 mb-4">
          <p className="text-sm text-muted-foreground">الموقع الحالي</p>
          <p className="font-medium text-foreground">{settings.city_name}</p>
        </div>
      )}

      <Button
        onClick={handleAutoLocation}
        variant="outline"
        className="w-full mb-4 gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Navigation className="w-4 h-4" />
        )}
        استخدام موقعي الحالي
      </Button>

      <div className="relative mb-3">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن مدينة..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {filteredCities.map((city) => (
          <Button
            key={city.name}
            variant={settings.city_name === city.name ? "default" : "outline"}
            size="sm"
            onClick={() => handleCitySelect(city)}
            className="text-xs"
          >
            {city.name}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default LocationSettings;
