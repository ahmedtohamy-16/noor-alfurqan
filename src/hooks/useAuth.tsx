import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { 
  onAuthChange, 
  signIn, 
  signUp, 
  signOut as firebaseSignOut, 
  getCurrentUser,
  FirebaseUser 
} from "@/lib/firebase";

interface AuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Listen for auth state changes
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string, username?: string) => {
    await signUp(email, password, username);
  };

  const handleSignOut = async () => {
    await firebaseSignOut();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        signIn: handleSignIn, 
        signUp: handleSignUp, 
        signOut: handleSignOut 
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
