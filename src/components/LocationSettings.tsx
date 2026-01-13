import { useState } from "react";
import { MapPin, Navigation, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import LocationPickerDialog from "./LocationPickerDialog";

const LocationSettings = () => {
  const { settings, autoDetectLocation, updateLocation } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAutoLocation = async () => {
    setIsLoading(true);
    try {
      await autoDetectLocation();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 arabic-ui">
      {settings.city_name && (
        <div className="bg-primary/10 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">الموقع الحالي</p>
              <p className="font-medium text-foreground">{settings.city_name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          onClick={handleAutoLocation}
          variant="outline"
          className="w-full gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          تحديد موقعي تلقائياً
        </Button>

        <Button
          onClick={() => setIsDialogOpen(true)}
          variant="secondary"
          className="w-full gap-2"
        >
          <Globe className="w-4 h-4" />
          اختيار المدينة يدوياً
        </Button>
      </div>

      <LocationPickerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onLocationSelect={(lat, lng, city) => {
          updateLocation(lat, lng, city);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
};

export default LocationSettings;
