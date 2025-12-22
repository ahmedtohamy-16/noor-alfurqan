import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface ReadingStats {
  pagesRead: number;
  totalReadingTime: number; // in minutes
  sessionsCount: number;
  lastSessionDate: string;
  streakDays: number;
  todayPagesRead: number;
}

const LOCAL_STORAGE_KEY = "readingStats";

export const useReadingStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReadingStats>({
    pagesRead: 0,
    totalReadingTime: 0,
    sessionsCount: 0,
    lastSessionDate: "",
    streakDays: 0,
    todayPagesRead: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load stats from localStorage or initialize
  useEffect(() => {
    const loadStats = () => {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ReadingStats;
        // Check if it's a new day and reset todayPagesRead
        const today = new Date().toDateString();
        const lastSession = new Date(parsed.lastSessionDate).toDateString();
        if (today !== lastSession) {
          parsed.todayPagesRead = 0;
          // Check streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastSession === yesterday.toDateString()) {
            // Continue streak
          } else if (lastSession !== today) {
            // Break streak
            parsed.streakDays = 0;
          }
        }
        setStats(parsed);
      }
      setIsLoading(false);
    };

    loadStats();
  }, [user]);

  const updateStats = useCallback((pagesReadInSession: number, readingTimeMinutes: number) => {
    setStats((prev) => {
      const today = new Date().toDateString();
      const lastSession = prev.lastSessionDate ? new Date(prev.lastSessionDate).toDateString() : "";
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let newStreak = prev.streakDays;
      if (lastSession !== today) {
        if (lastSession === yesterday.toDateString()) {
          newStreak = prev.streakDays + 1;
        } else if (!lastSession) {
          newStreak = 1;
        } else {
          newStreak = 1;
        }
      }

      const newStats: ReadingStats = {
        pagesRead: prev.pagesRead + pagesReadInSession,
        totalReadingTime: prev.totalReadingTime + readingTimeMinutes,
        sessionsCount: lastSession !== today ? prev.sessionsCount + 1 : prev.sessionsCount,
        lastSessionDate: new Date().toISOString(),
        streakDays: newStreak,
        todayPagesRead: lastSession === today 
          ? prev.todayPagesRead + pagesReadInSession 
          : pagesReadInSession,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const incrementPage = useCallback(() => {
    updateStats(1, 0);
  }, [updateStats]);

  const addReadingTime = useCallback((minutes: number) => {
    updateStats(0, minutes);
  }, [updateStats]);

  return {
    stats,
    isLoading,
    updateStats,
    incrementPage,
    addReadingTime,
  };
};
