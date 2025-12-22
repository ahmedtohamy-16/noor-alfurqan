import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

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
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const addFavorite = async (
    surahNumber: number,
    surahName: string,
    ayahNumber: number,
    ayahText: string
  ) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لإضافة المفضلة");
      return false;
    }

    try {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        surah_number: surahNumber,
        surah_name: surahName,
        ayah_number: ayahNumber,
        ayah_text: ayahText,
      });

      if (error) {
        if (error.code === "23505") {
          toast.info("الآية موجودة بالفعل في المفضلة");
          return false;
        }
        throw error;
      }

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
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("surah_number", surahNumber)
        .eq("ayah_number", ayahNumber);

      if (error) throw error;

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
