import { useState, useEffect, useCallback } from "react";
import { useUserSettings } from "./useUserSettings";
import { useFCMNotifications } from "./useFCMNotifications";

// Facade hook (kept stable) while we rebuild push + background scheduling cleanly.
export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { settings } = useUserSettings();
  const { enableNotifications, disableNotifications, sendLocalNotification, isEnabled } = useFCMNotifications();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const success = await enableNotifications();
    if (success) setPermission("granted");
    return success;
  }, [enableNotifications]);

  const disableNotificationsHandler = useCallback(async () => {
    await disableNotifications();
  }, [disableNotifications]);

  // Immediate (foreground) notification only
  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted" || !settings.notifications_enabled) return null;
      return sendLocalNotification(title, options?.body || "", options);
    },
    [permission, settings.notifications_enabled, sendLocalNotification]
  );

  // Clean-slate: scheduling will be rebuilt (backend + push).
  const schedulePrayerReminder = useCallback((_prayerName: string, _prayerTime: string) => {}, []);
  const scheduleWirdReminder = useCallback((_wirdTime: string) => {}, []);

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

