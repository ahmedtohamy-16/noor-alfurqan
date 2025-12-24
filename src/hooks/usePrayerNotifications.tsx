import { useEffect, useRef, useCallback } from "react";
import { useUserSettings } from "./useUserSettings";
import { useNotifications } from "./useNotifications";

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const prayerNames: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

// Adhan audio URLs - using a reliable CDN
const ADHAN_AUDIO_URL = "https://www.islamcan.com/audio/adhan/azan1.mp3";
const FAJR_ADHAN_AUDIO_URL = "https://www.islamcan.com/audio/adhan/azan8.mp3";

export const usePrayerNotifications = (prayerTimes: PrayerTimes | null) => {
  const { settings } = useUserSettings();
  const { sendNotification, isEnabled } = useNotifications();
  const scheduledTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAdhan = useCallback((isFajr: boolean = false) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(isFajr ? FAJR_ADHAN_AUDIO_URL : ADHAN_AUDIO_URL);
      audio.volume = 0.7;
      audioRef.current = audio;
      
      audio.play().catch((error) => {
        console.log("Could not play adhan audio:", error);
      });

      // Stop audio after 30 seconds
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }, 30000);
    } catch (error) {
      console.error("Error playing adhan:", error);
    }
  }, []);

  const scheduleNotification = useCallback(
    (prayerKey: string, prayerTime: string, reminderMinutes: number) => {
      const [hours, minutes] = prayerTime.split(":").map(Number);
      const now = new Date();
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);

      // Clear existing timer for this prayer
      const existingTimer = scheduledTimers.current.get(prayerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Schedule reminder notification (X minutes before)
      const reminderTime = new Date(prayerDate.getTime() - reminderMinutes * 60 * 1000);
      if (reminderTime > now) {
        const reminderDelay = reminderTime.getTime() - now.getTime();
        
        const reminderTimer = setTimeout(() => {
          sendNotification(`تذكير بموعد صلاة ${prayerNames[prayerKey]} 🕌`, {
            body: `حان وقت صلاة ${prayerNames[prayerKey]} بعد ${reminderMinutes} دقيقة`,
            tag: `prayer-reminder-${prayerKey}`,
            requireInteraction: true,
          });
        }, reminderDelay);

        scheduledTimers.current.set(`${prayerKey}-reminder`, reminderTimer);
      }

      // Schedule adhan notification (at prayer time)
      if (prayerDate > now && prayerKey !== "Sunrise") {
        const adhanDelay = prayerDate.getTime() - now.getTime();
        
        const adhanTimer = setTimeout(() => {
          sendNotification(`حان الآن موعد صلاة ${prayerNames[prayerKey]} 🕌`, {
            body: `أقيمت الصلاة.. حي على الفلاح`,
            tag: `prayer-adhan-${prayerKey}`,
            requireInteraction: true,
          });
          
          // Play adhan sound
          playAdhan(prayerKey === "Fajr");
        }, adhanDelay);

        scheduledTimers.current.set(`${prayerKey}-adhan`, adhanTimer);
      }
    },
    [sendNotification, playAdhan]
  );

  const scheduleAllNotifications = useCallback(() => {
    if (!prayerTimes || !isEnabled) return;

    const reminderMinutes = settings.prayer_reminder_minutes || 15;

    // Schedule for main prayers (excluding Sunrise)
    const mainPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
    
    mainPrayers.forEach((prayerKey) => {
      const time = prayerTimes[prayerKey as keyof PrayerTimes];
      if (time) {
        scheduleNotification(prayerKey, time, reminderMinutes);
      }
    });
  }, [prayerTimes, isEnabled, settings.prayer_reminder_minutes, scheduleNotification]);

  const clearAllNotifications = useCallback(() => {
    scheduledTimers.current.forEach((timer) => {
      clearTimeout(timer);
    });
    scheduledTimers.current.clear();

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  // Schedule notifications when prayer times change
  useEffect(() => {
    if (isEnabled && prayerTimes) {
      scheduleAllNotifications();
    }

    return () => {
      clearAllNotifications();
    };
  }, [prayerTimes, isEnabled, scheduleAllNotifications, clearAllNotifications]);

  // Re-schedule at midnight for next day
  useEffect(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      scheduleAllNotifications();
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [scheduleAllNotifications]);

  return {
    scheduleAllNotifications,
    clearAllNotifications,
    playAdhan,
  };
};
