import { useCallback } from "react";
import { useSyncedState } from "./useSyncedState";
import { loadUserState } from "@/lib/userStateStore";
import { useAuth } from "./useAuth";
interface ReadingProgress {
  surah_number: number;
  ayah_number: number;
  surah_name: string;
  progress_percentage: number;
  last_read_at: string;
}

export const useReadingProgress = () => {
  const { user } = useAuth();
  const [lastRead, setLastRead, status] = useSyncedState<ReadingProgress | null>("reading_progress", user?.uid || "guest", null, "lastRead");

  const saveProgress = useCallback(async (
    surahNumber: number,
    ayahNumber: number,
    surahName: string,
    totalAyahs: number
  ) => {
    const progressPercentage = Math.round((ayahNumber / totalAyahs) * 100);
    const progress: ReadingProgress = {
      surah_number: surahNumber,
      ayah_number: ayahNumber,
      surah_name: surahName,
      progress_percentage: progressPercentage,
      last_read_at: new Date().toISOString(),
    };

    setLastRead(progress);

  }, [setLastRead]);

  return {
    lastRead,
    isLoading: status.isLoading,
    saveProgress,
    refetch: () => user ? loadUserState(user.uid, true) : Promise.resolve(),
  };
};
