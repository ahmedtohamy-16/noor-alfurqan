import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  theme: "simple" | "decorated" | "classic" | "sepia" | "night" | "nature" | "ocean" | "royal";
  fontFamily: "Amiri" | "Scheherazade" | "Noto Naskh" | "Uthmani";
  showTranslation: boolean;
  selectedTranslation: string | null;
}

const defaultSettings: ReadingSettings = {
  fontSize: 24,
  lineHeight: 2,
  theme: "simple",
  fontFamily: "Amiri",
  showTranslation: false,
  selectedTranslation: null,
};

interface ReadingSettingsContextType {
  settings: ReadingSettings;
  updateSettings: (newSettings: Partial<ReadingSettings>) => Promise<void>;
  isLoading: boolean;
}

const ReadingSettingsContext = createContext<ReadingSettingsContextType | undefined>(undefined);

export const ReadingSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      if (user) {
        // Load from database
        const { data, error } = await supabase
          .from("user_reading_settings")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          setSettings({
            fontSize: data.font_size || defaultSettings.fontSize,
            lineHeight: Number(data.line_height) || defaultSettings.lineHeight,
            theme: (data.theme as ReadingSettings["theme"]) || defaultSettings.theme,
            fontFamily: (data.font_family as ReadingSettings["fontFamily"]) || defaultSettings.fontFamily,
            showTranslation: data.show_translation ?? defaultSettings.showTranslation,
            selectedTranslation: data.selected_translation || null,
          });
        } else {
          // Load from localStorage as fallback
          const stored = localStorage.getItem("readingSettings");
          if (stored) {
            setSettings({ ...defaultSettings, ...JSON.parse(stored) });
          }
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem("readingSettings");
        if (stored) {
          setSettings({ ...defaultSettings, ...JSON.parse(stored) });
        }
      }
      
      setIsLoading(false);
    };

    loadSettings();
  }, [user]);

  const updateSettings = async (newSettings: Partial<ReadingSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Save to localStorage always
    localStorage.setItem("readingSettings", JSON.stringify(updated));

    if (user) {
      // Save to database
      const { error } = await supabase
        .from("user_reading_settings")
        .upsert({
          user_id: user.id,
          font_size: updated.fontSize,
          line_height: updated.lineHeight,
          theme: updated.theme,
          font_family: updated.fontFamily,
          show_translation: updated.showTranslation,
          selected_translation: updated.selectedTranslation,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) {
        console.error("Error saving reading settings:", error);
      }
    }
  };

  return (
    <ReadingSettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </ReadingSettingsContext.Provider>
  );
};

export const useReadingSettings = () => {
  const context = useContext(ReadingSettingsContext);
  if (context === undefined) {
    throw new Error("useReadingSettings must be used within a ReadingSettingsProvider");
  }
  return context;
};
