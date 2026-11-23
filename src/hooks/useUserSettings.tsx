import { useCallback } from "react";
import tzLookup from "tz-lookup";
import { useSyncedState } from "./useSyncedState";
import { flushUserState, loadUserState } from "@/lib/userStateStore";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { arabicCityName, preferredCityName, hasLocationCoordinates } from "@/lib/cityNames";
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

export const defaultSettings: UserSettings = {
  latitude: null,
  longitude: null,
  city_name: null,
  country_code: null,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  notifications_enabled: false,
  daily_wird_enabled: false,
  daily_wird_time: "06:00:00",
  prayer_method: 0, // 0 = not chosen yet; the recommended method for the country is used
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
const reverseGeocode = async (lat: number, lng: number): Promise<{ city: string; country: string | null }> => {
  let fallback: string | null = null;
  const providers = [
    { url: `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`, names: (data: any) => [data.city, data.locality, data.principalSubdivision] },
    { url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=ar`, names: (data: any) => { const a = data.address || {}; return [a.city, a.town, a.village, a.county, a.state]; } },
  ];
  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) continue;
      const data = await response.json();
      const name = preferredCityName(provider.names(data));
      if (name && /[\u0621-\u064A]/.test(name)) return { city: name, country: data.countryCode || data.address?.country_code?.toUpperCase() || null };
      fallback ??= name;
    } catch { /* Each provider can fail independently. */ }
  }
  return { city: fallback || "موقعك الحالي", country: null };
};

// IP-based geolocation fallback
const getLocationByIP = async (): Promise<{ lat: number; lng: number; city: string; country: string | null } | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    if (hasLocationCoordinates(data.latitude, data.longitude)) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        city: arabicCityName(data.city) || "موقعك",
        country: data.country_code || null,
      };
    }
  } catch (error) {
    console.error("IP geolocation failed:", error);
  }
  return null;
};

export const useUserSettings = () => {
  const { user } = useAuth();
  const [stored, setStored, status] = useSyncedState<UserSettings>("user_settings", user?.uid || "guest", defaultSettings, SETTINGS_STORAGE_KEY);
  const settings = { ...defaultSettings, ...stored, city_name: arabicCityName(stored.city_name) };
  const updateSettings = useCallback(async (patch: Partial<UserSettings>, commit = true) => {
    setStored(previous => ({ ...defaultSettings, ...previous, ...patch, city_name: arabicCityName(patch.city_name === undefined ? previous.city_name : patch.city_name) }));
    if (user && commit) await flushUserState(user.uid);
  }, [setStored, user?.uid]);
  const updateLocation = useCallback(async (lat: number, lng: number, cityName?: string, patch: Partial<UserSettings> = {}) => {
    if (!hasLocationCoordinates(lat, lng)) throw new Error("الإحداثيات غير صالحة");
    await updateSettings({ latitude: lat, longitude: lng, city_name: arabicCityName(cityName), timezone: tzLookup(lat, lng), ...patch });
    toast.success(navigator.onLine ? "تم تحديث الموقع" : "حُفظ الموقع على الجهاز؛ تتم المزامنة عند الاتصال");
  }, [updateSettings]);
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
      const location = await reverseGeocode(lat, lng);
      await updateLocation(lat, lng, location.city, { country_code: location.country });
      return true;
    } catch (gpsError: any) {
      console.log("GPS failed, trying IP fallback:", gpsError);
      
      // Fallback to IP-based location
      const ipLocation = await getLocationByIP();
      if (ipLocation) {
        await updateLocation(ipLocation.lat, ipLocation.lng, ipLocation.city, { country_code: ipLocation.country });
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
    isLoading: status.isLoading,
    error: status.error,
    updateSettings,
    updateLocation,
    requestLocation,
    autoDetectLocation,
    refetch: () => user ? loadUserState(user.uid, true) : Promise.resolve(),
  };
};
