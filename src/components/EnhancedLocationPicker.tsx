import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Place {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

interface EnhancedLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number, city: string) => void;
}

const EnhancedLocationPicker = ({
  open,
  onOpenChange,
  onLocationSelect,
}: EnhancedLocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Popular cities for quick selection
  const popularCities = [
    { name: "مكة المكرمة", lat: 21.4225, lng: 39.8262 },
    { name: "المدينة المنورة", lat: 24.5247, lng: 39.5692 },
    { name: "القاهرة", lat: 30.0444, lng: 31.2357 },
    { name: "الرياض", lat: 24.7136, lng: 46.6753 },
    { name: "جدة", lat: 21.4858, lng: 39.1925 },
    { name: "دبي", lat: 25.2048, lng: 55.2708 },
    { name: "عمّان", lat: 31.9454, lng: 35.9284 },
    { name: "بيروت", lat: 33.8938, lng: 35.5018 },
    { name: "الإسكندرية", lat: 31.2001, lng: 29.9187 },
    { name: "الدوحة", lat: 25.2854, lng: 51.5310 },
    { name: "الكويت", lat: 29.3759, lng: 47.9774 },
    { name: "مسقط", lat: 23.5880, lng: 58.3829 },
  ];

  const searchPlaces = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Using Nominatim (OpenStreetMap) - free and reliable
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=15&accept-language=ar&addressdetails=1`
      );
      
      if (!response.ok) throw new Error("Search failed");
      
      const data: Place[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error searching places:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchPlaces(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  const handleSelectPlace = (place: Place) => {
    const cityName = 
      place.address?.city || 
      place.address?.town || 
      place.address?.village || 
      place.display_name.split(",")[0];
    
    onLocationSelect(parseFloat(place.lat), parseFloat(place.lon), cityName);
  };

  const handleSelectPopular = (city: typeof popularCities[0]) => {
    onLocationSelect(city.lat, city.lng, city.name);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setHasSearched(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md arabic-ui max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            اختر موقعك
          </DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن مدينة أو قرية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 pl-10"
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSearch}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="mr-2 text-muted-foreground">جاري البحث...</span>
            </div>
          ) : hasSearched && results.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-2 px-1">
                نتائج البحث ({results.length})
              </p>
              {results.map((place) => (
                <button
                  key={place.place_id}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent/10 transition-colors text-right"
                >
                  <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {place.address?.city || place.address?.town || place.address?.village || place.display_name.split(",")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {place.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : hasSearched && results.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-muted-foreground">لم يتم العثور على نتائج</p>
              <p className="text-xs text-muted-foreground mt-1">
                جرب البحث باسم آخر أو اختر من المدن الشائعة
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-3">
                  المدن الشائعة
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {popularCities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => handleSelectPopular(city)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent/10 hover:border-primary/30 transition-all text-right"
                    >
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">
                        {city.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  💡 يمكنك البحث عن أي مدينة أو قرية في العالم
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedLocationPicker;
