import { supabase } from '@/integrations/supabase/untypedClient';
import { changedFields, composeChanges, mergeState, sameState, userCacheKey, USER_STATE_BATCH_SIZE, USER_STATE_FRESH_MS, type StatePayload } from './userStateRules';

interface Row { namespace: string; key: string; payload: StatePayload; deleted?: boolean; updated_at?: string; }
interface Change extends Row { replace?: boolean; }
interface AccountCache { rows: Row[]; pending: Change[]; fetchedAt: number; }
const accounts = new Map<string, AccountCache>();
const listeners = new Set<() => void>();
let revision = 0;
let activeUid: string | null = null;
let request: Promise<void> | null = null;
let saving: Promise<void> | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let firstDirty = 0;
let lastError: string | null = null;
const emit = () => { revision++; listeners.forEach(fn => fn()); };
export const subscribeUserState = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const userStateRevision = () => revision;
export const userSyncError = () => lastError;
const id = (row: Pick<Row, 'namespace' | 'key'>) => `${row.namespace}:${row.key}`;
function account(uid: string): AccountCache {
  const existing = accounts.get(uid);
  if (existing) return existing;
  let initial: AccountCache = { rows: [], pending: [], fetchedAt: 0 };
  try {
    const raw = localStorage.getItem(userCacheKey(uid));
    if (raw) initial = JSON.parse(raw);
  } catch { /* A broken local copy never authorizes another account. */ }
  accounts.set(uid, initial);
  return initial;
}
const persist = (uid: string) => {
  try { localStorage.setItem(userCacheKey(uid), JSON.stringify(account(uid))); } catch { /* Quota does not stop online saving. */ }
};
export const getUserRow = (uid: string, namespace: string, key: string): StatePayload | null => {
  const row = account(uid).rows.find(r => r.namespace === namespace && r.key === key);
  return row && !row.deleted ? row.payload : null;
};
export const getUserRows = (uid: string, namespace: string) => account(uid).rows.filter(r => r.namespace === namespace && !r.deleted);
export const userStateReady = (uid: string) => account(uid).fetchedAt > 0;

export function activateUserState(uid: string | null) {
  if (activeUid === uid) return;
  activeUid = uid;
  request = null;
  lastError = null;
  if (timer) clearTimeout(timer);
  firstDirty = 0;
  emit();
}
export async function loadUserState(uid: string, force = false): Promise<void> {
  if (activeUid !== uid) return;
  const cache = account(uid);
  if (!force && Date.now() - cache.fetchedAt < USER_STATE_FRESH_MS) return;
  if (request) return request;
  if (!navigator.onLine) return;
  const running = (async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user.id !== uid || activeUid !== uid) return;
      const { data, error } = await supabase.rpc('read_user_state');
      if (error) throw error;
      if (activeUid !== uid) return;
      cache.rows = (data as Row[]) || [];
      for (const patch of cache.pending) apply(cache, patch);
      cache.fetchedAt = Date.now();
      lastError = null;
      persist(uid); emit();
      if (cache.pending.length) void flushUserState(uid).catch(() => {});
    } catch {
      if (activeUid === uid) { lastError = 'تعذّرت المزامنة؛ بياناتك المحفوظة على الجهاز لم تُحذف'; emit(); }
    }
  })();
  request = running;
  try { await running; } finally { if (request === running) request = null; }
}
function apply(cache: AccountCache, patch: Change) {
  const index = cache.rows.findIndex(r => id(r) === id(patch));
  const old = index >= 0 ? cache.rows[index].payload : {};
  const next: Row = { ...patch, payload: patch.replace ? patch.payload : mergeState(old, patch.payload) };
  if (index >= 0) cache.rows[index] = next; else cache.rows.push(next);
}
export function queueUserState(uid: string, namespace: string, key: string, payload: StatePayload, replace = false, deleted = false) {
  if (activeUid !== uid) return;
  const cache = account(uid);
  const previous = getUserRow(uid, namespace, key) || {};
  const patch = replace ? payload : changedFields(previous, payload);
  if (!deleted && (!replace && !Object.keys(patch).length || replace && sameState(previous, payload))) return;
  const change: Change = { namespace, key, payload: patch, replace, deleted };
  apply(cache, change);
  const at = cache.pending.findIndex(r => id(r) === id(change));
  if (at >= 0) {
    const old = cache.pending[at];
    cache.pending[at] = { ...change, replace: replace || old.replace, payload: replace ? payload : composeChanges(old.payload, patch) };
  } else cache.pending.push(change);
  persist(uid); emit();
  if (timer) clearTimeout(timer);
  firstDirty ||= Date.now();
  timer = setTimeout(() => { firstDirty = 0; void flushUserState(uid).catch(() => {}); }, Math.min(1500, Math.max(0, 10000 - (Date.now() - firstDirty))));
}
export async function flushUserState(uid: string): Promise<void> {
  if (activeUid !== uid || !navigator.onLine) return;
  if (saving) { await saving; if (activeUid !== uid) return; }
  const cache = account(uid);
  if (!cache.pending.length) return;
  const running = (async () => {
    while (cache.pending.length && activeUid === uid && navigator.onLine) {
      const batch = cache.pending.slice(0, USER_STATE_BATCH_SIZE);
      const { error } = await supabase.rpc('sync_user_state', { changes: batch });
      if (error) { lastError = 'تعذّر حفظ التغييرات في حسابك؛ أعد المحاولة'; emit(); throw error; }
      cache.pending = cache.pending.filter(change => !batch.includes(change));
      lastError = null; persist(uid); emit();
    }
  })();
  saving = running;
  try { await running; } finally { if (saving === running) saving = null; }
}
export const refreshActiveState = () => { if (activeUid) void loadUserState(activeUid).catch(() => {}); };
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { refreshActiveState(); if (activeUid) void flushUserState(activeUid).catch(() => {}); });
  window.addEventListener('focus', refreshActiveState);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && activeUid) void flushUserState(activeUid).catch(() => {}); });
}