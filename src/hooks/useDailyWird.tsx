import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface DailyWird {
  target_pages: number;
  completed_pages: number;
  is_completed: boolean;
  target_date: string;
}

export const useDailyWird = () => {
  const { user } = useAuth();
  const [wird, setWird] = useState<DailyWird | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) {
      fetchTodayWird();
    } else {
      const saved = localStorage.getItem(`dailyWird_${today}`);
      if (saved) {
        setWird(JSON.parse(saved));
      }
      setIsLoading(false);
    }
  }, [user, today]);

  const fetchTodayWird = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("daily_wird")
        .select("*")
        .eq("user_id", user.id)
        .eq("target_date", today)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching wird:", error);
      }

      if (data) {
        setWird({
          target_pages: data.target_pages || 2,
          completed_pages: data.completed_pages || 0,
          is_completed: data.is_completed || false,
          target_date: data.target_date || today,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrUpdateWird = useCallback(async (targetPages: number) => {
    const newWird: DailyWird = {
      target_pages: targetPages,
      completed_pages: wird?.completed_pages || 0,
      is_completed: false,
      target_date: today,
    };

    setWird(newWird);

    if (user) {
      try {
        await supabase
          .from("daily_wird")
          .upsert({
            user_id: user.id,
            target_pages: targetPages,
            completed_pages: newWird.completed_pages,
            is_completed: false,
            target_date: today,
          }, { onConflict: "user_id,target_date" });
        
        toast.success("تم تحديث الورد اليومي");
      } catch (error) {
        console.error("Error:", error);
        toast.error("حدث خطأ في حفظ الورد");
      }
    } else {
      localStorage.setItem(`dailyWird_${today}`, JSON.stringify(newWird));
    }
  }, [user, today, wird]);

  const updateProgress = useCallback(async (pagesRead: number) => {
    if (!wird) return;

    const newCompleted = Math.min(wird.completed_pages + pagesRead, wird.target_pages);
    const isCompleted = newCompleted >= wird.target_pages;

    const updatedWird: DailyWird = {
      ...wird,
      completed_pages: newCompleted,
      is_completed: isCompleted,
    };

    setWird(updatedWird);

    if (user) {
      try {
        await supabase
          .from("daily_wird")
          .upsert({
            user_id: user.id,
            target_pages: wird.target_pages,
            completed_pages: newCompleted,
            is_completed: isCompleted,
            target_date: today,
          }, { onConflict: "user_id,target_date" });

        if (isCompleted) {
          toast.success("🎉 مبارك! أتممت وردك اليومي");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      localStorage.setItem(`dailyWird_${today}`, JSON.stringify(updatedWird));
    }
  }, [user, today, wird]);

  return {
    wird,
    isLoading,
    createOrUpdateWird,
    updateProgress,
    refetch: fetchTodayWird,
  };
};
