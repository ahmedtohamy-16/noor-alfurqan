import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  onAuthChange, 
  signIn as firebaseSignIn, 
  signUp as firebaseSignUp, 
  signOut as firebaseSignOut,
  signInWithGoogle as firebaseSignInWithGoogle,
  handleGoogleRedirect,
  getCurrentUser,
  getUserRole,
  getUserProfile,
  FirebaseUser,
  UserRole,
  UserProfile,
  firestoreQuery,
  COLLECTIONS
} from "@/lib/firebase";
import { toast } from "sonner";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isBanned: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string, role?: UserRole) => Promise<void>;
  signInWithGoogle: (role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkUserBanned: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  const loadUserData = async (uid: string) => {
    try {
      const [fetchedRole, fetchedProfile] = await Promise.all([
        getUserRole(uid),
        getUserProfile(uid)
      ]);
      setRole(fetchedRole);
      setUserProfile(fetchedProfile);

      // Check if user is banned in Firestore
      if (fetchedProfile && (fetchedProfile as any).isBanned) {
        setIsBanned(true);
        await firebaseSignOut();
        toast.error("حسابك محظور. تواصل مع الإدارة للمزيد من المعلومات");
        return;
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  useEffect(() => {
    // Check for existing user
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadUserData(currentUser.uid);
    }

    // Handle Google redirect result on mount
    handleGoogleRedirect().then((redirectUser) => {
      if (redirectUser) {
        setUser({
          uid: redirectUser.uid,
          email: redirectUser.email,
          displayName: redirectUser.displayName,
          photoURL: redirectUser.photoURL,
          emailVerified: redirectUser.emailVerified,
        });
        loadUserData(redirectUser.uid);
      }
    }).catch(console.error);

    // Listen for auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid);
      } else {
        setRole(null);
        setUserProfile(null);
        setIsBanned(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      await firebaseSignIn(email, password);
    } catch (error: any) {
      // Check for disabled user (banned)
      if (error.code === "auth/user-disabled") {
        setIsBanned(true);
        throw error;
      }
      throw error;
    }
  };

  const handleSignUp = async (
    email: string, 
    password: string, 
    username?: string,
    userRole: UserRole = "student"
  ) => {
    await firebaseSignUp(email, password, username, userRole);
  };

  const handleSignOut = async () => {
    await firebaseSignOut();
    setRole(null);
    setUserProfile(null);
    setIsBanned(false);
  };

  const handleGoogleSignIn = async (userRole: UserRole = "student") => {
    try {
      await firebaseSignInWithGoogle(userRole);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        // User closed the popup, don't show error
        return;
      }
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.uid);
    }
  };

  // Check if a user is banned by email (before sign in)
  const checkUserBanned = async (email: string): Promise<boolean> => {
    try {
      const users = await firestoreQuery<any>(
        COLLECTIONS.USERS,
        [{ field: "email", op: "==", value: email }],
        undefined,
        "desc",
        1
      );

      if (users.length > 0 && users[0].isBanned) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking banned status:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        userProfile,
        role,
        isLoading, 
        isAdmin: role === "admin",
        isTeacher: role === "teacher" || role === "admin",
        isBanned,
        signIn: handleSignIn, 
        signUp: handleSignUp,
        signInWithGoogle: handleGoogleSignIn,
        signOut: handleSignOut,
        refreshProfile,
        checkUserBanned
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
