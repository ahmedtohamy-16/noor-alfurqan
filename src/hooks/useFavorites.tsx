import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { 
  firestoreQuery, 
  firestoreSet, 
  firestoreDelete, 
  COLLECTIONS,
  Timestamp 
} from "@/lib/firebase";
import {
  saveGuestFavorite,
  removeGuestFavorite,
  isGuestFavorite,
  getGuestData,
  GUEST_STORAGE_KEYS,
} from "@/services/guestDataService";

interface Favorite {
  id: string;
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  ayah_text: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) {
      // Load guest favorites from localStorage
      const guestData = getGuestData();
      setFavorites(guestData.favorites);
      setIsLoading(false);
      return;
    }

    try {
      const data = await firestoreQuery<Favorite>(
        COLLECTIONS.FAVORITES,
        [{ field: "user_id", op: "==", value: user.uid }],
        "created_at",
        "desc"
      );
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?.uid]);

  const addFavorite = async (
    surahNumber: number,
    surahName: string,
    ayahNumber: number,
    ayahText: string
  ) => {
    // Guest mode - save to localStorage
    if (!user) {
      const success = saveGuestFavorite({
        surah_number: surahNumber,
        surah_name: surahName,
        ayah_number: ayahNumber,
        ayah_text: ayahText,
      });
      
      if (success) {
        toast.success("تمت إضافة الآية للمفضلة");
        await fetchFavorites(); // Refresh list
        return true;
      } else {
        toast.info("الآية موجودة بالفعل في المفضلة");
        return false;
      }
    }

    // Authenticated user - save to Firestore
    try {
      // Check if already exists
      const existing = favorites.find(
        f => f.surah_number === surahNumber && f.ayah_number === ayahNumber
      );
      
      if (existing) {
        toast.info("الآية موجودة بالفعل في المفضلة");
        return false;
      }

      const docId = `${user.uid}_${surahNumber}_${ayahNumber}`;
      await firestoreSet(COLLECTIONS.FAVORITES, docId, {
        user_id: user.uid,
        surah_number: surahNumber,
        surah_name: surahName,
        ayah_number: ayahNumber,
        ayah_text: ayahText,
        created_at: new Date().toISOString(),
      });

      toast.success("تمت إضافة الآية للمفضلة");
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error("Error adding favorite:", error);
      toast.error("حدث خطأ في إضافة المفضلة");
      return false;
    }
  };

  const removeFavorite = async (surahNumber: number, ayahNumber: number) => {
    // Guest mode - remove from localStorage
    if (!user) {
      const success = removeGuestFavorite(surahNumber, ayahNumber);
      if (success) {
        toast.success("تمت إزالة الآية من المفضلة");
        await fetchFavorites();
      }
      return success;
    }

    // Authenticated user - remove from Firestore
    try {
      const docId = `${user.uid}_${surahNumber}_${ayahNumber}`;
      await firestoreDelete(COLLECTIONS.FAVORITES, docId);

      toast.success("تمت إزالة الآية من المفضلة");
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast.error("حدث خطأ في إزالة المفضلة");
      return false;
    }
  };

  const isFavorite = (surahNumber: number, ayahNumber: number) => {
    if (!user) {
      return isGuestFavorite(surahNumber, ayahNumber);
    }
    return favorites.some(
      (fav) => fav.surah_number === surahNumber && fav.ayah_number === ayahNumber
    );
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
};
