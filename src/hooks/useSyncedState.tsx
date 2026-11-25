import { useCallback, useEffect, useRef, useSyncExternalStore, type SetStateAction } from 'react';
import { useAuth } from './useAuth';
import { activateUserState, getUserRow, loadUserState, queueUserState, subscribeUserState, userStateRevision, userStateReady, userSyncError } from '@/lib/userStateStore';
import { sameState } from '@/lib/userStateRules';

const GUEST_EVENT = 'noor:guest-state';
let guestRevision = 0;
const guestListeners = new Set<() => void>();
if (typeof window !== 'undefined') window.addEventListener(GUEST_EVENT, () => { guestRevision++; guestListeners.forEach(fn => fn()); });
const subscribeGuest = (fn: () => void) => { guestListeners.add(fn); return () => { guestListeners.delete(fn); }; };

/** Supabase account-scoped cache; guest storage never silently becomes another member's state. */
export function useSyncedState<T>(namespace: string, key: string, defaultValue: T, guestKey?: string) {
  const { user } = useAuth();
  useSyncExternalStore(subscribeUserState, userStateRevision, userStateRevision);
  useSyncExternalStore(subscribeGuest, () => guestRevision, () => guestRevision);
  useEffect(() => { activateUserState(user?.uid || null); if (user) void loadUserState(user.uid); }, [user?.uid]);
  let value = defaultValue;
  if (user) {
    const payload = getUserRow(user.uid, namespace, key);
    if (payload && 'value' in payload) value = payload.value as T;
  } else if (guestKey) {
    const raw = localStorage.getItem(guestKey);
    if (raw !== null) {
      try { value = JSON.parse(raw) as T; }
      catch { if (typeof defaultValue === 'string') value = raw as T; }
    }
  }
  const current = useRef(value); current.current = value;
  const setter = useCallback((next: SetStateAction<T>) => {
    const result = typeof next === 'function' ? (next as (previous: T) => T)(current.current) : next;
    if (sameState(current.current, result)) return;
    current.current = result;
    if (user) queueUserState(user.uid, namespace, key, { value: result });
    else if (guestKey) { localStorage.setItem(guestKey, JSON.stringify(result)); window.dispatchEvent(new Event(GUEST_EVENT)); }
  }, [user?.uid, namespace, key, guestKey]);
  return [value, setter, { isLoading: !!user && !userStateReady(user.uid) && navigator.onLine && !userSyncError(), error: userSyncError() }] as const;
}