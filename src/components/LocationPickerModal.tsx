import { useState } from "react";
import { MapPin, Navigation, Loader2, Check, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

// Madhab options
const madhabs = [
  { id: 0, name: "شافعي / مالكي / حنبلي (العصر عند ظل المثل)" },
  { id: 1, name: "حنفي (العصر عند ظل المثلين)" },
];

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
  const [selectedMadhab, setSelectedMadhab] = useState<number>(settings.prayer_madhab || 0);

  const hasCurrentLocation = settings.city_name && settings.latitude && settings.longitude;

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
      await updateSettings({ prayer_method: selectedMethod, prayer_madhab: selectedMadhab });
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
          <DialogDescription className="text-sm text-muted-foreground">
            {hasCurrentLocation
              ? "إذا كان هذا الموقع خاطئاً أو انتقلت لمكان آخر، يمكنك تحديثه الآن لضمان دقة المواعيد."
              : "حدد موقعك للحصول على مواقيت الصلاة الدقيقة لمنطقتك."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Current location display - show at top if exists */}
          {hasCurrentLocation && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">موقعك الحالي:</p>
              </div>
              <p className="font-bold text-lg text-foreground">{settings.city_name}</p>
            </div>
          )}

          {/* No location warning */}
          {!hasCurrentLocation && (
            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">لم يتم تحديد الموقع</p>
                <p className="text-sm text-muted-foreground">
                  يجب تحديد موقعك لعرض مواقيت الصلاة بدقة
                </p>
              </div>
            </div>
          )}

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
                تحديد تلقائي (GPS)
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">أو تحديد يدوي</span>
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

          {/* Madhab selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">مذهب صلاة العصر</label>
            <Select
              value={selectedMadhab.toString()}
              onValueChange={(val) => setSelectedMadhab(parseInt(val))}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="اختر المذهب" />
              </SelectTrigger>
              <SelectContent>
                {madhabs.map((madhab) => (
                  <SelectItem key={madhab.id} value={madhab.id.toString()}>
                    {madhab.name}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerModal;
