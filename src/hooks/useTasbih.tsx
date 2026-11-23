import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSyncedState } from "./useSyncedState";

export interface TasbihStats {
  totalCount: number;
  todayCount: number;
  dhikrTypes: { type: string; count: number }[];
  weekCount: number;
  streakDays: number;
  lastSession?: { count: number; dhikr: string; at: string };
}

export interface TasbihAppearance {
  beadSpeed: number; // ms transition duration (150 - 800)
  markerCount: number; // divider markers count (2 - 11)
}

const defaultDhikrs = [
  "سبحان الله",
  "الحمد لله",
  "الله أكبر",
  "لا إله إلا الله",
  "لا حول ولا قوة إلا بالله",
  "أستغفر الله",
];

const APPEARANCE_KEY = "tasbihAppearance";

const defaultAppearance: TasbihAppearance = {
  beadSpeed: 300,
  markerCount: 3,
};

function summarize(rows: { dhikr: string; count: number; session_date: string; created_at: string }[], today: string): TasbihStats {
  const map = new Map<string, number>();
  const days = new Set<string>();
  const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];
  let total = 0, todayCount = 0, weekCount = 0;
  for (const r of rows) {
    total += r.count;
    if (r.session_date === today) todayCount += r.count;
    if (r.session_date >= weekAgo) weekCount += r.count;
    days.add(r.session_date);
    map.set(r.dhikr, (map.get(r.dhikr) || 0) + r.count);
  }
  let streakDays = 0;
  for (let d = new Date(today); days.has(d.toISOString().split("T")[0]); d.setDate(d.getDate() - 1)) streakDays++;
  const last = rows[0];
  return {
    totalCount: total, todayCount, weekCount, streakDays,
    dhikrTypes: [...map.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count),
    lastSession: last ? { count: last.count, dhikr: last.dhikr, at: last.created_at } : undefined,
  };
}

export const useTasbih = () => {
  const { user } = useAuth();
  const [count, setCount, state] = useSyncedState<number>("tasbih", "count", 0, "tasbihCurrentCount");
  const [currentDhikr, setCurrentDhikr] = useSyncedState<string>("tasbih", "dhikr", defaultDhikrs[0], "tasbihCurrentDhikr");
  const [dailyGoal, setDailyGoal] = useSyncedState<number>("tasbih", "goal", 1000, "tasbih_daily_goal");
  const saving = useRef(false);
  const [stats, setStats] = useState<TasbihStats>({ totalCount: 0, todayCount: 0, dhikrTypes: [], weekCount: 0, streakDays: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [appearance, setAppearance] = useSyncedState<TasbihAppearance>("tasbih", "appearance", defaultAppearance, APPEARANCE_KEY);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadStats = async () => {
      if (!user) {
        const stored = localStorage.getItem("tasbihStats");
        if (stored) {
          const parsed = JSON.parse(stored);
          setStats((prev) => ({ ...prev, ...parsed, todayCount: parsed.todayDate === today ? parsed.todayCount || 0 : 0 }));
        }
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tasbih_sessions" as any)
          .select("dhikr,count,session_date,created_at")
          .eq("user_id", user.uid)
          .order("created_at", { ascending: false })
          .limit(1000);
        if (error) throw error;
        setStats(summarize((data as any[]) || [], today));
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user, today]);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  const saveSession = useCallback(async () => {
    if (count === 0 || saving.current) return;
    saving.current = true;

    const newTodayCount = stats.todayCount + count;
    const newTotalCount = stats.totalCount + count;

    if (user) {
      const { error } = await supabase.from("tasbih_sessions" as any).insert({
        user_id: user.uid,
        count,
        dhikr: currentDhikr.slice(0, 200),
        session_date: today,
      });
      if (error) { saving.current = false; console.error("Error saving tasbih:", error); throw error; }
    } else {
      const stored = localStorage.getItem("tasbihStats");
      const parsed = stored ? JSON.parse(stored) : { totalCount: 0, todayCount: 0, dhikrTypes: [] };
      
      const updatedStats = {
        ...parsed,
        totalCount: (parsed.totalCount || 0) + count,
        todayCount: parsed.todayDate === today ? (parsed.todayCount || 0) + count : count,
        todayDate: today,
        sessionCount: 0,
        currentDhikr,
      };
      
      localStorage.setItem("tasbihStats", JSON.stringify(updatedStats));
    }

    setStats((prev) => ({
      ...prev,
      totalCount: newTotalCount,
      todayCount: newTodayCount,
      weekCount: prev.weekCount + count,
      lastSession: { count, dhikr: currentDhikr, at: new Date().toISOString() },
    }));
    
    setCount(0);
    saving.current = false;
  }, [count, currentDhikr, stats, today, user, setCount]);

  const changeDhikr = useCallback((dhikr: string) => {
    if (count > 0) {
      void saveSession().then(() => setCurrentDhikr(dhikr)).catch(() => {});
    } else setCurrentDhikr(dhikr);
  }, [count, saveSession]);

  const updateAppearance = useCallback((updates: Partial<TasbihAppearance>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
  }, []);

  return {
    count,
    currentDhikr,
    stats,
    isLoading: isLoading || state.isLoading,
    dailyGoal,
    setDailyGoal,
    appearance,
    increment,
    reset,
    saveSession,
    changeDhikr,
    updateAppearance,
    dhikrOptions: defaultDhikrs,
  };
};
