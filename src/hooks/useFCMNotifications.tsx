import { useState, useEffect, useCallback } from "react";
import { useUserSettings } from "./useUserSettings";
import { toast } from "sonner";

// Clean-slate notifications hook.
// NOTE: Push/FCM wiring was removed until you provide the correct credentials again.
export const useFCMNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { settings, updateSettings } = useUserSettings();

  const isInIframe = typeof window !== "undefined" && window.self !== window.top;
  const isSupported = typeof window !== "undefined" && "Notification" in window && !isInIframe;

  useEffect(() => {
    if (!isInIframe && settings.notifications_enabled && Notification.permission !== "granted") {
      toast.error("الإشعارات مفعّلة داخل التطبيق لكن إذن المتصفح غير مسموح. فعّل Allow ثم أعد المحاولة.");
    }
    if (isInIframe && settings.notifications_enabled) {
      toast.message("ملاحظة: تفعيل إشعارات المتصفح لا يعمل داخل نافذة المعاينة. افتح التطبيق في تبويب مستقل.");
    }
  }, [isInIframe, settings.notifications_enabled]);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error("هذا المتصفح/البيئة لا تدعم الإشعارات.");
      return false;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("تم رفض إذن الإشعارات.");
        return false;
      }

      await updateSettings({ notifications_enabled: true });
      toast.success("تم تفعيل الإشعارات ✅");
      return true;
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء تفعيل الإشعارات");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, updateSettings]);

  const disableNotifications = useCallback(async () => {
    await updateSettings({ notifications_enabled: false });
    toast.success("تم إيقاف الإشعارات");
  }, [updateSettings]);

  const sendLocalNotification = useCallback(
    (title: string, body: string, options?: NotificationOptions) => {
      if (typeof window === "undefined") return null;
      if (Notification.permission !== "granted") return null;

      try {
        const notification = new Notification(title, {
          body,
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
    },
    []
  );

  return {
    // kept for API compatibility
    fcmToken: null as string | null,
    isLoading,
    isEnabled: settings.notifications_enabled && Notification.permission === "granted" && !isInIframe,
    isSupported,
    enableNotifications,
    disableNotifications,
    sendLocalNotification,
  };
};

