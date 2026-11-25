import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./useAuth";
import { useSyncedState } from "./useSyncedState";
import { flushUserState } from "@/lib/userStateStore";

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
  updateSettings: (newSettings: Partial<ReadingSettings>, commit?: boolean) => Promise<void>;
  isLoading: boolean;
}

const ReadingSettingsContext = createContext<ReadingSettingsContextType | undefined>(undefined);

export const ReadingSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [stored, setSettings, status] = useSyncedState<ReadingSettings>("user_reading_settings", user?.uid || "guest", defaultSettings, "readingSettings");
  const settings = { ...defaultSettings, ...stored };
  const isLoading = status.isLoading;
  const updateSettings = async (patch: Partial<ReadingSettings>, commit = true) => {
    setSettings(previous => ({ ...previous, ...patch }));
    if (user && commit) await flushUserState(user.uid);
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
