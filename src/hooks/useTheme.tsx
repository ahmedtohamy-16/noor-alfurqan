import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const newUserId = session?.user?.id ?? null;
        setUserId(newUserId);
        
        // Load theme from DB when user logs in
        if (newUserId) {
          setTimeout(() => {
            loadThemeFromDB(newUserId);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const existingUserId = session?.user?.id ?? null;
      setUserId(existingUserId);
      if (existingUserId) {
        loadThemeFromDB(existingUserId);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadThemeFromDB = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("dark_mode")
        .eq("user_id", uid)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error loading theme:", error);
        return;
      }
      
      if (data && data.dark_mode !== null) {
        const dbTheme = data.dark_mode ? "dark" : "light";
        setThemeState(dbTheme);
        localStorage.setItem("theme", dbTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const saveThemeToDB = async (newTheme: Theme) => {
    if (!userId) return;
    
    try {
      await supabase
        .from("user_settings")
        .upsert({
          user_id: userId,
          dark_mode: newTheme === "dark",
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
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
