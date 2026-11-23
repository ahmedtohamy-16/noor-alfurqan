import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useSyncedState } from "./useSyncedState";

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

  const [savedTheme, saveTheme] = useSyncedState<Theme>("preferences", "theme", theme, "theme.synced");
  useEffect(() => { setThemeState(savedTheme); }, [savedTheme]);
  const saveThemeToDB = (newTheme: Theme) => saveTheme(newTheme);

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