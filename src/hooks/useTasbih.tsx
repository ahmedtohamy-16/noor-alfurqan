import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface TasbihStats {
  totalCount: number;
  todayCount: number;
  dhikrTypes: { type: string; count: number }[];
}

const defaultDhikrs = [
  "سبحان الله",
  "الحمد لله",
  "الله أكبر",
  "لا إله إلا الله",
  "لا حول ولا قوة إلا بالله",
  "أستغفر الله",
];

export const useTasbih = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [currentDhikr, setCurrentDhikr] = useState(defaultDhikrs[0]);
  const [stats, setStats] = useState<TasbihStats>({ totalCount: 0, todayCount: 0, dhikrTypes: [] });
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const loadStats = async () => {
      if (!user) {
        // Load from localStorage
        const stored = localStorage.getItem("tasbihStats");
        if (stored) {
          const parsed = JSON.parse(stored);
          setStats(parsed);
          if (parsed.currentDhikr) setCurrentDhikr(parsed.currentDhikr);
          if (parsed.todayDate === today && parsed.sessionCount) {
            setCount(parsed.sessionCount);
          }
        }
        return;
      }

      setIsLoading(true);
      
      // Get today's tasbih
      const { data: todayData } = await supabase
        .from("tasbih_stats")
        .select("*")
        .eq("user_id", user.id)
        .eq("session_date", today);

      // Get all time stats
      const { data: allData } = await supabase
        .from("tasbih_stats")
        .select("*")
        .eq("user_id", user.id);

      const todayCount = todayData?.reduce((sum, d) => sum + (d.count || 0), 0) || 0;
      const totalCount = allData?.reduce((sum, d) => sum + (d.count || 0), 0) || 0;

      // Group by dhikr type
      const dhikrMap = new Map<string, number>();
      allData?.forEach((d) => {
        const current = dhikrMap.get(d.dhikr_type || "سبحان الله") || 0;
        dhikrMap.set(d.dhikr_type || "سبحان الله", current + (d.count || 0));
      });

      const dhikrTypes = Array.from(dhikrMap.entries()).map(([type, count]) => ({ type, count }));

      setStats({ totalCount, todayCount, dhikrTypes });
      setIsLoading(false);
    };

    loadStats();
  }, [user, today]);

  const increment = useCallback(() => {
    setCount((prev) => prev + 1);
    
    // Vibration feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  const saveSession = useCallback(async () => {
    if (count === 0) return;

    const newTodayCount = stats.todayCount + count;
    const newTotalCount = stats.totalCount + count;

    if (user) {
      await supabase.from("tasbih_stats").insert({
        user_id: user.id,
        count,
        dhikr_type: currentDhikr,
        session_date: today,
      });
    } else {
      // Save to localStorage
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
    }));
    
    setCount(0);
  }, [count, currentDhikr, stats, today, user]);

  const changeDhikr = useCallback((dhikr: string) => {
    // Save current session before changing
    if (count > 0) {
      saveSession();
    }
    setCurrentDhikr(dhikr);
  }, [count, saveSession]);

  return {
    count,
    currentDhikr,
    stats,
    isLoading,
    increment,
    reset,
    saveSession,
    changeDhikr,
    dhikrOptions: defaultDhikrs,
  };
};
