import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { COLLECTIONS, firestoreGet, firestoreSet } from "@/lib/firebase";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const { user } = useAuth();

  // Load theme from Firestore when user logs in
  useEffect(() => {
    if (user) {
      loadThemeFromDB(user.uid);
    }
  }, [user]);

  const loadThemeFromDB = async (uid: string) => {
    try {
      const settings = await firestoreGet<any>(COLLECTIONS.USER_SETTINGS, uid);
      
      if (settings && settings.dark_mode !== undefined) {
        const dbTheme = settings.dark_mode ? "dark" : "light";
        setThemeState(dbTheme);
        localStorage.setItem("theme", dbTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const saveThemeToDB = async (newTheme: Theme) => {
    if (!user) return;
    
    try {
      await firestoreSet(COLLECTIONS.USER_SETTINGS, user.uid, {
        user_id: user.uid,
        dark_mode: newTheme === "dark",
      });
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    saveThemeToDB(newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveThemeToDB(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};