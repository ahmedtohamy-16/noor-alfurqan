import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/untypedClient";
import { useSyncedState } from "./useSyncedState";
import { toast } from "sonner";

const GUEST_KEY = "noor:asmaFavs";

export const useAsmaFavorites = () => {
  const [saved, setSaved, status] = useSyncedState<number[]>("asma_favorites", "names", [], GUEST_KEY);
  const ids = new Set(saved);
  const toggle = async (n: number) => {
    if (!Number.isInteger(n) || n < 1 || n > 99) return;
    setSaved(previous => previous.includes(n) ? previous.filter(id => id !== n) : [...previous, n]);
    toast.success(ids.has(n) ? "تمت الإزالة من المفضلة" : "تمت الإضافة للمفضلة");
  };
  return { isFavorite: (n: number) => ids.has(n), toggle, loading: status.isLoading, count: ids.size };
};
