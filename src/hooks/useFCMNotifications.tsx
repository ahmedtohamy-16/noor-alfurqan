import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { useUserSettings } from "./useUserSettings";
import { toast } from "sonner";
import {
  isFirebaseConfigured,
  requestFCMToken,
  onForegroundMessage,
  initializeMessaging,
} from "@/lib/firebase";

interface NotificationState {
  isSupported: boolean;
  isInIframe: boolean;
  permission: NotificationPermission;
  fcmToken: string | null;
  isLoading: boolean;
  isEnabled: boolean;
  firebaseConfigured: boolean;
}

export const useFCMNotifications = () => {
  const { user } = useAuth();
  const { settings, updateSettings } = useUserSettings();
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    isInIframe: false,
    permission: "default",
    fcmToken: null,
    isLoading: false,
    isEnabled: false,
    firebaseConfigured: false,
  });
  const messageUnsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize state
  useEffect(() => {
    const isInIframe = typeof window !== "undefined" && window.self !== window.top;
    const isSupported = typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator;
    const permission = isSupported ? Notification.permission : "default";
    const firebaseConfigured = isFirebaseConfigured();

    setState((prev) => ({
      ...prev,
      isInIframe,
      isSupported,
      permission,
      firebaseConfigured,
      isEnabled: settings.notifications_enabled && permission === "granted",
    }));
  }, [settings.notifications_enabled]);

  // Register service worker and setup FCM
  useEffect(() => {
    if (!state.isSupported || state.isInIframe || !user) return;

    const setupFCM = async () => {
      try {
        // Register service worker
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("✅ Service Worker registered");

        // Initialize Firebase messaging if configured
        if (state.firebaseConfigured) {
          await initializeMessaging();
          if (Notification.permission === "granted") {
            const token = await requestFCMToken();
            if (token) {
              setState((prev) => ({ ...prev, fcmToken: token }));
              await registerTokenWithBackend(token);
            }
          }

          // Setup foreground message handler
          messageUnsubscribeRef.current = await onForegroundMessage((payload) => {
            console.log("📩 Foreground message:", payload);
            const { title, body } = payload.notification || {};
            if (title) {
              toast.info(title, { description: body });
            }
          });
        }
      } catch (error) {
        console.error("❌ FCM setup error:", error);
      }
    };

    setupFCM();

    return () => {
      if (messageUnsubscribeRef.current) {
        messageUnsubscribeRef.current();
      }
    };
  }, [state.isSupported, state.isInIframe, state.firebaseConfigured, user]);

  // Register FCM token with backend (still using Supabase edge function for now)
  const registerTokenWithBackend = async (token: string) => {
    if (!user) return;

    try {
      // For now, we'll store tokens in Firestore directly
      const { firestoreSet, COLLECTIONS } = await import("@/lib/firebase");
      await firestoreSet(COLLECTIONS.PUSH_SUBSCRIPTIONS, `${user.uid}_web`, {
        user_id: user.uid,
        fcm_token: token,
        platform: "web",
        is_active: true,
        device_info: {
          userAgent: navigator.userAgent,
          language: navigator.language,
        },
        created_at: new Date().toISOString(),
      });
      console.log("✅ Token registered in Firestore");
    } catch (error) {
      console.error("❌ Failed to register token:", error);
    }
  };

  // Enable notifications
  const enableNotifications = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast.error("هذا المتصفح لا يدعم الإشعارات");
      return false;
    }

    if (state.isInIframe) {
      toast.error("افتح التطبيق في تبويب مستقل لتفعيل الإشعارات");
      return false;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));

      if (permission !== "granted") {
        toast.error("تم رفض إذن الإشعارات");
        return false;
      }

      // Get FCM token if Firebase is configured
      let token: string | null = null;
      if (state.firebaseConfigured) {
        await initializeMessaging();
        token = await requestFCMToken();
        if (token) {
          setState((prev) => ({ ...prev, fcmToken: token }));
          await registerTokenWithBackend(token);
        }
      } else {
        token = `browser-fallback-${Date.now()}`;
      }

      // Update settings
      await updateSettings({ notifications_enabled: true });
      setState((prev) => ({ ...prev, isEnabled: true }));

      toast.success("تم تفعيل الإشعارات ✅");
      return true;
    } catch (error) {
      console.error("❌ Enable notifications error:", error);
      toast.error("حدث خطأ أثناء تفعيل الإشعارات");
      return false;
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [state.isSupported, state.isInIframe, state.firebaseConfigured, updateSettings, user]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    await updateSettings({ notifications_enabled: false });
    setState((prev) => ({ ...prev, isEnabled: false }));
    toast.success("تم إيقاف الإشعارات");
  }, [updateSettings]);

  // Send local notification
  const sendLocalNotification = useCallback(
    (title: string, body: string, options?: NotificationOptions): Notification | null => {
      if (!state.isSupported || Notification.permission !== "granted") {
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
        console.error("❌ Local notification error:", error);
        return null;
      }
    },
    [state.isSupported]
  );

  // Test notification
  const testNotification = useCallback(async (): Promise<boolean> => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لاختبار الإشعارات");
      return false;
    }

    try {
      // Send local notification for testing
      sendLocalNotification("🧪 اختبار الإشعارات", "الإشعارات تعمل بنجاح!");
      toast.success("تم إرسال إشعار الاختبار!");
      return true;
    } catch (error) {
      console.error("❌ Test notification error:", error);
      toast.error("فشل اختبار الإشعارات");
      return false;
    }
  }, [user, sendLocalNotification]);

  return {
    ...state,
    enableNotifications,
    disableNotifications,
    sendLocalNotification,
    testNotification,
    registerTokenWithBackend,
  };
};
