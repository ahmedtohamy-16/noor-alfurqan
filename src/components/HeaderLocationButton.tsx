import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import LocationPickerModal from "./LocationPickerModal";
import { arabicCityLabel, hasLocationCoordinates } from "@/lib/cityNames";

const HeaderLocationButton = () => {
  const { settings } = useUserSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasLocation = hasLocationCoordinates(settings.latitude, settings.longitude);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="gap-1.5 text-sm font-medium hover:bg-primary/10 px-2 sm:px-3"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline max-w-[120px] truncate">
          {hasLocation ? arabicCityLabel(settings.city_name) : "لم يتم التحديد"}
        </span>
        <span className="sm:hidden text-xs">
          {hasLocation ? arabicCityLabel(settings.city_name) : "الموقع"}
        </span>
      </Button>

      <LocationPickerModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default HeaderLocationButton;
