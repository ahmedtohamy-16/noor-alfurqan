import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { 
  firestoreGet, 
  firestoreSet, 
  COLLECTIONS, 
  Timestamp 
} from "@/lib/firebase";

interface UserSettings {
  latitude: number | null;
  longitude: number | null;
  city_name: string | null;
  timezone: string;
  notifications_enabled: boolean;
  daily_wird_enabled: boolean;
  daily_wird_time: string;
  prayer_method: number;
  prayer_reminder_minutes: number;
  // Prayer notification settings
  adhan_sound: string;
  prayer_fajr_enabled: boolean;
  prayer_dhuhr_enabled: boolean;
  prayer_asr_enabled: boolean;
  prayer_maghrib_enabled: boolean;
  prayer_isha_enabled: boolean;
  // Azkar notification settings
  azkar_morning_enabled: boolean;
  azkar_morning_time: string;
  azkar_evening_enabled: boolean;
  azkar_evening_time: string;
  azkar_sleep_enabled: boolean;
  azkar_sleep_time: string;
  azkar_wakeup_enabled: boolean;
  azkar_wakeup_time: string;
  azkar_prayer_enabled: boolean;
  azkar_prayer_delay_minutes: number;
}

const defaultSettings: UserSettings = {
  latitude: null,
  longitude: null,
  city_name: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  notifications_enabled: false,
  daily_wird_enabled: false,
  daily_wird_time: "06:00:00",
  prayer_method: 4,
  prayer_reminder_minutes: 15,
  adhan_sound: "makkah",
  prayer_fajr_enabled: true,
  prayer_dhuhr_enabled: true,
  prayer_asr_enabled: true,
  prayer_maghrib_enabled: true,
  prayer_isha_enabled: true,
  azkar_morning_enabled: true,
  azkar_morning_time: "06:00:00",
  azkar_evening_enabled: true,
  azkar_evening_time: "17:00:00",
  azkar_sleep_enabled: false,
  azkar_sleep_time: "22:00:00",
  azkar_wakeup_enabled: false,
  azkar_wakeup_time: "05:00:00",
  azkar_prayer_enabled: false,
  azkar_prayer_delay_minutes: 10,
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
      const data = await firestoreGet<any>(COLLECTIONS.USER_SETTINGS, user.uid);

      if (data) {
        setSettings({
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          city_name: data.city_name ?? null,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          notifications_enabled: data.notifications_enabled || false,
          daily_wird_enabled: data.daily_wird_enabled || false,
          daily_wird_time: data.daily_wird_time || "06:00:00",
          prayer_method: data.prayer_method || 4,
          prayer_reminder_minutes: data.prayer_reminder_minutes || 15,
          adhan_sound: data.adhan_sound || "makkah",
          prayer_fajr_enabled: data.prayer_fajr_enabled ?? true,
          prayer_dhuhr_enabled: data.prayer_dhuhr_enabled ?? true,
          prayer_asr_enabled: data.prayer_asr_enabled ?? true,
          prayer_maghrib_enabled: data.prayer_maghrib_enabled ?? true,
          prayer_isha_enabled: data.prayer_isha_enabled ?? true,
          azkar_morning_enabled: data.azkar_morning_enabled ?? true,
          azkar_morning_time: data.azkar_morning_time || "06:00:00",
          azkar_evening_enabled: data.azkar_evening_enabled ?? true,
          azkar_evening_time: data.azkar_evening_time || "17:00:00",
          azkar_sleep_enabled: data.azkar_sleep_enabled ?? false,
          azkar_sleep_time: data.azkar_sleep_time || "22:00:00",
          azkar_wakeup_enabled: data.azkar_wakeup_enabled ?? false,
          azkar_wakeup_time: data.azkar_wakeup_time || "05:00:00",
          azkar_prayer_enabled: data.azkar_prayer_enabled ?? false,
          azkar_prayer_delay_minutes: data.azkar_prayer_delay_minutes || 10,
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    if (user) {
      try {
        await firestoreSet(COLLECTIONS.USER_SETTINGS, user.uid, {
          user_id: user.uid,
          ...updated,
        });
      } catch (error) {
        console.error("Error saving settings:", error);
        toast.error("حدث خطأ في حفظ الإعدادات");
      }
    } else {
      localStorage.setItem("userSettings", JSON.stringify(updated));
    }
  };

  const updateLocation = async (lat: number, lng: number, cityName?: string) => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    
    await updateSettings({
      latitude: lat,
      longitude: lng,
      city_name: cityName || null,
      timezone: detectedTimezone,
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
