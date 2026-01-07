import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, city: string) => void;
  currentCity?: string;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

const LocationPicker = ({ onLocationSelect, currentCity }: LocationPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; city: string } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [39.8262, 21.4225], // Mecca default
      zoom: 5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    const marker = new mapboxgl.Marker({ draggable: true, color: "#4A6C61" });

    map.on("click", async (e) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]).addTo(map);
      
      // Reverse geocode
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=ar`
        );
        const data = await response.json();
        const placeName = data.features[0]?.place_name || "موقع محدد";
        const cityName = data.features[0]?.context?.find((c: any) => c.id.includes("place"))?.text || 
                         data.features[0]?.text || "موقع محدد";
        
        setSelectedLocation({ lat, lng, city: cityName });
      } catch {
        setSelectedLocation({ lat, lng, city: "موقع محدد" });
      }
    });

    marker.on("dragend", async () => {
      const { lng, lat } = marker.getLngLat();
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=ar`
        );
        const data = await response.json();
        const cityName = data.features[0]?.context?.find((c: any) => c.id.includes("place"))?.text || 
                         data.features[0]?.text || "موقع محدد";
        setSelectedLocation({ lat, lng, city: cityName });
      } catch {
        setSelectedLocation({ lat, lng, city: "موقع محدد" });
      }
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
    };
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&language=ar&types=place,locality,neighborhood`
      );
      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      toast.error("خطأ في البحث");
    }
    setIsLoading(false);
  };

  const handleResultClick = (result: any) => {
    const [lng, lat] = result.center;
    const cityName = result.text || result.place_name;
    
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom: 12 });
      markerRef.current.setLngLat([lng, lat]).addTo(mapRef.current);
    }
    
    setSelectedLocation({ lat, lng, city: cityName });
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleAutoLocation = () => {
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({ center: [lng, lat], zoom: 12 });
          markerRef.current.setLngLat([lng, lat]).addTo(mapRef.current);
        }

        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&language=ar`
          );
          const data = await response.json();
          const cityName = data.features[0]?.context?.find((c: any) => c.id.includes("place"))?.text || 
                           data.features[0]?.text || "موقعك الحالي";
          setSelectedLocation({ lat, lng, city: cityName });
        } catch {
          setSelectedLocation({ lat, lng, city: "موقعك الحالي" });
        }
        
        setIsLoading(false);
      },
      () => {
        toast.error("لم نتمكن من تحديد موقعك. تأكد من تفعيل خدمات الموقع.");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.lat, selectedLocation.lng, selectedLocation.city);
      setIsOpen(false);
      toast.success(`تم تحديد الموقع: ${selectedLocation.city}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <MapPin className="w-4 h-4" />
          {currentCity || "تحديد الموقع"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col arabic-ui p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle>تحديد موقعك</DialogTitle>
        </DialogHeader>

        <div className="p-4 pt-0 space-y-3">
          {/* Search */}
          <div className="flex gap-2">
            <Input
              placeholder="ابحث عن مدينة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Auto location button */}
          <Button variant="secondary" className="w-full gap-2" onClick={handleAutoLocation} disabled={isLoading}>
            <Navigation className="w-4 h-4" />
            استخدام موقعي الحالي
          </Button>

          {/* Search results */}
          {searchResults.length > 0 && (
            <Card className="p-2 max-h-32 overflow-y-auto">
              {searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-right p-2 hover:bg-muted rounded-lg transition-colors text-sm"
                >
                  {result.place_name}
                </button>
              ))}
            </Card>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainerRef} className="absolute inset-0" />
        </div>

        {/* Selected location & confirm */}
        {selectedLocation && (
          <div className="p-4 border-t bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedLocation.city}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
              <Button onClick={handleConfirm}>تأكيد الموقع</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;
