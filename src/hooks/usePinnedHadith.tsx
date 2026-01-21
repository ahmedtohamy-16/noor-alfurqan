import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { firestoreGet, firestoreSet, COLLECTIONS } from "@/lib/firebase";
import { Hadith } from "@/data/hadithBooks";

const PINNED_HADITH_KEY = "pinnedDailyHadith";

interface PinnedHadith extends Hadith {
  pinnedAt: string;
  pinnedDate: string; // YYYY-MM-DD format
}

export const usePinnedHadith = () => {
  const { user } = useAuth();
  const [pinnedHadith, setPinnedHadith] = useState<PinnedHadith | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const loadPinnedHadith = useCallback(async () => {
    setIsLoading(true);
    const today = getTodayDate();

    if (user) {
      try {
        const data = await firestoreGet<PinnedHadith>(
          COLLECTIONS.USER_SETTINGS + "_pinned_hadith",
          user.uid
        );
        
        // Only use if pinned today
        if (data && data.pinnedDate === today) {
          setPinnedHadith(data);
        } else {
          setPinnedHadith(null);
        }
      } catch (error) {
        console.error("Error loading pinned hadith:", error);
        setPinnedHadith(null);
      }
    } else {
      // Use localStorage for non-authenticated users
      const stored = localStorage.getItem(PINNED_HADITH_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored) as PinnedHadith;
          if (data.pinnedDate === today) {
            setPinnedHadith(data);
          } else {
            localStorage.removeItem(PINNED_HADITH_KEY);
            setPinnedHadith(null);
          }
        } catch {
          setPinnedHadith(null);
        }
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadPinnedHadith();
  }, [loadPinnedHadith]);

  const pinHadith = async (hadith: Hadith) => {
    const today = getTodayDate();
    const pinned: PinnedHadith = {
      ...hadith,
      pinnedAt: new Date().toISOString(),
      pinnedDate: today,
    };

    if (user) {
      try {
        await firestoreSet(COLLECTIONS.USER_SETTINGS + "_pinned_hadith", user.uid, pinned);
      } catch (error) {
        console.error("Error pinning hadith:", error);
      }
    } else {
      localStorage.setItem(PINNED_HADITH_KEY, JSON.stringify(pinned));
    }

    setPinnedHadith(pinned);
    return true;
  };

  const unpinHadith = async () => {
    if (user) {
      try {
        await firestoreSet(COLLECTIONS.USER_SETTINGS + "_pinned_hadith", user.uid, null);
      } catch (error) {
        console.error("Error unpinning hadith:", error);
      }
    } else {
      localStorage.removeItem(PINNED_HADITH_KEY);
    }

    setPinnedHadith(null);
    return true;
  };

  const isPinned = (hadith: Hadith | null) => {
    if (!pinnedHadith || !hadith) return false;
    return pinnedHadith.id === hadith.id && pinnedHadith.bookId === hadith.bookId;
  };

  return {
    pinnedHadith,
    isLoading,
    pinHadith,
    unpinHadith,
    isPinned,
    refetch: loadPinnedHadith,
  };
};
