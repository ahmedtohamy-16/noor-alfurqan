import { useState, useEffect, useCallback } from "react";
import { useUserSettings } from "./useUserSettings";
import { toast } from "sonner";

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const { settings, updateSettings } = useUserSettings();

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      toast.error("الإشعارات غير مدعومة في هذا المتصفح");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        await updateSettings({ notifications_enabled: true });
        toast.success("تم تفعيل الإشعارات بنجاح");
        return true;
      } else if (result === "denied") {
        toast.error("تم رفض الإشعارات. يرجى تفعيلها من إعدادات المتصفح");
        return false;
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("حدث خطأ في طلب الإشعارات");
      return false;
    }
  }, [updateSettings]);

  const disableNotifications = useCallback(async () => {
    await updateSettings({ notifications_enabled: false });
    toast.success("تم إيقاف الإشعارات");
  }, [updateSettings]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== "granted" || !settings.notifications_enabled) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        dir: "rtl",
        lang: "ar",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  }, [permission, settings.notifications_enabled]);

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
        sendNotification("تذكير بموعد الصلاة 🕌", {
          body: `حان وقت صلاة ${prayerName} بعد 10 دقائق`,
          tag: `prayer-${prayerName}`,
        });
      }, delay);
    }
  }, [sendNotification]);

  const scheduleWirdReminder = useCallback((wirdTime: string) => {
    const [hours, minutes] = wirdTime.split(":").map(Number);
    const now = new Date();
    const wirdDate = new Date();
    wirdDate.setHours(hours, minutes, 0, 0);

    if (wirdDate > now) {
      const delay = wirdDate.getTime() - now.getTime();
      
      setTimeout(() => {
        sendNotification("تذكير بالورد اليومي 📖", {
          body: "حان وقت قراءة وردك اليومي من القرآن الكريم",
          tag: "daily-wird",
        });
      }, delay);
    }
  }, [sendNotification]);

  return {
    permission,
    isEnabled: settings.notifications_enabled && permission === "granted",
    requestPermission,
    disableNotifications,
    sendNotification,
    schedulePrayerReminder,
    scheduleWirdReminder,
  };
};
