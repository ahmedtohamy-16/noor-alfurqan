import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSyncedState } from "./useSyncedState";
import { useQuery } from "@tanstack/react-query";
import { getUserRows, queueUserState, subscribeUserState, userStateRevision } from "@/lib/userStateStore";

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
  const [guestStats, setGuestStats] = useState<TasbihStats>({ totalCount: 0, todayCount: 0, dhikrTypes: [], weekCount: 0, streakDays: 0 });
  const [appearance, setAppearance] = useSyncedState<TasbihAppearance>("tasbih", "appearance", defaultAppearance, APPEARANCE_KEY);
  const today = new Date().toLocaleDateString("en-CA");
  useSyncExternalStore(subscribeUserState, userStateRevision, userStateRevision);
  const legacy = useQuery({
    queryKey: ["legacyTasbihSessions", user?.uid], enabled: !!user,
    staleTime: 300000, gcTime: 86400000,
    queryFn: async () => {
      if (!user) return [];
      const rows: { dhikr: string; count: number; session_date: string; created_at: string }[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase.from("tasbih_sessions").select("dhikr,count,session_date,created_at").eq("user_id", user.uid).order("created_at", { ascending: false }).range(from, from + 999);
        if (error) throw error;
        rows.push(...(data || []));
        if (!data || data.length < 1000) break;
      }
      return rows;
    },
  });
  useEffect(() => {
    if (user) return;
    try { const stored = JSON.parse(localStorage.getItem("tasbihStats") || "null"); if (stored) setGuestStats({ ...guestStats, ...stored, todayCount: stored.todayDate === today ? stored.todayCount || 0 : 0 }); }
    catch { /* Ignore broken guest copy. */ }
  }, [user?.uid, today]);
  const sessionRecords = user ? [...(legacy.data || []), ...getUserRows(user.uid, "tasbih_saved_sessions").map(r => r.payload as unknown as { dhikr: string; count: number; session_date: string; created_at: string })].sort((a, b) => b.created_at.localeCompare(a.created_at)) : [];
  const stats = user ? summarize(sessionRecords, today) : guestStats;

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [setCount]);

  const reset = useCallback(() => {
    setCount(0);
  }, [setCount]);

  const saveSession = useCallback(async () => {
    if (count === 0 || saving.current) return;
    saving.current = true;

    const newTodayCount = stats.todayCount + count;
    const newTotalCount = stats.totalCount + count;

    if (user) {
      queueUserState(user.uid, "tasbih_saved_sessions", crypto.randomUUID(), { user_id: user.uid, count, dhikr: currentDhikr.slice(0, 200), session_date: today, created_at: new Date().toISOString() });
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

    if (!user) setGuestStats((prev) => ({
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
  }, [count, saveSession, setCurrentDhikr]);

  const updateAppearance = useCallback((updates: Partial<TasbihAppearance>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...updates };
      return next;
    });
  }, [setAppearance]);

  return {
    count,
    currentDhikr,
    stats,
    isLoading: (!!user && legacy.isLoading) || state.isLoading,
    sessionRecords,
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
