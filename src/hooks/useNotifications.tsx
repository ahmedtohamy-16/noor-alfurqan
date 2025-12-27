import { useState, useEffect, useCallback } from "react";
import { useUserSettings } from "./useUserSettings";
import { useFCMNotifications } from "./useFCMNotifications";
import { toast } from "sonner";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { settings, updateSettings } = useUserSettings();
  const { enableNotifications, disableNotifications, sendLocalNotification, isEnabled } = useFCMNotifications();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
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

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== "granted" || !settings.notifications_enabled) {
      return null;
    }

    return sendLocalNotification(title, options?.body || "", options);
  }, [permission, settings.notifications_enabled, sendLocalNotification]);

  const schedulePrayerReminder = useCallback((prayerName: string, prayerTime: string) => {
    const [hours, minutes] = prayerTime.split(":").map(Number);
    const now = new Date();
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);

    // Notify 10 minutes before
    const reminderDate = new Date(prayerDate.getTime() - 10 * 60 * 1000);

    if (reminderDate > now) {
      const delay = reminderDate.getTime() - now.getTime();
      
      setTimeout(() => {
        sendLocalNotification("تذكير بموعد الصلاة 🕌", `حان وقت صلاة ${prayerName} بعد 10 دقائق`, {
          tag: `prayer-${prayerName}`,
        });
      }, delay);
    }
  }, [sendLocalNotification]);

  const scheduleWirdReminder = useCallback((wirdTime: string) => {
    const [hours, minutes] = wirdTime.split(":").map(Number);
    const now = new Date();
    const wirdDate = new Date();
    wirdDate.setHours(hours, minutes, 0, 0);

    if (wirdDate > now) {
      const delay = wirdDate.getTime() - now.getTime();
      
      setTimeout(() => {
        sendLocalNotification("تذكير بالورد اليومي 📖", "حان وقت قراءة وردك اليومي من القرآن الكريم", {
          tag: "daily-wird",
        });
      }, delay);
    }
  }, [sendLocalNotification]);

  return {
    permission,
    isEnabled: isEnabled,
    requestPermission,
    disableNotifications: disableNotificationsHandler,
    sendNotification,
    schedulePrayerReminder,
    scheduleWirdReminder,
  };
};
