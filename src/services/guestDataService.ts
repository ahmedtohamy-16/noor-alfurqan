/**
 * Guest Data Service
 * Manages localStorage data for guest users and handles migration to authenticated accounts
 */

import { 
  firestoreSet, 
  firestoreQuery,
  COLLECTIONS 
} from "@/lib/firebase";

// Storage keys for guest data
export const GUEST_STORAGE_KEYS = {
  FAVORITES: "guest_favorites",
  READING_PROGRESS: "lastRead",
  READING_SETTINGS: "readingSettings",
  USER_SETTINGS: "userSettings",
  READING_STATS: "readingStats",
  PINNED_HADITH: "pinnedDailyHadith",
  DAILY_WIRD: "dailyWird",
  TASBIH_STATS: "tasbihStats",
  SELECTED_RECITER: "selectedReciter",
} as const;

// Type definitions for guest data
export interface GuestFavorite {
  id: string;
  surah_number: number;
  surah_name: string;
  ayah_number: number;
  ayah_text: string;
  created_at: string;
}

export interface GuestReadingProgress {
  surah_number: number;
  ayah_number: number;
  surah_name: string;
  progress_percentage: number;
  last_read_at: string;
}

export interface GuestData {
  favorites: GuestFavorite[];
  readingProgress: GuestReadingProgress | null;
  readingSettings: Record<string, any> | null;
  userSettings: Record<string, any> | null;
  readingStats: Record<string, any> | null;
  pinnedHadith: Record<string, any> | null;
  dailyWird: Record<string, any> | null;
  tasbihStats: Record<string, any> | null;
  selectedReciter: string | null;
}

/**
 * Get all guest data from localStorage
 */
export const getGuestData = (): GuestData => {
  const getData = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  };

  return {
    favorites: getData(GUEST_STORAGE_KEYS.FAVORITES) || [],
    readingProgress: getData(GUEST_STORAGE_KEYS.READING_PROGRESS),
    readingSettings: getData(GUEST_STORAGE_KEYS.READING_SETTINGS),
    userSettings: getData(GUEST_STORAGE_KEYS.USER_SETTINGS),
    readingStats: getData(GUEST_STORAGE_KEYS.READING_STATS),
    pinnedHadith: getData(GUEST_STORAGE_KEYS.PINNED_HADITH),
    dailyWird: getData(GUEST_STORAGE_KEYS.DAILY_WIRD),
    tasbihStats: getData(GUEST_STORAGE_KEYS.TASBIH_STATS),
    selectedReciter: localStorage.getItem(GUEST_STORAGE_KEYS.SELECTED_RECITER),
  };
};

/**
 * Check if there's any guest data to migrate
 */
export const hasGuestData = (): boolean => {
  const guestData = getGuestData();
  return !!(
    guestData.favorites.length > 0 ||
    guestData.readingProgress ||
    guestData.readingSettings ||
    guestData.userSettings ||
    guestData.pinnedHadith ||
    guestData.dailyWird ||
    guestData.tasbihStats
  );
};

/**
 * Save a favorite for guest user
 */
export const saveGuestFavorite = (favorite: Omit<GuestFavorite, "id" | "created_at">): boolean => {
  try {
    const favorites = getGuestData().favorites;
    
    // Check if already exists
    const exists = favorites.some(
      f => f.surah_number === favorite.surah_number && f.ayah_number === favorite.ayah_number
    );
    
    if (exists) return false;
    
    const newFavorite: GuestFavorite = {
      ...favorite,
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    };
    
    favorites.push(newFavorite);
    localStorage.setItem(GUEST_STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error("Error saving guest favorite:", error);
    return false;
  }
};

/**
 * Remove a favorite for guest user
 */
export const removeGuestFavorite = (surahNumber: number, ayahNumber: number): boolean => {
  try {
    const favorites = getGuestData().favorites;
    const filtered = favorites.filter(
      f => !(f.surah_number === surahNumber && f.ayah_number === ayahNumber)
    );
    localStorage.setItem(GUEST_STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing guest favorite:", error);
    return false;
  }
};

/**
 * Check if a verse is favorited by guest
 */
export const isGuestFavorite = (surahNumber: number, ayahNumber: number): boolean => {
  const favorites = getGuestData().favorites;
  return favorites.some(
    f => f.surah_number === surahNumber && f.ayah_number === ayahNumber
  );
};

/**
 * Migrate all guest data to authenticated user account
 */
export const migrateGuestDataToUser = async (userId: string): Promise<{
  success: boolean;
  migratedItems: string[];
  errors: string[];
}> => {
  const guestData = getGuestData();
  const migratedItems: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Migrate favorites
    if (guestData.favorites.length > 0) {
      try {
        for (const fav of guestData.favorites) {
          const docId = `${userId}_${fav.surah_number}_${fav.ayah_number}`;
          await firestoreSet(COLLECTIONS.FAVORITES, docId, {
            user_id: userId,
            surah_number: fav.surah_number,
            surah_name: fav.surah_name,
            ayah_number: fav.ayah_number,
            ayah_text: fav.ayah_text,
            created_at: fav.created_at,
          });
        }
        migratedItems.push(`${guestData.favorites.length} آية مفضلة`);
      } catch (error) {
        console.error("Error migrating favorites:", error);
        errors.push("المفضلة");
      }
    }

    // 2. Migrate reading progress
    if (guestData.readingProgress) {
      try {
        await firestoreSet(COLLECTIONS.READING_PROGRESS, userId, {
          user_id: userId,
          ...guestData.readingProgress,
        });
        migratedItems.push("موضع القراءة الأخير");
      } catch (error) {
        console.error("Error migrating reading progress:", error);
        errors.push("موضع القراءة");
      }
    }

    // 3. Migrate reading settings
    if (guestData.readingSettings) {
      try {
        await firestoreSet(COLLECTIONS.USER_READING_SETTINGS, userId, {
          user_id: userId,
          font_size: guestData.readingSettings.fontSize,
          line_height: guestData.readingSettings.lineHeight,
          theme: guestData.readingSettings.theme,
          font_family: guestData.readingSettings.fontFamily,
          show_translation: guestData.readingSettings.showTranslation,
          selected_translation: guestData.readingSettings.selectedTranslation,
        });
        migratedItems.push("إعدادات القراءة");
      } catch (error) {
        console.error("Error migrating reading settings:", error);
        errors.push("إعدادات القراءة");
      }
    }

    // 4. Migrate user settings (location, notifications, etc.)
    if (guestData.userSettings) {
      try {
        await firestoreSet(COLLECTIONS.USER_SETTINGS, userId, {
          user_id: userId,
          ...guestData.userSettings,
        });
        migratedItems.push("الإعدادات العامة");
      } catch (error) {
        console.error("Error migrating user settings:", error);
        errors.push("الإعدادات العامة");
      }
    }

    // 5. Migrate pinned hadith
    if (guestData.pinnedHadith) {
      try {
        await firestoreSet("pinned_hadiths", userId, {
          ...guestData.pinnedHadith,
          user_id: userId,
        });
        migratedItems.push("الحديث المثبت");
      } catch (error) {
        console.error("Error migrating pinned hadith:", error);
        errors.push("الحديث المثبت");
      }
    }

    // 6. Migrate reading stats
    if (guestData.readingStats) {
      try {
        await firestoreSet("reading_stats", userId, {
          user_id: userId,
          ...guestData.readingStats,
        });
        migratedItems.push("إحصائيات القراءة");
      } catch (error) {
        console.error("Error migrating reading stats:", error);
        errors.push("إحصائيات القراءة");
      }
    }

    // Clear guest data after successful migration
    if (migratedItems.length > 0 && errors.length === 0) {
      clearGuestData();
    }

    return {
      success: errors.length === 0,
      migratedItems,
      errors,
    };
  } catch (error) {
    console.error("Error during migration:", error);
    return {
      success: false,
      migratedItems,
      errors: ["حدث خطأ غير متوقع أثناء نقل البيانات"],
    };
  }
};

/**
 * Clear all guest data from localStorage
 */
export const clearGuestData = (): void => {
  Object.values(GUEST_STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  // Also clear date-specific keys
  const today = new Date().toISOString().split("T")[0];
  localStorage.removeItem(`dailyWird_${today}`);
};

/**
 * Get count of guest data items for display
 */
export const getGuestDataSummary = (): { hasData: boolean; summary: string } => {
  const guestData = getGuestData();
  const items: string[] = [];

  if (guestData.favorites.length > 0) {
    items.push(`${guestData.favorites.length} آية مفضلة`);
  }
  if (guestData.readingProgress) {
    items.push("موضع القراءة");
  }
  if (guestData.readingSettings) {
    items.push("إعدادات الخط");
  }
  if (guestData.pinnedHadith) {
    items.push("حديث مثبت");
  }

  return {
    hasData: items.length > 0,
    summary: items.length > 0 ? items.join("، ") : "",
  };
};
