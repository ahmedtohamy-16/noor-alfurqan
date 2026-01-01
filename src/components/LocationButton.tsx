import { useState } from "react";
import { MapPin, Navigation, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import LocationPickerDialog from "./LocationPickerDialog";

const LocationButton = () => {
  const { settings, updateLocation, requestLocation } = useUserSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const hasLocation = settings.latitude && settings.longitude && settings.city_name;

  const handleAutoLocation = async () => {
    setIsLoading(true);
    try {
      const { lat, lng } = await requestLocation();
      // Reverse geocode to get city name
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
      );
      const data = await response.json();
      const cityName = data.city || data.locality || data.principalSubdivision || "موقعك الحالي";
      await updateLocation(lat, lng, cityName);
      setIsDialogOpen(false);
    } catch (error: any) {
      if (error.code === 1) {
        toast.error("تم رفض الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح.");
      } else if (error.code === 2) {
        toast.error("تعذر تحديد الموقع. تأكد من تفعيل خدمات الموقع.");
      } else if (error.code === 3) {
        toast.error("انتهت مهلة تحديد الموقع. حاول مرة أخرى.");
      } else {
        toast.error("تعذر الحصول على الموقع. يرجى السماح بالوصول للموقع.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocation = () => {
    setIsDialogOpen(false);
    setShowPicker(true);
  };

  const handleLocationSelect = (lat: number, lng: number, city: string) => {
    updateLocation(lat, lng, city);
    setShowPicker(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="gap-2 text-sm font-medium"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="max-w-[120px] truncate">
          {hasLocation ? settings.city_name : "الموقع"}
        </span>
      </Button>

      {/* Location Method Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-sm arabic-ui">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center">
              <MapPin className="w-5 h-5 text-primary" />
              {hasLocation ? "تعديل الموقع" : "تحديد الموقع"}
            </DialogTitle>
          </DialogHeader>

          {hasLocation && (
            <div className="bg-primary/10 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">{settings.city_name}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleAutoLocation}
              variant="default"
              className="w-full gap-2 h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              تحديد تلقائي
            </Button>

            <Button
              onClick={handleManualLocation}
              variant="outline"
              className="w-full gap-2 h-12"
              disabled={isLoading}
            >
              <Globe className="w-5 h-5" />
              اختيار يدوي
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Picker Dialog */}
      <LocationPickerDialog
        open={showPicker}
        onOpenChange={setShowPicker}
        onLocationSelect={handleLocationSelect}
      />
    </>
  );
};

export default LocationButton;
