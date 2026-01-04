import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  onAuthChange, 
  signIn, 
  signUp, 
  signOut as firebaseSignOut, 
  getCurrentUser,
  getUserRole,
  getUserProfile,
  FirebaseUser,
  UserRole,
  UserProfile
} from "@/lib/firebase";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async (uid: string) => {
    try {
      const [fetchedRole, fetchedProfile] = await Promise.all([
        getUserRole(uid),
        getUserProfile(uid)
      ]);
      setRole(fetchedRole);
      setUserProfile(fetchedProfile);
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

    // Listen for auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadUserData(firebaseUser.uid);
      } else {
        setRole(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (
    email: string, 
    password: string, 
    username?: string,
    userRole: UserRole = "student"
  ) => {
    await signUp(email, password, username, userRole);
  };

  const handleSignOut = async () => {
    await firebaseSignOut();
    setRole(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.uid);
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
        signIn: handleSignIn, 
        signUp: handleSignUp, 
        signOut: handleSignOut,
        refreshProfile
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
