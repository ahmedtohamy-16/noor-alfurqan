import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface UserSettings {
  latitude: number | null;
  longitude: number | null;
  city_name: string | null;
  notifications_enabled: boolean;
  daily_wird_enabled: boolean;
  daily_wird_time: string;
  prayer_method: number;
}

const defaultSettings: UserSettings = {
  latitude: null,
  longitude: null,
  city_name: null,
  notifications_enabled: false,
  daily_wird_enabled: false,
  daily_wird_time: "06:00:00",
  prayer_method: 4, // Default: Umm Al-Qura
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      // Load from localStorage for non-authenticated users
      const saved = localStorage.getItem("userSettings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
      setIsLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching settings:", error);
      }

      if (data) {
        setSettings({
          latitude: data.latitude,
          longitude: data.longitude,
          city_name: data.city_name,
          notifications_enabled: data.notifications_enabled || false,
          daily_wird_enabled: data.daily_wird_enabled || false,
          daily_wird_time: data.daily_wird_time || "06:00:00",
          prayer_method: data.prayer_method || 4,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (user) {
      try {
        const { error } = await supabase
          .from("user_settings")
          .upsert({
            user_id: user.id,
            ...updated,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (error) throw error;
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error("حدث خطأ في حفظ الإعدادات");
      }
    } else {
      localStorage.setItem("userSettings", JSON.stringify(updated));
    }
  };

  const updateLocation = async (lat: number, lng: number, cityName?: string) => {
    await updateSettings({
      latitude: lat,
      longitude: lng,
      city_name: cityName || null,
    });
    toast.success("تم تحديث الموقع بنجاح");
  };

  const requestLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("الموقع غير مدعوم"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  return {
    settings,
    isLoading,
    updateSettings,
    updateLocation,
    requestLocation,
    refetch: fetchSettings,
  };
};
