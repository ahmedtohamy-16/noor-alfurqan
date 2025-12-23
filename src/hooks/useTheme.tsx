import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  // Load theme from database when user logs in
  useEffect(() => {
    if (user) {
      loadThemeFromDB();
    }
  }, [user]);

  const loadThemeFromDB = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("dark_mode")
        .eq("user_id", user.id)
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
    if (!user) return;
    
    try {
      await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
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
