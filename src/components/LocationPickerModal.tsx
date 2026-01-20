import { useState } from "react";
import { MapPin, Navigation, ChevronDown, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, prayerMethods, type City } from "@/data/locationData";
import { useUserSettings } from "@/hooks/useUserSettings";

interface LocationPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LocationPickerModal = ({ open, onOpenChange }: LocationPickerModalProps) => {
  const { settings, autoDetectLocation, updateLocation, updateSettings } = useUserSettings();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<number>(settings.prayer_method || 4);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    const success = await autoDetectLocation();
    setIsDetecting(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setSelectedCity(null);
  };

  const handleCitySelect = (cityName: string) => {
    const country = countries.find(c => c.code === selectedCountry);
    const city = country?.cities.find(c => c.name_ar === cityName);
    if (city) {
      setSelectedCity(city);
    }
  };

  const handleConfirm = async () => {
    if (selectedCity) {
      await updateLocation(selectedCity.latitude, selectedCity.longitude, selectedCity.name_ar);
      await updateSettings({ prayer_method: selectedMethod });
      onOpenChange(false);
    }
  };

  const currentCountryCities = countries.find(c => c.code === selectedCountry)?.cities || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md arabic-ui" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            تحديد الموقع
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Auto-detect button */}
          <Button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full gap-2 h-12 text-base"
            variant="default"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري تحديد الموقع...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                تحديد موقعي تلقائياً
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو اختر يدوياً</span>
            </div>
          </div>

          {/* Country selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">الدولة</label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="اختر الدولة" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name_ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City selector */}
          {selectedCountry && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">المدينة</label>
              <Select
                value={selectedCity?.name_ar || ""}
                onValueChange={handleCitySelect}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {currentCountryCities.map((city) => (
                    <SelectItem key={city.name_en} value={city.name_ar}>
                      {city.name_ar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Prayer method selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">طريقة الحساب</label>
            <Select
              value={selectedMethod.toString()}
              onValueChange={(val) => setSelectedMethod(parseInt(val))}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="اختر طريقة الحساب" />
              </SelectTrigger>
              <SelectContent>
                {prayerMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Confirm button */}
          {selectedCity && (
            <Button onClick={handleConfirm} className="w-full gap-2 h-12 text-base">
              <Check className="w-5 h-5" />
              تأكيد الموقع
            </Button>
          )}

          {/* Current location display */}
          {settings.city_name && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">الموقع الحالي:</p>
              <p className="font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                {settings.city_name}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerModal;
