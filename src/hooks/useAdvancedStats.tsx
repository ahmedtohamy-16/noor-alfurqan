import { useAuth } from "./useAuth";
import { useTasbih } from "./useTasbih";
import { useReadingStats } from "./useReadingStats";
import { getUserRows, refreshActiveState } from "@/lib/userStateStore";
import { subDays } from "date-fns";

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
  const reading = useReadingStats();
  const tasbih = useTasbih();
  const days = { today: 1, week: 7, "30days": 30, "60days": 60, "90days": 90, all: 36500 }[period];
  const date = (d: Date) => d.toLocaleDateString("en-CA");
  const today = date(new Date());
  const start = date(subDays(new Date(), days - 1));
  const previous = date(subDays(new Date(), days * 2 - 1));
  const readings = user ? getUserRows(user.uid, "reading_sessions").map(r => r.payload as any) : [];
  const wirds = user ? getUserRows(user.uid, "daily_wird").map(r => (r.payload.value || r.payload) as any) : [];
  const inCurrent = (d: string) => d >= start && d <= today;
  const inPrevious = (d: string) => d >= previous && d < start;
  const pageCount = (r: any) => r.pages_read ?? Math.abs((r.end_page || 0) - (r.start_page || 0)) + 1;
  const currentReadings = readings.filter(r => inCurrent(r.session_date));
  const previousReadings = readings.filter(r => inPrevious(r.session_date));
  const currentTasbih = tasbih.sessionRecords.filter(r => inCurrent(r.session_date));
  const previousTasbih = tasbih.sessionRecords.filter(r => inPrevious(r.session_date));
  const currentWirds = wirds.filter(r => inCurrent(r.target_date));
  const previousWirds = wirds.filter(r => inPrevious(r.target_date));
  const pages = user ? currentReadings.reduce((n, r) => n + pageCount(r), 0) : reading.stats.pagesRead;
  const previousPages = previousReadings.reduce((n, r) => n + pageCount(r), 0);
  const counts = user ? currentTasbih.reduce((n, r) => n + r.count, 0) : tasbih.stats.totalCount;
  const previousCounts = previousTasbih.reduce((n, r) => n + r.count, 0);
  const complete = currentWirds.filter(r => r.is_completed).length;
  const previousComplete = previousWirds.filter(r => r.is_completed).length;
  const byType = new Map<string, number>();
  currentTasbih.forEach(r => byType.set(r.dhikr, (byType.get(r.dhikr) || 0) + r.count));
  const change = (now: number, old: number) => old ? Math.round((now - old) / old * 100) : now ? 100 : 0;
  const stats: AdvancedStats = {
    totalPagesRead: pages,
    totalReadingTime: user ? currentReadings.reduce((n, r) => n + Number(r.duration_minutes || 0), 0) : reading.stats.totalReadingTime,
    totalSessions: user ? currentReadings.length : reading.stats.sessionsCount,
    khatmahCount: Math.floor(reading.stats.pagesRead / PAGES_PER_KHATMAH),
    streakDays: reading.stats.streakDays,
    todayPagesRead: reading.stats.todayPagesRead,
    totalTasbih: counts, todayTasbih: tasbih.stats.todayCount,
    tasbihByType: user ? [...byType].map(([type, count]) => ({ type, count })) : tasbih.stats.dhikrTypes,
    completedWirdDays: complete,
    wirdCompletionRate: currentWirds.length ? Math.round(complete / currentWirds.length * 100) : 0,
    previousPeriodPagesRead: previousPages, previousPeriodTasbih: previousCounts, previousPeriodWirdDays: previousComplete,
    pagesChangePercent: change(pages, previousPages), tasbihChangePercent: change(counts, previousCounts), wirdChangePercent: change(complete, previousComplete),
  };
  return { stats, isLoading: reading.isLoading || tasbih.isLoading, period, periodLabels: { today: "اليوم", week: "آخر ٧ أيام", "30days": "آخر ٣٠ يوم", "60days": "آخر ٦٠ يوم", "90days": "آخر ٩٠ يوم", all: "كل الوقت" }, refetch: refreshActiveState };
};
