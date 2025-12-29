// Firebase/FCM integration removed.
// This module is kept only to avoid breaking imports while reconfiguring notifications from scratch.

export type Messaging = unknown;

export const initializeMessaging = () => {
  return null as Messaging | null;
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  // We are intentionally NOT initializing Firebase here.
  // Only request browser permission; token will be wired once correct FCM config is provided.
  if (typeof window === "undefined" || !("Notification" in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  // No FCM token until user provides the correct credentials.
  return null;
};

export const onMessageListener = (_callback: (payload: any) => void) => {
  // No-op until FCM is configured again.
  return () => {};
};

export const app = null;
export const messaging = null;

