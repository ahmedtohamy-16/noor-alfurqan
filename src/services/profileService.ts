import { 
  firestoreGet, 
  firestoreSet, 
  firestoreUpdate,
  firestoreAdd,
  firestoreQuery,
  COLLECTIONS,
  Timestamp,
  serverTimestamp
} from "@/lib/firebase";

export interface ProfileData {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  city_name?: string;
  latitude?: number;
  longitude?: number;
  is_blocked?: boolean;
  created_at?: Timestamp;
  last_username_change?: Timestamp;
  last_displayname_change?: Timestamp;
  username_change_count?: number;
  displayname_change_count?: number;
}

export interface ProfileChangeLog {
  id?: string;
  user_id: string;
  change_type: 'username' | 'display_name' | 'avatar' | 'email';
  old_value?: string;
  new_value?: string;
  user_agent?: string;
  changed_at: Timestamp;
}

// Time restrictions (in days)
const USERNAME_CHANGE_COOLDOWN_DAYS = 30;
const DISPLAYNAME_CHANGE_COOLDOWN_DAYS = 7;
const MAX_DISPLAYNAME_CHANGES_PER_WEEK = 3;

// Get user profile
export const getProfile = async (userId: string): Promise<ProfileData | null> => {
  return firestoreGet<ProfileData>(COLLECTIONS.PROFILES, userId);
};

// Check if username is available
export const isUsernameAvailable = async (username: string, currentUserId?: string): Promise<boolean> => {
  const profiles = await firestoreQuery<ProfileData>(
    COLLECTIONS.PROFILES,
    [{ field: "username", op: "==", value: username }]
  );
  
  if (profiles.length === 0) return true;
  if (currentUserId && profiles.length === 1 && profiles[0].id === currentUserId) return true;
  return false;
};

// Check if user can change username (30 day cooldown)
export const canChangeUsername = (profile: ProfileData): { allowed: boolean; daysRemaining: number } => {
  if (!profile.last_username_change) {
    return { allowed: true, daysRemaining: 0 };
  }
  
  const lastChange = profile.last_username_change.toDate();
  const now = new Date();
  const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceChange >= USERNAME_CHANGE_COOLDOWN_DAYS) {
    return { allowed: true, daysRemaining: 0 };
  }
  
  return { 
    allowed: false, 
    daysRemaining: USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange 
  };
};

// Check if user can change display name (7 day cooldown, max 3 per week)
export const canChangeDisplayName = (profile: ProfileData): { allowed: boolean; daysRemaining: number; changesThisWeek: number } => {
  const changesThisWeek = profile.displayname_change_count || 0;
  
  if (changesThisWeek >= MAX_DISPLAYNAME_CHANGES_PER_WEEK) {
    return { allowed: false, daysRemaining: 7, changesThisWeek };
  }
  
  if (!profile.last_displayname_change) {
    return { allowed: true, daysRemaining: 0, changesThisWeek };
  }
  
  const lastChange = profile.last_displayname_change.toDate();
  const now = new Date();
  const daysSinceChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceChange >= DISPLAYNAME_CHANGE_COOLDOWN_DAYS) {
    return { allowed: true, daysRemaining: 0, changesThisWeek: 0 };
  }
  
  return { 
    allowed: false, 
    daysRemaining: DISPLAYNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange,
    changesThisWeek 
  };
};

// Update username with restrictions
export const updateUsername = async (
  userId: string, 
  newUsername: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const profile = await getProfile(userId);
    if (!profile) {
      return { success: false, error: "الملف الشخصي غير موجود" };
    }
    
    // Check cooldown
    const { allowed, daysRemaining } = canChangeUsername(profile);
    if (!allowed) {
      return { success: false, error: `يمكنك تغيير اسم المستخدم بعد ${daysRemaining} يوم` };
    }
    
    // Check availability
    const available = await isUsernameAvailable(newUsername, userId);
    if (!available) {
      return { success: false, error: "اسم المستخدم مستخدم بالفعل" };
    }
    
    // Validate username format
    const usernameRegex = /^[\u0600-\u06FFa-zA-Z0-9_]{3,50}$/;
    if (!usernameRegex.test(newUsername)) {
      return { success: false, error: "اسم المستخدم يجب أن يكون 3-50 حرف (حروف أو أرقام أو _)" };
    }
    
    const oldUsername = profile.username;
    
    // Update profile
    await firestoreUpdate(COLLECTIONS.PROFILES, userId, {
      username: newUsername,
      last_username_change: Timestamp.now(),
      username_change_count: (profile.username_change_count || 0) + 1
    });
    
    // Log the change
    await logProfileChange(userId, 'username', oldUsername, newUsername);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating username:", error);
    return { success: false, error: error.message || "حدث خطأ" };
  }
};

// Update display name with restrictions
export const updateDisplayName = async (
  userId: string, 
  newDisplayName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const profile = await getProfile(userId);
    if (!profile) {
      return { success: false, error: "الملف الشخصي غير موجود" };
    }
    
    // Check cooldown
    const { allowed, daysRemaining, changesThisWeek } = canChangeDisplayName(profile);
    if (!allowed) {
      if (changesThisWeek >= MAX_DISPLAYNAME_CHANGES_PER_WEEK) {
        return { success: false, error: `وصلت للحد الأقصى (${MAX_DISPLAYNAME_CHANGES_PER_WEEK} مرات أسبوعياً)` };
      }
      return { success: false, error: `يمكنك تغيير الاسم بعد ${daysRemaining} يوم` };
    }
    
    // Validate display name
    if (newDisplayName.length < 2 || newDisplayName.length > 100) {
      return { success: false, error: "الاسم يجب أن يكون 2-100 حرف" };
    }
    
    const oldDisplayName = profile.display_name;
    
    // Update profile
    await firestoreUpdate(COLLECTIONS.PROFILES, userId, {
      display_name: newDisplayName,
      last_displayname_change: Timestamp.now(),
      displayname_change_count: (profile.displayname_change_count || 0) + 1
    });
    
    // Log the change
    await logProfileChange(userId, 'display_name', oldDisplayName, newDisplayName);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating display name:", error);
    return { success: false, error: error.message || "حدث خطأ" };
  }
};

// Update avatar
export const updateAvatar = async (
  userId: string, 
  avatarUrl: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const profile = await getProfile(userId);
    const oldAvatar = profile?.avatar_url;
    
    await firestoreUpdate(COLLECTIONS.PROFILES, userId, {
      avatar_url: avatarUrl
    });
    
    // Log the change
    await logProfileChange(userId, 'avatar', oldAvatar || '', avatarUrl);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error updating avatar:", error);
    return { success: false, error: error.message || "حدث خطأ" };
  }
};

// Log profile changes
const logProfileChange = async (
  userId: string,
  changeType: ProfileChangeLog['change_type'],
  oldValue?: string,
  newValue?: string
) => {
  try {
    await firestoreAdd('profile_changes_log', {
      user_id: userId,
      change_type: changeType,
      old_value: oldValue || null,
      new_value: newValue || null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      changed_at: Timestamp.now()
    });
  } catch (error) {
    console.error("Error logging profile change:", error);
  }
};

// Get profile change history
export const getProfileChangeHistory = async (userId: string): Promise<ProfileChangeLog[]> => {
  return firestoreQuery<ProfileChangeLog>(
    'profile_changes_log',
    [{ field: "user_id", op: "==", value: userId }],
    "changed_at",
    "desc",
    50
  );
};

// Format date for display (Arabic)
export const formatJoinDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return "غير معروف";
  
  const date = timestamp.toDate();
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  return date.toLocaleDateString('ar-SA', options);
};
