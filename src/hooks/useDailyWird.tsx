import { useCallback } from "react";
import { useSyncedState } from "./useSyncedState";
import { toast } from "sonner";

interface DailyWird {
  target_pages: number;
  completed_pages: number;
  is_completed: boolean;
  target_date: string;
}

export const useDailyWird = () => {
  const today = new Date().toLocaleDateString("en-CA");
  const [wird, setWird, status] = useSyncedState<DailyWird | null>("daily_wird", today, null, `dailyWird_${today}`);

  const createOrUpdateWird = useCallback(async (targetPages: number) => {
    const newWird: DailyWird = {
      target_pages: targetPages,
      completed_pages: wird?.completed_pages || 0,
      is_completed: false,
      target_date: today,
    };

    setWird(newWird);

    toast.success("تم تحديث الورد اليومي");
  }, [today, wird, setWird]);

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

    if (isCompleted) toast.success("مبارك! أتممت وردك اليومي");
  }, [wird, setWird]);

  return {
    wird,
    isLoading: status.isLoading,
    createOrUpdateWird,
    updateProgress,
    refetch: () => Promise.resolve(),
  };
};
