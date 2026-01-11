// Firebase configuration and services
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUserType,
  Auth,
  browserLocalPersistence,
  setPersistence
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
  Firestore,
  addDoc,
  serverTimestamp,
  QueryConstraint
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

// Set persistence for Safari/iOS compatibility
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Could not set auth persistence:", error);
});

// User Roles
export type UserRole = "admin" | "teacher" | "student";

// Firebase User with custom properties
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// User Profile in Firestore
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Get Firebase Auth
export const getFirebaseAuth = (): Auth => auth;

// Get Firestore
export const getFirestoreDb = (): Firestore => db;

// Get VAPID key
export const getVapidKey = (): string => VAPID_KEY;

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => true;

// Collections
export const COLLECTIONS = {
  USERS: "users",
  USER_ROLES: "user_roles",
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
  LESSONS: "lessons",
  SURAHS: "surahs",
  AYAHS: "ayahs",
  CONVERSATIONS: "conversations",
  MESSAGES: "messages",
  COURSES: "courses",
  QUIZZES: "quizzes",
  TEACHER_FILES: "teacher_files",
  QUIZ_QUESTIONS: "quiz_questions",
  QUIZ_ATTEMPTS: "quiz_attempts",
  COURSE_ENROLLMENTS: "course_enrollments",
  COURSE_LESSONS: "course_lessons",
};

// ==================== AUTH FUNCTIONS ====================

export const signUp = async (
  email: string, 
  password: string, 
  username?: string,
  role: UserRole = "student"
) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  const displayName = username || email.split("@")[0];
  
  // Create user profile in Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    photoURL: null,
    role: role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  // Create user role entry (separate collection for security)
  await setDoc(doc(db, COLLECTIONS.USER_ROLES, user.uid), {
    uid: user.uid,
    role: role,
    createdAt: serverTimestamp()
  });

  // Also create in profiles for backward compatibility
  await setDoc(doc(db, COLLECTIONS.PROFILES, user.uid), {
    id: user.uid,
    username: displayName,
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
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      });
    } else {
      callback(null);
    }
  });
};

export const getCurrentUser = (): FirebaseUser | null => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
  }
  return null;
};

// ==================== USER ROLE FUNCTIONS ====================

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const roleDoc = await getDoc(doc(db, COLLECTIONS.USER_ROLES, uid));
    if (roleDoc.exists()) {
      return roleDoc.data().role as UserRole;
    }
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const updateUserRole = async (uid: string, newRole: UserRole): Promise<void> => {
  await updateDoc(doc(db, COLLECTIONS.USER_ROLES, uid), {
    role: newRole,
    updatedAt: serverTimestamp()
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    role: newRole,
    updatedAt: serverTimestamp()
  });
};

export const hasRole = async (uid: string, requiredRole: UserRole): Promise<boolean> => {
  const role = await getUserRole(uid);
  if (!role) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    admin: 3,
    teacher: 2,
    student: 1
  };
  
  return roleHierarchy[role] >= roleHierarchy[requiredRole];
};

export const isAdmin = async (uid: string): Promise<boolean> => {
  return hasRole(uid, "admin");
};

export const isTeacher = async (uid: string): Promise<boolean> => {
  return hasRole(uid, "teacher");
};

// ==================== FIRESTORE HELPER FUNCTIONS ====================

export const firestoreGet = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error(`Error getting ${collectionName}/${docId}:`, error);
    return null;
  }
};

export const firestoreSet = async (
  collectionName: string, 
  docId: string, 
  data: DocumentData,
  merge: boolean = true
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { 
      ...data, 
      updatedAt: serverTimestamp() 
    }, { merge });
  } catch (error) {
    console.error(`Error setting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const firestoreAdd = async (
  collectionName: string,
  data: DocumentData
): Promise<string> => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
};

export const firestoreUpdate = async (
  collectionName: string, 
  docId: string, 
  data: Partial<DocumentData>
) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { 
      ...data, 
      updatedAt: serverTimestamp() 
    });
  } catch (error) {
    console.error(`Error updating ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const firestoreDelete = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const firestoreQuery = async <T>(
  collectionName: string,
  conditions: { field: string; op: any; value: any }[],
  orderByField?: string,
  orderDirection: "asc" | "desc" = "desc",
  limitCount?: number
): Promise<T[]> => {
  try {
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
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
};

export const firestoreQueryWithConstraints = async <T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> => {
  try {
    const colRef = collection(db, collectionName);
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as T[];
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
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

// Check if browser supports FCM (Safari iOS doesn't support it fully)
const isSafariIOS = (): boolean => {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
  return iOS && webkit && isSafari;
};

export const initializeMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.log("Notifications not supported in this environment");
    return null;
  }
  
  // Safari on iOS doesn't support Web Push notifications
  if (isSafariIOS()) {
    console.log("FCM not supported on Safari iOS");
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

// Export instances and utilities
export { app, auth, db, Timestamp, collection, doc, query, where, orderBy, limit, getDocs, onSnapshot, serverTimestamp };
export type { FirebaseUserType };
