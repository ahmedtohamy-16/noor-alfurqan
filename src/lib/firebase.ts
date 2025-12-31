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

// Firebase configuration - these are public/publishable keys
const FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyDdpGCVHY9CTTlscKC7T70YJANaUNnH6wY",
  authDomain: "noor-al-furqan-e2bbc.firebaseapp.com",
  projectId: "noor-al-furqan-e2bbc",
  storageBucket: "noor-al-furqan-e2bbc.firebasestorage.app",
  messagingSenderId: "246635031366",
  appId: "1:246635031366:web:d2cafd0898899142cbd347",
};

const VAPID_KEY = "BP155IMLyCP2dszPBBJOglRtDuL0TNZkWNhxtk6EQFqtoGJ99q5yL4RxvPxU8XA0hyvDaGlIgtlkkyCX-u_OLwI";

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return true; // Always configured with hardcoded values
};

// Get Firebase config
export const getFirebaseConfig = (): FirebaseConfig => {
  return FIREBASE_CONFIG;
};

// Get VAPID public key for web push
export const getVapidKey = (): string => {
  return VAPID_KEY;
};

// Initialize Firebase (will be called when config is available)
export const initializeFirebase = async (): Promise<boolean> => {
  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const config = getFirebaseConfig();

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
