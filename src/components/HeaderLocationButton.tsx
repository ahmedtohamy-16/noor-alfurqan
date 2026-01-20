import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import LocationPickerModal from "./LocationPickerModal";

const HeaderLocationButton = () => {
  const { settings } = useUserSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="gap-1.5 text-sm font-medium hover:bg-primary/10 px-2 sm:px-3"
      >
        <MapPin className="w-4 h-4 text-primary" />
        <span className="hidden sm:inline max-w-[100px] truncate">
          {settings.city_name || "لم يتم التحديد"}
        </span>
        <span className="sm:hidden">
          {settings.city_name ? "📍" : "📍"}
        </span>
      </Button>

      <LocationPickerModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};

export default HeaderLocationButton;
