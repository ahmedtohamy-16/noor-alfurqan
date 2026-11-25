/**
 * Guest Data Service
 * Manages localStorage data for guest users and handles migration to authenticated accounts
 */

import { supabase } from "@/integrations/supabase/untypedClient";
import { activateUserState, loadUserState, getUserRow, queueUserState, flushUserState, userSyncError } from "@/lib/userStateStore";
import { getGuestId, clearGuestIdentity, GUEST_IDENTITY_KEYS } from "./guestIdentityService";

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
    dailyWird: getData(`dailyWird_${new Date().toLocaleDateString("en-CA")}`) || getData(GUEST_STORAGE_KEYS.DAILY_WIRD),
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
    guestData.readingStats || guestData.selectedReciter ||
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
  const migratedItems: string[] = [];
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user.id !== userId) throw new Error("لا يمكن نقل البيانات إلى حساب آخر");
    if (!navigator.onLine) throw new Error("اتصل بالإنترنت قبل نقل بيانات الضيف");
    activateUserState(userId);
    await loadUserState(userId, true);
    if (userSyncError()) throw new Error("تعذّرت قراءة بيانات الحساب؛ لم يُنقل أو يُحذف شيء");
    const guest = getGuestData();
    const copyMissing = (namespace: string, key: string, payload: Record<string, unknown>, label: string) => {
      if (getUserRow(userId, namespace, key)) return;
      queueUserState(userId, namespace, key, payload);
      migratedItems.push(label);
    };
    for (const fav of guest.favorites) copyMissing("favorites", `${userId}_${fav.surah_number}_${fav.ayah_number}`, { ...fav, user_id: userId }, "آية مفضلة");
    if (guest.readingProgress) copyMissing("reading_progress", userId, { value: guest.readingProgress }, "موضع القراءة");
    if (guest.readingSettings) copyMissing("user_reading_settings", userId, { value: guest.readingSettings }, "إعدادات القراءة");
    if (guest.userSettings) copyMissing("user_settings", userId, { value: guest.userSettings }, "الإعدادات العامة");
    if (guest.readingStats) copyMissing("reading_stats", userId, { value: guest.readingStats }, "إحصائيات القراءة");
    if (guest.pinnedHadith) copyMissing("pinned_hadiths", userId, { ...guest.pinnedHadith, user_id: userId }, "الحديث المثبت");
    if (guest.dailyWird) copyMissing("daily_wird", guest.dailyWird.target_date || new Date().toLocaleDateString("en-CA"), { value: guest.dailyWird }, "الورد اليومي");
    if (guest.selectedReciter) copyMissing("audio_preferences", "player", { value: { reciterId: guest.selectedReciter.replace(/^"|"$/g, ""), playMode: "surah", volume: 80, playbackRate: 1 } }, "القارئ");
    const count = Number(localStorage.getItem("tasbihCount") || 0);
    if (count) copyMissing("tasbih", "count", { value: count }, "عداد التسبيح");
    await flushUserState(userId);
    // Preserve guest originals and any existing account record; never delete settled history.
    return { success: true, migratedItems: [...new Set(migratedItems)], errors: [] };
  } catch {
    return { success: false, migratedItems: [], errors: ["تعذّر النقل؛ بياناتك على الجهاز لم تُحذف"] };
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
  // Clear guest identity (id + display name)
  clearGuestIdentity();
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
