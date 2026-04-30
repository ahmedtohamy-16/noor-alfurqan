/**
 * Guest Identity Service
 * Generates and persists a stable Guest ID for unauthenticated users,
 * so their data can be tracked locally and migrated to a real account on sign up.
 */

const GUEST_ID_KEY = "noor:guest-id";
const GUEST_NAME_KEY = "noor:guest-name";
const GUEST_CREATED_AT_KEY = "noor:guest-created-at";

export const getOrCreateGuestId = (): string => {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(GUEST_ID_KEY, id);
    localStorage.setItem(GUEST_NAME_KEY, `ضيف-${id.slice(-4).toUpperCase()}`);
    localStorage.setItem(GUEST_CREATED_AT_KEY, new Date().toISOString());
  }
  return id;
};

export const getGuestId = (): string | null =>
  localStorage.getItem(GUEST_ID_KEY);

export const getGuestDisplayName = (): string => {
  const name = localStorage.getItem(GUEST_NAME_KEY);
  if (name) return name;
  // Initialize on first call
  getOrCreateGuestId();
  return localStorage.getItem(GUEST_NAME_KEY) || "زائر";
};

export const clearGuestIdentity = (): void => {
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_NAME_KEY);
  localStorage.removeItem(GUEST_CREATED_AT_KEY);
};

export const GUEST_IDENTITY_KEYS = {
  GUEST_ID_KEY,
  GUEST_NAME_KEY,
  GUEST_CREATED_AT_KEY,
} as const;
