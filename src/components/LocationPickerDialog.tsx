import { useState, useEffect } from "react";
import { ChevronRight, MapPin, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Country {
  id: string;
  name_ar: string;
  name_en: string;
  code: string;
}

interface City {
  id: string;
  name_ar: string;
  name_en: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number, city: string) => void;
}

type Step = "country" | "city";

const LocationPickerDialog = ({
  open,
  onOpenChange,
  onLocationSelect,
}: LocationPickerDialogProps) => {
  const [step, setStep] = useState<Step>("country");
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCountries();
      setStep("country");
      setSelectedCountry(null);
      setSearchQuery("");
    }
  }, [open]);

  const fetchCountries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name_ar");
      
      if (error) throw error;
      setCountries(data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCities = async (countryId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("country_id", countryId)
        .order("name_ar");
      
      if (error) throw error;
      setCities(data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setStep("city");
    setSearchQuery("");
    fetchCities(country.id);
  };

  const handleCitySelect = (city: City) => {
    onLocationSelect(city.latitude, city.longitude, city.name_ar);
  };

  const handleBack = () => {
    setStep("country");
    setSelectedCountry(null);
    setSearchQuery("");
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name_ar.includes(searchQuery) ||
      c.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCities = cities.filter(
    (c) =>
      c.name_ar.includes(searchQuery) ||
      c.name_en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md arabic-ui">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {step === "country" ? "اختر الدولة" : `اختر المدينة - ${selectedCountry?.name_ar}`}
          </DialogTitle>
        </DialogHeader>

        {step === "city" && (
          <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2 w-fit">
            <ChevronRight className="w-4 h-4 ml-1" />
            العودة للدول
          </Button>
        )}

        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={step === "country" ? "ابحث عن دولة..." : "ابحث عن مدينة..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : step === "country" ? (
            <div className="space-y-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleCountrySelect(country)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors text-right"
                >
                  <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
                  <span className="font-medium text-foreground">{country.name_ar}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  لم يتم العثور على نتائج
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors text-right"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{city.name_ar}</span>
                </button>
              ))}
              {filteredCities.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  لا توجد مدن مسجلة لهذه الدولة
                </p>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerDialog;
