import { useCallback } from "react";
import { useSyncedState } from "./useSyncedState";
import { queueUserState, getUserRow } from "@/lib/userStateStore";
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
  const [stats, setStats, status] = useSyncedState<ReadingStats>("reading_stats", user?.uid || "guest", {
    pagesRead: 0,
    totalReadingTime: 0,
    sessionsCount: 0,
    lastSessionDate: "",
    streakDays: 0,
    todayPagesRead: 0,
  }, LOCAL_STORAGE_KEY);

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

      if (user) {
        const date = new Date().toLocaleDateString("en-CA");
        const record = getUserRow(user.uid, "reading_sessions", date) || {};
        queueUserState(user.uid, "reading_sessions", date, {
          ...record, user_id: user.uid, session_date: date, created_at: newStats.lastSessionDate,
          pages_read: Number(record.pages_read || 0) + pagesReadInSession,
          duration_minutes: Number(record.duration_minutes || 0) + readingTimeMinutes,
        });
      }
      return newStats;
    });
  }, [setStats, user?.uid]);

  const incrementPage = useCallback(() => {
    updateStats(1, 0);
  }, [updateStats]);

  const addReadingTime = useCallback((minutes: number) => {
    updateStats(0, minutes);
  }, [updateStats]);

  return {
    stats,
    isLoading: status.isLoading,
    updateStats,
    incrementPage,
    addReadingTime,
  };
};
