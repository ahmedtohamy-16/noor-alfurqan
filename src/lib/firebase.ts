// Firebase configuration types and utilities
// This file prepares the Firebase integration structure

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface VapidConfig {
  publicKey: string;
}

// Firebase app will be initialized when config is provided
let firebaseApp: unknown = null;
let messagingInstance: unknown = null;

// Check if Firebase is configured (config will come from environment)
export const isFirebaseConfigured = (): boolean => {
  // Will be true when VITE_FIREBASE_* env vars are set
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID
  );
};

// Get Firebase config from environment
export const getFirebaseConfig = (): FirebaseConfig | null => {
  if (!isFirebaseConfigured()) return null;

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };
};

// Get VAPID public key for web push
export const getVapidKey = (): string | null => {
  return import.meta.env.VITE_FIREBASE_VAPID_KEY || null;
};

// Initialize Firebase (will be called when config is available)
export const initializeFirebase = async (): Promise<boolean> => {
  if (!isFirebaseConfigured()) {
    console.log("⚠️ Firebase not configured - FCM disabled");
    return false;
  }

  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const config = getFirebaseConfig();

    if (!config) return false;

    // Check if already initialized
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
      console.log("✅ Firebase initialized");
    } else {
      firebaseApp = getApps()[0];
    }

    return true;
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    return false;
  }
};

// Get FCM messaging instance
export const getMessaging = async () => {
  if (!firebaseApp) {
    const initialized = await initializeFirebase();
    if (!initialized) return null;
  }

  if (!messagingInstance) {
    try {
      const { getMessaging: getFirebaseMessaging } = await import("firebase/messaging");
      messagingInstance = getFirebaseMessaging(firebaseApp as any);
    } catch (error) {
      console.error("❌ Failed to get messaging instance:", error);
      return null;
    }
  }

  return messagingInstance;
};

// Request FCM token
export const requestFCMToken = async (): Promise<string | null> => {
  const messaging = await getMessaging();
  if (!messaging) return null;

  const vapidKey = getVapidKey();
  if (!vapidKey) {
    console.error("❌ VAPID key not configured");
    return null;
  }

  try {
    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging as any, { vapidKey });
    console.log("✅ FCM token obtained");
    return token;
  } catch (error) {
    console.error("❌ Failed to get FCM token:", error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = async (callback: (payload: any) => void) => {
  const messaging = await getMessaging();
  if (!messaging) return () => {};

  try {
    const { onMessage } = await import("firebase/messaging");
    return onMessage(messaging as any, callback);
  } catch (error) {
    console.error("❌ Failed to set up message listener:", error);
    return () => {};
  }
};

// Export for compatibility
export const app = firebaseApp;
export const messaging = messagingInstance;
