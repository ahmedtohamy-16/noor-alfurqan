import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";
import { firestoreQuery, COLLECTIONS } from "@/lib/firebase";
import { subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

export type TimePeriod = "today" | "week" | "30days" | "60days" | "90days" | "all";

interface ReadingSession {
  start_page: number;
  end_page: number;
  duration_minutes: number;
  session_date: string;
  created_at: string;
}

interface TasbihSession {
  count: number;
  dhikr_type: string;
  session_date: string;
  created_at: string;
}

interface DailyWirdRecord {
  target_pages: number;
  completed_pages: number;
  is_completed: boolean;
  target_date: string;
}

export interface AdvancedStats {
  // Reading Stats
  totalPagesRead: number;
  totalReadingTime: number;
  totalSessions: number;
  khatmahCount: number;
  streakDays: number;
  todayPagesRead: number;
  
  // Tasbih Stats
  totalTasbih: number;
  todayTasbih: number;
  tasbihByType: { type: string; count: number }[];
  
  // Wird Stats
  completedWirdDays: number;
  wirdCompletionRate: number;
  
  // Comparison
  previousPeriodPagesRead: number;
  previousPeriodTasbih: number;
  previousPeriodWirdDays: number;
  pagesChangePercent: number;
  tasbihChangePercent: number;
  wirdChangePercent: number;
}

const PAGES_PER_KHATMAH = 604;

export const useAdvancedStats = (period: TimePeriod = "30days") => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdvancedStats>({
    totalPagesRead: 0,
    totalReadingTime: 0,
    totalSessions: 0,
    khatmahCount: 0,
    streakDays: 0,
    todayPagesRead: 0,
    totalTasbih: 0,
    todayTasbih: 0,
    tasbihByType: [],
    completedWirdDays: 0,
    wirdCompletionRate: 0,
    previousPeriodPagesRead: 0,
    previousPeriodTasbih: 0,
    previousPeriodWirdDays: 0,
    pagesChangePercent: 0,
    tasbihChangePercent: 0,
    wirdChangePercent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const getPeriodDays = useCallback((p: TimePeriod): number => {
    switch (p) {
      case "today": return 1;
      case "week": return 7;
      case "30days": return 30;
      case "60days": return 60;
      case "90days": return 90;
      case "all": return 365 * 10; // 10 years
      default: return 30;
    }
  }, []);

  const periodLabels: Record<TimePeriod, string> = {
    today: "اليوم",
    week: "آخر 7 أيام",
    "30days": "آخر 30 يوم",
    "60days": "آخر 60 يوم",
    "90days": "آخر 90 يوم",
    all: "كل الوقت",
  };

  const calculateStreak = useCallback((sessions: ReadingSession[]): number => {
    if (sessions.length === 0) return 0;
    
    // Sort by date descending
    const sortedDates = [...new Set(sessions.map(s => s.session_date))]
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    const today = new Date().toISOString().split("T")[0];
    const yesterday = subDays(new Date(), 1).toISOString().split("T")[0];
    
    // Check if user has read today or yesterday
    if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
      return 0;
    }
    
    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i - 1]);
      const prevDate = new Date(sortedDates[i]);
      const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  const loadStats = useCallback(async () => {
    if (!user) {
      // Load from localStorage for guests
      const readingStatsStr = localStorage.getItem("readingStats");
      const tasbihStatsStr = localStorage.getItem("tasbihStats");
      
      const readingStats = readingStatsStr ? JSON.parse(readingStatsStr) : {};
      const tasbihStats = tasbihStatsStr ? JSON.parse(tasbihStatsStr) : {};
      
      setStats({
        totalPagesRead: readingStats.pagesRead || 0,
        totalReadingTime: readingStats.totalReadingTime || 0,
        totalSessions: readingStats.sessionsCount || 0,
        khatmahCount: Math.floor((readingStats.pagesRead || 0) / PAGES_PER_KHATMAH),
        streakDays: readingStats.streakDays || 0,
        todayPagesRead: readingStats.todayPagesRead || 0,
        totalTasbih: tasbihStats.totalCount || 0,
        todayTasbih: tasbihStats.todayCount || 0,
        tasbihByType: tasbihStats.dhikrTypes || [],
        completedWirdDays: 0,
        wirdCompletionRate: 0,
        previousPeriodPagesRead: 0,
        previousPeriodTasbih: 0,
        previousPeriodWirdDays: 0,
        pagesChangePercent: 0,
        tasbihChangePercent: 0,
        wirdChangePercent: 0,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const days = getPeriodDays(period);
      const today = new Date();
      const periodStart = startOfDay(subDays(today, days));
      const previousPeriodStart = startOfDay(subDays(today, days * 2));
      const previousPeriodEnd = endOfDay(subDays(today, days + 1));
      
      const todayStr = today.toISOString().split("T")[0];

      // Fetch all data
      const [readingSessions, tasbihSessions, wirdRecords] = await Promise.all([
        firestoreQuery<ReadingSession>(COLLECTIONS.READING_SESSIONS, [
          { field: "user_id", op: "==", value: user.uid },
        ]),
        firestoreQuery<TasbihSession>(COLLECTIONS.TASBIH_STATS, [
          { field: "user_id", op: "==", value: user.uid },
        ]),
        firestoreQuery<DailyWirdRecord>(COLLECTIONS.DAILY_WIRD, [
          { field: "user_id", op: "==", value: user.uid },
        ]),
      ]);

      // Filter by current period
      const currentPeriodReadings = readingSessions.filter(s => {
        const date = new Date(s.session_date || s.created_at);
        return isWithinInterval(date, { start: periodStart, end: today });
      });

      const currentPeriodTasbih = tasbihSessions.filter(s => {
        const date = new Date(s.session_date || s.created_at);
        return isWithinInterval(date, { start: periodStart, end: today });
      });

      const currentPeriodWird = wirdRecords.filter(w => {
        const date = new Date(w.target_date);
        return isWithinInterval(date, { start: periodStart, end: today });
      });

      // Filter by previous period for comparison
      const previousPeriodReadings = readingSessions.filter(s => {
        const date = new Date(s.session_date || s.created_at);
        return isWithinInterval(date, { start: previousPeriodStart, end: previousPeriodEnd });
      });

      const previousPeriodTasbihData = tasbihSessions.filter(s => {
        const date = new Date(s.session_date || s.created_at);
        return isWithinInterval(date, { start: previousPeriodStart, end: previousPeriodEnd });
      });

      const previousPeriodWirdData = wirdRecords.filter(w => {
        const date = new Date(w.target_date);
        return isWithinInterval(date, { start: previousPeriodStart, end: previousPeriodEnd });
      });

      // Calculate current period stats
      const totalPagesRead = currentPeriodReadings.reduce((sum, s) => {
        return sum + Math.abs((s.end_page || 0) - (s.start_page || 0)) + 1;
      }, 0);
      
      const totalReadingTime = currentPeriodReadings.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      
      const todayPagesRead = currentPeriodReadings
        .filter(s => s.session_date === todayStr)
        .reduce((sum, s) => sum + Math.abs((s.end_page || 0) - (s.start_page || 0)) + 1, 0);
      
      const totalTasbih = currentPeriodTasbih.reduce((sum, s) => sum + (s.count || 0), 0);
      
      const todayTasbih = currentPeriodTasbih
        .filter(s => s.session_date === todayStr)
        .reduce((sum, s) => sum + (s.count || 0), 0);

      // Group tasbih by type
      const tasbihMap = new Map<string, number>();
      currentPeriodTasbih.forEach(s => {
        const type = s.dhikr_type || "سبحان الله";
        tasbihMap.set(type, (tasbihMap.get(type) || 0) + (s.count || 0));
      });
      const tasbihByType = Array.from(tasbihMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      // Wird completion
      const completedWirdDays = currentPeriodWird.filter(w => w.is_completed).length;
      const wirdCompletionRate = currentPeriodWird.length > 0 
        ? Math.round((completedWirdDays / currentPeriodWird.length) * 100) 
        : 0;

      // Previous period stats
      const previousPeriodPagesRead = previousPeriodReadings.reduce((sum, s) => {
        return sum + Math.abs((s.end_page || 0) - (s.start_page || 0)) + 1;
      }, 0);
      
      const previousPeriodTasbih = previousPeriodTasbihData.reduce((sum, s) => sum + (s.count || 0), 0);
      
      const previousPeriodWirdDays = previousPeriodWirdData.filter(w => w.is_completed).length;

      // Calculate percentage changes
      const pagesChangePercent = previousPeriodPagesRead > 0 
        ? Math.round(((totalPagesRead - previousPeriodPagesRead) / previousPeriodPagesRead) * 100)
        : totalPagesRead > 0 ? 100 : 0;
        
      const tasbihChangePercent = previousPeriodTasbih > 0 
        ? Math.round(((totalTasbih - previousPeriodTasbih) / previousPeriodTasbih) * 100)
        : totalTasbih > 0 ? 100 : 0;
        
      const wirdChangePercent = previousPeriodWirdDays > 0 
        ? Math.round(((completedWirdDays - previousPeriodWirdDays) / previousPeriodWirdDays) * 100)
        : completedWirdDays > 0 ? 100 : 0;

      // Use all sessions for calculating streak (not filtered by period)
      const streakDays = calculateStreak(readingSessions);
      
      // Calculate khatmah count from all time
      const allTimePagesRead = readingSessions.reduce((sum, s) => {
        return sum + Math.abs((s.end_page || 0) - (s.start_page || 0)) + 1;
      }, 0);
      const khatmahCount = Math.floor(allTimePagesRead / PAGES_PER_KHATMAH);

      setStats({
        totalPagesRead,
        totalReadingTime,
        totalSessions: currentPeriodReadings.length,
        khatmahCount,
        streakDays,
        todayPagesRead,
        totalTasbih,
        todayTasbih,
        tasbihByType,
        completedWirdDays,
        wirdCompletionRate,
        previousPeriodPagesRead,
        previousPeriodTasbih,
        previousPeriodWirdDays,
        pagesChangePercent,
        tasbihChangePercent,
        wirdChangePercent,
      });
    } catch (error) {
      console.error("Error loading advanced stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, period, getPeriodDays, calculateStreak]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    period,
    periodLabels,
    refetch: loadStats,
  };
};
