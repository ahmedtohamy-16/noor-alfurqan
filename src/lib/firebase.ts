// Firebase configuration and services
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  Firestore
} from "firebase/firestore";
import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";

// Firebase configuration - these are public/publishable keys
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDdpGCVHY9CTTlscKC7T70YJANaUNnH6wY",
  authDomain: "noor-al-furqan-e2bbc.firebaseapp.com",
  projectId: "noor-al-furqan-e2bbc",
  storageBucket: "noor-al-furqan-e2bbc.firebasestorage.app",
  messagingSenderId: "246635031366",
  appId: "1:246635031366:web:d2cafd0898899142cbd347",
};

const VAPID_KEY = "BP155IMLyCP2dszPBBJOglRtDuL0TNZkWNhxtk6EQFqtoGJ99q5yL4RxvPxU8XA0hyvDaGlIgtlkkyCX-u_OLwI";

// Initialize Firebase app
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let messaging: Messaging | null = null;

const initializeFirebaseApp = (): FirebaseApp => {
  if (getApps().length === 0) {
    app = initializeApp(FIREBASE_CONFIG);
    console.log("✅ Firebase initialized");
  } else {
    app = getApp();
  }
  return app;
};

// Initialize app on module load
app = initializeFirebaseApp();
auth = getAuth(app);
db = getFirestore(app);

// Get Firebase Auth
export const getFirebaseAuth = (): Auth => auth;

// Get Firestore
export const getFirestoreDb = (): Firestore => db;

// Get VAPID key
export const getVapidKey = (): string => VAPID_KEY;

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => true;

// ==================== AUTH FUNCTIONS ====================

export const signUp = async (email: string, password: string, username?: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Create user profile in Firestore
  await setDoc(doc(db, "profiles", user.uid), {
    id: user.uid,
    username: username || email.split("@")[0],
    avatar_url: null,
    created_at: Timestamp.now(),
  });
  
  // Send email verification
  await sendEmailVerification(user);
  
  return user;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// ==================== FIRESTORE HELPER FUNCTIONS ====================

// Collections
export const COLLECTIONS = {
  PROFILES: "profiles",
  FAVORITES: "favorites",
  USER_SETTINGS: "user_settings",
  READING_PROGRESS: "reading_progress",
  READING_SESSIONS: "reading_sessions",
  TASBIH_STATS: "tasbih_stats",
  DAILY_WIRD: "daily_wird",
  KHATMAHS: "khatmahs",
  KHATMAH_PARTICIPANTS: "khatmah_participants",
  NOTIFICATION_HISTORY: "notification_history",
  PUSH_SUBSCRIPTIONS: "push_subscriptions",
  USER_READING_SETTINGS: "user_reading_settings",
  USER_AZKAR_PROGRESS: "user_azkar_progress",
};

// Generic Firestore operations
export const firestoreGet = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
};

export const firestoreSet = async (collectionName: string, docId: string, data: DocumentData) => {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, { ...data, updated_at: Timestamp.now() }, { merge: true });
};

export const firestoreUpdate = async (collectionName: string, docId: string, data: Partial<DocumentData>) => {
  const docRef = doc(db, collectionName, docId);
  await updateDoc(docRef, { ...data, updated_at: Timestamp.now() });
};

export const firestoreDelete = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  await deleteDoc(docRef);
};

export const firestoreQuery = async <T>(
  collectionName: string,
  conditions: { field: string; op: any; value: any }[],
  orderByField?: string,
  orderDirection: "asc" | "desc" = "desc",
  limitCount?: number
): Promise<T[]> => {
  let q = collection(db, collectionName);
  let constraints: any[] = conditions.map(c => where(c.field, c.op, c.value));
  
  if (orderByField) {
    constraints.push(orderBy(orderByField, orderDirection));
  }
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  
  const queryRef = query(q, ...constraints);
  const snapshot = await getDocs(queryRef);
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

// Subscribe to real-time updates
export const firestoreSubscribe = <T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      callback(null);
    }
  });
};

// ==================== FCM MESSAGING ====================

export const initializeMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }
  
  try {
    if (!messaging) {
      messaging = getMessaging(app);
    }
    return messaging;
  } catch (error) {
    console.error("❌ Failed to initialize messaging:", error);
    return null;
  }
};

export const requestFCMToken = async (): Promise<string | null> => {
  const msg = await initializeMessaging();
  if (!msg) return null;
  
  try {
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    console.log("✅ FCM token obtained");
    return token;
  } catch (error) {
    console.error("❌ Failed to get FCM token:", error);
    return null;
  }
};

export const onForegroundMessage = async (callback: (payload: any) => void) => {
  const msg = await initializeMessaging();
  if (!msg) return () => {};
  
  return onMessage(msg, callback);
};

// Export instances
export { app, auth, db, Timestamp };
export type { FirebaseUser };
