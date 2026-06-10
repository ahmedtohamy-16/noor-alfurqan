import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useHadithShareCount = () => {
  const incrementShare = useCallback(
    async (bookId: string, hadithNumber: number): Promise<number | null> => {
      try {
        const { data, error } = await (supabase as any).rpc("increment_hadith_share", {
          p_book_id: bookId,
          p_hadith_number: hadithNumber,
        });
        if (error) {
          console.warn("increment_hadith_share failed", error);
          return null;
        }
        return typeof data === "number" ? data : null;
      } catch (e) {
        console.warn("increment_hadith_share error", e);
        return null;
      }
    },
    []
  );

  const fetchTopShared = useCallback(
    async (bookId: string | null, limit = 50): Promise<{ bookId: string; hadithNumber: number; count: number }[]> => {
      try {
        let q = (supabase as any)
          .from("hadith_shares")
          .select("book_id, hadith_number, share_count")
          .order("share_count", { ascending: false })
          .limit(limit);
        if (bookId) q = q.eq("book_id", bookId);
        const { data, error } = await q;
        if (error || !data) return [];
        return data.map((r: any) => ({
          bookId: r.book_id,
          hadithNumber: r.hadith_number,
          count: r.share_count,
        }));
      } catch {
        return [];
      }
    },
    []
  );

  return { incrementShare, fetchTopShared };
};
