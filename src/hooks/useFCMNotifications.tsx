import { useState, useEffect, useCallback } from "react";
import { requestNotificationPermission, onMessageListener } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { useUserSettings } from "./useUserSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFCMNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { settings, updateSettings } = useUserSettings();

  // Request permission and get FCM token
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setFcmToken(token);
        await updateSettings({ notifications_enabled: true });
        
        // Save token to database if user is logged in
        if (user) {
          await supabase.from("push_subscriptions").upsert({
            user_id: user.id,
            fcm_token: token,
            device_info: {
              userAgent: navigator.userAgent,
              platform: navigator.platform,
              language: navigator.language,
              timestamp: new Date().toISOString(),
            },
          }, { onConflict: "user_id" });
        }
        
        toast.success("تم تفعيل الإشعارات بنجاح ✅");
        return true;
      } else {
        toast.error("تعذر تفعيل الإشعارات. يرجى السماح بالإشعارات من إعدادات المتصفح");
        return false;
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      toast.error("حدث خطأ أثناء تفعيل الإشعارات");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, updateSettings]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    await updateSettings({ notifications_enabled: false });
    setFcmToken(null);
    
    // Remove token from database
    if (user) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.id);
    }
    
    toast.success("تم إيقاف الإشعارات");
  }, [user, updateSettings]);

  // Send local notification
  const sendLocalNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (Notification.permission !== "granted") {
      return null;
    }

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
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      console.log("Foreground message received:", payload);
      
      // Show notification for foreground messages
      if (payload.notification) {
        sendLocalNotification(
          payload.notification.title || "نور الفرقان",
          payload.notification.body || "",
          { tag: payload.data?.tag }
        );
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [sendLocalNotification]);

  // Check if notifications are supported
  const isSupported = "Notification" in window && "serviceWorker" in navigator;

  return {
    fcmToken,
    isLoading,
    isEnabled: settings.notifications_enabled && Notification.permission === "granted",
    isSupported,
    enableNotifications,
    disableNotifications,
    sendLocalNotification,
  };
};
