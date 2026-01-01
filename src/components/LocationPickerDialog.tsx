import { useState, useEffect } from "react";
import { Search, MapPin, Loader2, ChevronRight, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

// Using dr5hn countries-states-cities-database via jsDelivr CDN
const CDN_BASE = "https://cdn.jsdelivr.net/gh/dr5hn/countries-states-cities-database@master";

interface Country {
  id: number;
  name: string;
  iso2: string;
  translations: { ar?: string };
  latitude: string;
  longitude: string;
}

interface State {
  id: number;
  name: string;
  country_id: number;
  country_code: string;
  state_code: string;
  latitude: string;
  longitude: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
  state_code: string;
  country_id: number;
  country_code: string;
  latitude: string;
  longitude: string;
}

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number, city: string) => void;
}

type Step = "country" | "state" | "city";

// Cache for API responses
let countriesCache: Country[] | null = null;
let statesCache: State[] | null = null;
let citiesCache: City[] | null = null;

const LocationPickerDialog = ({
  open,
  onOpenChange,
  onLocationSelect,
}: LocationPickerDialogProps) => {
  const [step, setStep] = useState<Step>("country");
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    if (open && countries.length === 0) {
      fetchCountries();
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setStep("country");
      setSelectedCountry(null);
      setSelectedState(null);
      setSearchQuery("");
      setStates([]);
      setCities([]);
    }
  }, [open]);

  const fetchCountries = async () => {
    if (countriesCache) {
      setCountries(countriesCache);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${CDN_BASE}/json/countries.json`);
      const data: Country[] = await response.json();
      // Sort by Arabic name if available, otherwise by English name
      const sorted = data.sort((a, b) => {
        const nameA = a.translations?.ar || a.name;
        const nameB = b.translations?.ar || b.name;
        return nameA.localeCompare(nameB, 'ar');
      });
      countriesCache = sorted;
      setCountries(sorted);
    } catch (error) {
      console.error("Error fetching countries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStates = async (countryCode: string) => {
    setIsLoading(true);
    try {
      if (!statesCache) {
        const response = await fetch(`${CDN_BASE}/json/states.json`);
        statesCache = await response.json();
      }
      
      const filtered = statesCache!
        .filter(s => s.country_code === countryCode)
        .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      setStates(filtered);
    } catch (error) {
      console.error("Error fetching states:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCities = async (countryCode: string, stateId: number) => {
    setIsLoading(true);
    try {
      if (!citiesCache) {
        const response = await fetch(`${CDN_BASE}/json/cities.json`);
        citiesCache = await response.json();
      }
      
      const filtered = citiesCache!
        .filter(c => c.country_code === countryCode && c.state_id === stateId)
        .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      setCities(filtered);
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountrySelect = async (country: Country) => {
    setSelectedCountry(country);
    setSearchQuery("");
    await fetchStates(country.iso2);
    setStep("state");
  };

  const handleStateSelect = async (state: State) => {
    setSelectedState(state);
    setSearchQuery("");
    await fetchCities(selectedCountry!.iso2, state.id);
    setStep("city");
  };

  const handleCitySelect = (city: City) => {
    onLocationSelect(
      parseFloat(city.latitude),
      parseFloat(city.longitude),
      city.name
    );
    onOpenChange(false);
  };

  const handleSelectStateAsLocation = (state: State) => {
    onLocationSelect(
      parseFloat(state.latitude),
      parseFloat(state.longitude),
      state.name
    );
    onOpenChange(false);
  };

  const handleBack = () => {
    setSearchQuery("");
    if (step === "city") {
      setStep("state");
      setCities([]);
      setSelectedState(null);
    } else if (step === "state") {
      setStep("country");
      setStates([]);
      setSelectedCountry(null);
    }
  };

  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase().trim();
    if (step === "country") {
      return countries.filter(c => 
        c.name.toLowerCase().includes(query) ||
        (c.translations?.ar || "").includes(query)
      );
    } else if (step === "state") {
      return states.filter(s => s.name.toLowerCase().includes(query));
    } else {
      return cities.filter(c => c.name.toLowerCase().includes(query));
    }
  };

  const filteredItems = getFilteredItems();

  const getStepTitle = () => {
    if (step === "country") return "اختر الدولة";
    if (step === "state") return `اختر المحافظة`;
    return `اختر المدينة`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md arabic-ui max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        {/* Breadcrumb */}
        {step !== "country" && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
            <Button variant="ghost" size="sm" onClick={handleBack} className="h-auto p-1">
              <ArrowRight className="w-4 h-4" />
            </Button>
            <span className="font-medium">{selectedCountry?.translations?.ar || selectedCountry?.name}</span>
            {step === "city" && (
              <>
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span className="font-medium">{selectedState?.name}</span>
              </>
            )}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={
              step === "country" ? "ابحث عن دولة..." :
              step === "state" ? "ابحث عن محافظة..." :
              "ابحث عن مدينة..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
            autoFocus
          />
        </div>

        <ScrollArea className="h-[350px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground">جاري التحميل...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">لم يتم العثور على نتائج</p>
            </div>
          ) : (
            <div className="space-y-1">
              {step === "country" && (filteredItems as Country[]).map((country) => (
                <button
                  key={country.id}
                  onClick={() => handleCountrySelect(country)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        {country.translations?.ar || country.name}
                      </p>
                      {country.translations?.ar && (
                        <p className="text-xs text-muted-foreground">{country.name}</p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
                </button>
              ))}

              {step === "state" && (filteredItems as State[]).map((state) => (
                <button
                  key={state.id}
                  onClick={() => handleStateSelect(state)}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors text-right"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <p className="font-medium text-foreground">{state.name}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />
                </button>
              ))}

              {step === "city" && (filteredItems as City[]).map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors text-right"
                >
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <p className="font-medium text-foreground">{city.name}</p>
                </button>
              ))}
            </div>
          )}

          {/* Option to use state location if no cities */}
          {step === "city" && !isLoading && cities.length === 0 && selectedState && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                لا توجد مدن متاحة لهذه المحافظة
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSelectStateAsLocation(selectedState)}
              >
                استخدم موقع المحافظة: {selectedState.name}
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerDialog;
