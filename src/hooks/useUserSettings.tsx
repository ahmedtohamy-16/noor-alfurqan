import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { 
  firestoreGet, 
  firestoreSet, 
  COLLECTIONS
} from "@/lib/firebase";

export interface UserSettings {
  latitude: number | null;
  longitude: number | null;
  city_name: string | null;
  country_code: string | null; // Country code for DST detection
  timezone: string;
  notifications_enabled: boolean;
  daily_wird_enabled: boolean;
  daily_wird_time: string;
  // Prayer calculation settings
  prayer_method: number;
  prayer_madhab: number; // 0 = Shafi'i (Standard), 1 = Hanafi
  prayer_reminder_minutes: number;
  // DST (Daylight Saving Time) settings
  dst_mode: 'auto' | 'manual'; // Auto = detect by country, Manual = user control
  dst_enabled: boolean; // Only used in manual mode
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
  country_code: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  notifications_enabled: false,
  daily_wird_enabled: false,
  daily_wird_time: "06:00:00",
  prayer_method: 4, // Default: Umm Al-Qura
  prayer_madhab: 0, // Default: Shafi'i (Standard)
  prayer_reminder_minutes: 15,
  dst_mode: 'auto',
  dst_enabled: false,
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

const SETTINGS_STORAGE_KEY = "userSettings";

// Helper to get city name from coordinates
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`
    );
    const data = await response.json();
    return data.city || data.locality || data.principalSubdivision || "موقعك الحالي";
  } catch {
    return "موقعك الحالي";
  }
};

// IP-based geolocation fallback
const getLocationByIP = async (): Promise<{ lat: number; lng: number; city: string } | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: data.city || "موقعك",
      };
    }
  } catch (error) {
    console.error("IP geolocation failed:", error);
  }
  return null;
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(() => {
    // Initialize from localStorage immediately
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch settings on mount or user change
  useEffect(() => {
    if (user) {
      fetchSettings();
    } else {
      // Already loaded from localStorage in initial state
      setIsLoading(false);
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const data = await firestoreGet<any>(COLLECTIONS.USER_SETTINGS, user.uid);

      if (data) {
        const loadedSettings: UserSettings = {
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          city_name: data.city_name ?? null,
          country_code: data.country_code ?? null,
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
          notifications_enabled: data.notifications_enabled || false,
          daily_wird_enabled: data.daily_wird_enabled || false,
          daily_wird_time: data.daily_wird_time || "06:00:00",
          prayer_method: data.prayer_method || 4,
          prayer_madhab: data.prayer_madhab ?? 0,
          prayer_reminder_minutes: data.prayer_reminder_minutes || 15,
          dst_mode: data.dst_mode || 'auto',
          dst_enabled: data.dst_enabled ?? false,
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
        };
        setSettings(loadedSettings);
        // Also save to localStorage for offline/guest access
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(loadedSettings));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Always save to localStorage
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

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
    }
  }, [settings, user]);

  const updateLocation = useCallback(async (lat: number, lng: number, cityName?: string) => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    
    // Get device info
    const getDeviceInfo = (): string => {
      if (typeof window === "undefined") return "unknown";
      const ua = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
      if (/Android/.test(ua)) return "Android";
      if (/Windows/.test(ua)) return "Windows";
      if (/Mac/.test(ua)) return "macOS";
      if (/Linux/.test(ua)) return "Linux";
      return "Other";
    };
    
    await updateSettings({
      latitude: lat,
      longitude: lng,
      city_name: cityName || null,
      timezone: detectedTimezone,
    });

    // Update user profile with location and device info in Firestore
    if (user) {
      try {
        await firestoreSet(COLLECTIONS.USERS, user.uid, {
          last_location: {
            latitude: lat,
            longitude: lng,
            city_name: cityName || null,
            updated_at: new Date().toISOString(),
          },
          device_type: getDeviceInfo(),
        });
      } catch (error) {
        console.error("Error updating user location in profile:", error);
      }
    }

    toast.success("تم تحديث الموقع بنجاح");
  }, [updateSettings, user]);

  const requestLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
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
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  // Auto-detect location with GPS fallback to IP
  const autoDetectLocation = useCallback(async (): Promise<boolean> => {
    try {
      // Try GPS first
      const { lat, lng } = await requestLocation();
      const cityName = await reverseGeocode(lat, lng);
      await updateLocation(lat, lng, cityName);
      return true;
    } catch (gpsError: any) {
      console.log("GPS failed, trying IP fallback:", gpsError);
      
      // Fallback to IP-based location
      const ipLocation = await getLocationByIP();
      if (ipLocation) {
        await updateLocation(ipLocation.lat, ipLocation.lng, ipLocation.city);
        toast.info("تم تحديد الموقع عبر IP");
        return true;
      }
      
      // Both failed
      if (gpsError.code === 1) {
        toast.error("تم رفض الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح.");
      } else if (gpsError.code === 2) {
        toast.error("تعذر تحديد الموقع. تأكد من تفعيل خدمات الموقع.");
      } else if (gpsError.code === 3) {
        toast.error("انتهت مهلة تحديد الموقع. حاول مرة أخرى.");
      } else {
        toast.error("تعذر الحصول على الموقع.");
      }
      return false;
    }
  }, [requestLocation, updateLocation]);

  return {
    settings,
    isLoading,
    updateSettings,
    updateLocation,
    requestLocation,
    autoDetectLocation,
    refetch: fetchSettings,
  };
};
