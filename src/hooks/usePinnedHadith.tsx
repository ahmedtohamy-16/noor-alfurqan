import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { firestoreGet, firestoreSet, firestoreDelete, COLLECTIONS } from "@/lib/firebase";
import { Hadith } from "@/data/hadithBooks";

const PINNED_HADITH_KEY = "pinnedDailyHadith";
const PINNED_HADITH_COLLECTION = "pinned_hadiths";

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
        // Use dedicated collection for pinned hadiths
        const data = await firestoreGet<PinnedHadith>(
          PINNED_HADITH_COLLECTION,
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
        // Fallback to localStorage
        const stored = localStorage.getItem(`${PINNED_HADITH_KEY}_${user.uid}`);
        if (stored) {
          try {
            const data = JSON.parse(stored) as PinnedHadith;
            if (data.pinnedDate === today) {
              setPinnedHadith(data);
            } else {
              localStorage.removeItem(`${PINNED_HADITH_KEY}_${user.uid}`);
              setPinnedHadith(null);
            }
          } catch {
            setPinnedHadith(null);
          }
        } else {
          setPinnedHadith(null);
        }
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
      } else {
        setPinnedHadith(null);
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadPinnedHadith();
  }, [loadPinnedHadith]);

  const pinHadith = async (hadith: Hadith): Promise<boolean> => {
    const today = getTodayDate();
    const pinned: PinnedHadith = {
      ...hadith,
      pinnedAt: new Date().toISOString(),
      pinnedDate: today,
    };

    // Always save to localStorage first as backup
    const storageKey = user ? `${PINNED_HADITH_KEY}_${user.uid}` : PINNED_HADITH_KEY;
    localStorage.setItem(storageKey, JSON.stringify(pinned));

    if (user) {
      try {
        await firestoreSet(PINNED_HADITH_COLLECTION, user.uid, {
          ...pinned,
          user_id: user.uid,
        });
      } catch (error) {
        console.error("Error pinning hadith to Firestore:", error);
        // localStorage backup already saved above
      }
    }

    setPinnedHadith(pinned);
    return true;
  };

  const unpinHadith = async (): Promise<boolean> => {
    // Clear localStorage first
    const storageKey = user ? `${PINNED_HADITH_KEY}_${user.uid}` : PINNED_HADITH_KEY;
    localStorage.removeItem(storageKey);

    if (user) {
      try {
        // Try to delete from Firestore
        await firestoreDelete(PINNED_HADITH_COLLECTION, user.uid);
      } catch (error) {
        console.error("Error unpinning hadith from Firestore:", error);
        // Continue anyway since localStorage is cleared
      }
    }

    setPinnedHadith(null);
    return true;
  };

  const isPinned = (hadith: Hadith | null): boolean => {
    if (!pinnedHadith || !hadith) return false;
    // Compare by id and bookId for accurate matching
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
