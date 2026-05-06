import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const GUEST_KEY = "noor:asmaFavs";

export const useAsmaFavorites = () => {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const userId = (user as any)?.uid || (user as any)?.id || null;

  const load = useCallback(async () => {
    setLoading(true);
    if (!userId) {
      try {
        const raw = localStorage.getItem(GUEST_KEY);
        setIds(new Set(raw ? JSON.parse(raw) : []));
      } catch { setIds(new Set()); }
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("asma_favorites")
      .select("asma_number")
      .eq("user_id", userId);
    if (error) console.error(error);
    setIds(new Set((data || []).map((r: any) => r.asma_number)));
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const isFavorite = (n: number) => ids.has(n);

  const toggle = async (n: number) => {
    if (!userId) {
      const next = new Set(ids);
      if (next.has(n)) next.delete(n); else next.add(n);
      setIds(next);
      localStorage.setItem(GUEST_KEY, JSON.stringify([...next]));
      toast.success(next.has(n) ? "تمت الإضافة للمفضلة" : "تمت الإزالة");
      return;
    }
    if (ids.has(n)) {
      const { error } = await supabase
        .from("asma_favorites")
        .delete()
        .eq("user_id", userId)
        .eq("asma_number", n);
      if (error) { toast.error("خطأ"); return; }
      const next = new Set(ids); next.delete(n); setIds(next);
      toast.success("تمت الإزالة من المفضلة");
    } else {
      const { error } = await supabase
        .from("asma_favorites")
        .insert({ user_id: userId, asma_number: n });
      if (error) { toast.error("خطأ"); return; }
      const next = new Set(ids); next.add(n); setIds(next);
      toast.success("تمت الإضافة للمفضلة");
    }
  };

  return { isFavorite, toggle, loading, count: ids.size };
};
