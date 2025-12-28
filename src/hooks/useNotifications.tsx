import { useState, useEffect, useCallback, useRef } from "react";
import { useUserSettings } from "./useUserSettings";
import { useFCMNotifications } from "./useFCMNotifications";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { settings } = useUserSettings();
  const { enableNotifications, disableNotifications, sendLocalNotification, isEnabled } = useFCMNotifications();

  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup scheduled timeouts to prevent duplicates when navigating
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const success = await enableNotifications();
    if (success) {
      setPermission("granted");
    }
    return success;
  }, [enableNotifications]);

  const disableNotificationsHandler = useCallback(async () => {
    await disableNotifications();
  }, [disableNotifications]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      // This is intended for manual/foreground notifications.
      if (permission !== "granted" || !settings.notifications_enabled) {
        return null;
      }

      return sendLocalNotification(title, options?.body || "", options);
    },
    [permission, settings.notifications_enabled, sendLocalNotification]
  );

  const schedulePrayerReminder = useCallback(
    (prayerName: string, prayerTime: string) => {
      if (permission !== "granted") return;

      const [hours, minutes] = prayerTime.split(":").map(Number);
      const now = new Date();
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);

      // If prayer time has already passed today, schedule for tomorrow.
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }

      // Notify 10 minutes before
      const reminderDate = new Date(prayerDate.getTime() - 10 * 60 * 1000);
      const delay = reminderDate.getTime() - now.getTime();

      if (delay > 0) {
        const id = window.setTimeout(() => {
          sendLocalNotification("تذكير بموعد الصلاة 🕌", `حان وقت صلاة ${prayerName} بعد 10 دقائق`, {
            tag: `prayer-${prayerName}`,
          });
        }, delay);

        timeoutsRef.current.push(id);
      }
    },
    [permission, sendLocalNotification]
  );

  const scheduleWirdReminder = useCallback(
    (wirdTime: string) => {
      if (permission !== "granted") return;

      const scheduleNext = () => {
        const [hours, minutes] = wirdTime.split(":").map(Number);
        const now = new Date();
        const next = new Date(now);
        next.setHours(hours, minutes, 0, 0);

        // If time has already passed today, schedule for tomorrow.
        if (next <= now) {
          next.setDate(next.getDate() + 1);
        }

        const delay = next.getTime() - now.getTime();
        if (delay <= 0) return;

        const id = window.setTimeout(() => {
          sendLocalNotification("تذكير بالورد اليومي 📖", "حان وقت قراءة وردك اليومي من القرآن الكريم", {
            tag: "daily-wird",
          });

          // Reschedule for the next day
          scheduleNext();
        }, delay);

        timeoutsRef.current.push(id);
      };

      scheduleNext();
    },
    [permission, sendLocalNotification]
  );

  return {
    permission,
    isEnabled,
    requestPermission,
    disableNotifications: disableNotificationsHandler,
    sendNotification,
    schedulePrayerReminder,
    scheduleWirdReminder,
  };
};

