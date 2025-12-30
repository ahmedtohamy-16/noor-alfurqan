import { useState, useEffect, useCallback } from "react";
import { useUserSettings } from "./useUserSettings";
import { useFCMNotifications } from "./useFCMNotifications";

/**
 * Main notifications hook - facade for all notification functionality
 */
export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { settings } = useUserSettings();
  const fcm = useFCMNotifications();

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const success = await fcm.enableNotifications();
    if (success) setPermission("granted");
    return success;
  }, [fcm]);

  const disableNotifications = useCallback(async () => {
    await fcm.disableNotifications();
  }, [fcm]);

  const sendNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permission !== "granted" || !settings.notifications_enabled) return null;
      return fcm.sendLocalNotification(title, options?.body || "", options);
    },
    [permission, settings.notifications_enabled, fcm]
  );

  const schedulePrayerReminder = useCallback((_prayerName: string, _prayerTime: string) => {}, []);
  const scheduleWirdReminder = useCallback((_wirdTime: string) => {}, []);

  return {
    permission,
    isEnabled: fcm.isEnabled,
    isSupported: fcm.isSupported,
    isLoading: fcm.isLoading,
    requestPermission,
    disableNotifications,
    sendNotification,
    schedulePrayerReminder,
    scheduleWirdReminder,
    testPushNotification: fcm.testNotification,
  };
};
