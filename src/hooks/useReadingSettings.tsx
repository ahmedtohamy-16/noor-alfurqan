import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { firestoreGet, firestoreSet, COLLECTIONS } from "@/lib/firebase";

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
        try {
          const data = await firestoreGet<any>(COLLECTIONS.USER_READING_SETTINGS, user.uid);

          if (data) {
            setSettings({
              fontSize: data.font_size || defaultSettings.fontSize,
              lineHeight: Number(data.line_height) || defaultSettings.lineHeight,
              theme: (data.theme as ReadingSettings["theme"]) || defaultSettings.theme,
              fontFamily: (data.font_family as ReadingSettings["fontFamily"]) || defaultSettings.fontFamily,
              showTranslation: data.show_translation ?? defaultSettings.showTranslation,
              selectedTranslation: data.selected_translation || null,
            });
          } else {
            const stored = localStorage.getItem("readingSettings");
            if (stored) {
              setSettings({ ...defaultSettings, ...JSON.parse(stored) });
            }
          }
        } catch (error) {
          console.error("Error loading reading settings:", error);
          const stored = localStorage.getItem("readingSettings");
          if (stored) {
            setSettings({ ...defaultSettings, ...JSON.parse(stored) });
          }
        }
      } else {
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
    
    localStorage.setItem("readingSettings", JSON.stringify(updated));

    if (user) {
      try {
        await firestoreSet(COLLECTIONS.USER_READING_SETTINGS, user.uid, {
          user_id: user.uid,
          font_size: updated.fontSize,
          line_height: updated.lineHeight,
          theme: updated.theme,
          font_family: updated.fontFamily,
          show_translation: updated.showTranslation,
          selected_translation: updated.selectedTranslation,
        });
      } catch (error) {
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
