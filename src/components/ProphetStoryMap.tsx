import { useEffect, useRef, useState } from 'react';
import { MapPin, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ProphetLocationData, ProphetLocation } from '@/data/prophetLocations';

interface ProphetStoryMapProps {
  locationData: ProphetLocationData;
  isRTL: boolean;
}

const ProphetStoryMap = ({ locationData, isRTL }: ProphetStoryMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<ProphetLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Simple static map display without Mapbox (no API key required)
  useEffect(() => {
    if (mapRef.current) {
      setMapLoaded(true);
    }
  }, []);

  const handleLocationClick = (location: ProphetLocation) => {
    setSelectedLocation(selectedLocation?.id === location.id ? null : location);
  };

  if (mapError) {
    return (
      <Card className="mt-6 bg-muted/50">
        <CardContent className="p-6 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            {isRTL ? 'الخريطة غير متوفرة حالياً' : 'Map not available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 overflow-hidden bg-blue-500/5 border-blue-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <CardTitle className="text-lg">
            {isRTL ? 'الأماكن المذكورة في القصة' : 'Locations in the Story'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Map Container with static background */}
        <div 
          ref={mapRef}
          className="relative w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 overflow-hidden"
        >
          {/* Static Map Background */}
          <div className="absolute inset-0 opacity-30">
            <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              {/* Simple map representation */}
              <rect fill="hsl(var(--muted))" width="400" height="200"/>
              <ellipse cx="200" cy="100" rx="180" ry="80" fill="hsl(var(--primary) / 0.1)" />
              <ellipse cx="150" cy="80" rx="40" ry="30" fill="hsl(var(--primary) / 0.15)" />
              <ellipse cx="280" cy="120" rx="50" ry="25" fill="hsl(var(--primary) / 0.15)" />
            </svg>
          </div>

          {/* Location Markers */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {locationData.locations.map((location, index) => {
                // Calculate relative positions based on coordinates
                const normalizedLat = ((location.coordinates.lat - 20) / 25) * 100;
                const normalizedLng = ((location.coordinates.lng - 30) / 30) * 100;
                const top = Math.max(10, Math.min(80, 100 - normalizedLat));
                const left = Math.max(10, Math.min(85, normalizedLng));

                return (
                  <button
                    key={location.id}
                    onClick={() => handleLocationClick(location)}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10
                      ${selectedLocation?.id === location.id 
                        ? 'scale-125 z-20' 
                        : 'hover:scale-110'
                      }`}
                    style={{ top: `${top}%`, left: `${left}%` }}
                    title={isRTL ? location.name.ar : location.name.en}
                  >
                    <div className={`relative ${selectedLocation?.id === location.id ? 'animate-pulse' : ''}`}>
                      <MapPin 
                        className={`w-8 h-8 drop-shadow-lg transition-colors
                          ${selectedLocation?.id === location.id 
                            ? 'text-primary fill-primary/30' 
                            : 'text-blue-600 dark:text-blue-400 fill-blue-200 dark:fill-blue-800'
                          }`}
                      />
                      <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-background/90 px-2 py-0.5 rounded shadow-sm border">
                        {isRTL ? location.name.ar : location.name.en}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compass */}
          <div className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md border">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-foreground">
              <path fill="currentColor" d="M12 2L8 10l4 2 4-2-4-8zm0 20l4-8-4-2-4 2 4 8z"/>
              <circle cx="12" cy="12" r="2" fill="currentColor" opacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* Location Details */}
        {selectedLocation && (
          <div className="p-4 bg-background border-t animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                    <MapPin className="w-3 h-3 mr-1" />
                    {isRTL ? selectedLocation.name.ar : selectedLocation.name.en}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? selectedLocation.description.ar : selectedLocation.description.en}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {selectedLocation.coordinates.lat.toFixed(4)}°, {selectedLocation.coordinates.lng.toFixed(4)}°
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setSelectedLocation(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Location List */}
        <div className="p-4 bg-muted/30 border-t">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {isRTL ? 'اضغط على المواقع لعرض التفاصيل' : 'Click locations for details'}
          </p>
          <div className="flex flex-wrap gap-2">
            {locationData.locations.map((location) => (
              <Badge
                key={location.id}
                variant={selectedLocation?.id === location.id ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => handleLocationClick(location)}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {isRTL ? location.name.ar : location.name.en}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProphetStoryMap;
