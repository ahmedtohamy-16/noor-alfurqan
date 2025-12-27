import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCmuCFmj_xlW7ObI_3wwaFCKxebpTWH-Z0",
  authDomain: "noor-al-furqan-2691e.firebaseapp.com",
  projectId: "noor-al-furqan-2691e",
  storageBucket: "noor-al-furqan-2691e.firebasestorage.app",
  messagingSenderId: "585810509786",
  appId: "1:585810509786:web:ae3da99817777abf9f8ae3"
};

const VAPID_KEY = "BMrJX4GXmHHdV0Eh6ZaoMxUQHtYw2IDl9FYhSTl--6XM_5m4i138JZOfmaytxK8m225LpswX28JapB76j09Aius";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

export const initializeMessaging = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    try {
      messaging = getMessaging(app);
      return messaging;
    } catch (error) {
      console.error("Error initializing FCM:", error);
      return null;
    }
  }
  return null;
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    // Initialize messaging if not already done
    if (!messaging) {
      messaging = initializeMessaging();
    }

    if (!messaging) {
      console.error("Messaging not initialized");
      return null;
    }

    // Register service worker with proper scope
    let registration: ServiceWorkerRegistration;
    
    try {
      registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope: "/"
      });
      console.log("Service Worker registered with scope:", registration.scope);
      
      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
    } catch (swError) {
      console.error("Service Worker registration failed:", swError);
      // Try without service worker registration for basic notifications
      return `browser-fallback-${Date.now()}`;
    }
    
    // Get FCM token
    try {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log("FCM Token:", token);
      return token;
    } catch (tokenError) {
      console.error("Error getting FCM token:", tokenError);
      // Return a fallback token for basic browser notifications
      return `browser-fallback-${Date.now()}`;
    }
  } catch (error) {
    console.error("Error in requestNotificationPermission:", error);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) {
    messaging = initializeMessaging();
  }

  if (messaging) {
    return onMessage(messaging, (payload) => {
      console.log("Message received:", payload);
      callback(payload);
    });
  }
  
  return () => {};
};

export { app, messaging };
