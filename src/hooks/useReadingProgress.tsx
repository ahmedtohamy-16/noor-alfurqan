import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [lastRead, setLastRead] = useState<ReadingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLastRead();
    } else {
      const saved = localStorage.getItem("lastRead");
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
      setIsLoading(false);
    }
  }, [user]);

  const fetchLastRead = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("last_read_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching progress:", error);
      }

      if (data) {
        setLastRead({
          surah_number: data.surah_number,
          ayah_number: data.ayah_number,
          surah_name: data.surah_name,
          progress_percentage: Number(data.progress_percentage) || 0,
          last_read_at: data.last_read_at || "",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

    if (user) {
      try {
        await supabase
          .from("reading_progress")
          .upsert({
            user_id: user.id,
            surah_number: surahNumber,
            ayah_number: ayahNumber,
            surah_name: surahName,
            progress_percentage: progressPercentage,
            last_read_at: new Date().toISOString(),
          }, { onConflict: "user_id,surah_number" });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    } else {
      localStorage.setItem("lastRead", JSON.stringify(progress));
    }
  }, [user]);

  return {
    lastRead,
    isLoading,
    saveProgress,
    refetch: fetchLastRead,
  };
};
