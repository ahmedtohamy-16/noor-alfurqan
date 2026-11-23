import { supabase } from '@/integrations/supabase/untypedClient';
import { activateUserState, loadUserState, getUserRow, getUserRows, queueUserState, flushUserState, userSyncError } from './userStateStore';
import type { StatePayload } from './userStateRules';

/** Only personal collections; never roles, Pro grants, support, administration or shared content. */
export const personalCollections = new Set(['favorites', 'user_settings', 'user_reading_settings', 'reading_progress', 'reading_sessions', 'daily_wird', 'user_azkar_progress', 'hadith_bookmarks', 'pinned_hadith', 'notification_history', 'export_logs']);
async function owner() {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) throw new Error('تسجيل الدخول مطلوب');
  activateUserState(uid);
  await loadUserState(uid);
  if (userSyncError()) throw new Error(userSyncError() || 'تعذّر الاتصال');
  return uid;
}
export async function personalGet<T>(namespace: string, key: string): Promise<T | null> {
  const uid = await owner();
  const record = getUserRow(uid, namespace, key);
  return record ? ({ id: key, ...record } as T) : null;
}
export async function personalSet(namespace: string, key: string, payload: StatePayload, merge = true) {
  const uid = await owner();
  if (payload.user_id && payload.user_id !== uid) throw new Error('لا يمكنك تغيير بيانات حساب آخر');
  queueUserState(uid, namespace, key, payload, !merge);
  await flushUserState(uid);
}
export async function personalDelete(namespace: string, key: string) {
  const uid = await owner();
  queueUserState(uid, namespace, key, {}, true, true);
  await flushUserState(uid);
}
export async function personalQuery<T>(namespace: string, conditions: { field: string; op: string; value: unknown }[], orderByField?: string, direction = 'desc', count?: number): Promise<T[]> {
  const uid = await owner();
  if (conditions.some(c => c.field === 'user_id' && c.value !== uid)) throw new Error('بيانات الحساب خاصة');
  let rows = getUserRows(uid, namespace).map(row => ({ id: row.key, ...row.payload }));
  rows = rows.filter(row => conditions.every(c => {
    const value = (row as StatePayload)[c.field];
    return c.op === '==' ? value === c.value : c.op === '>=' ? String(value) >= String(c.value) : c.op === '<=' ? String(value) <= String(c.value) : false;
  }));
  if (orderByField) rows.sort((a, b) => (String((a as StatePayload)[orderByField]).localeCompare(String((b as StatePayload)[orderByField]))) * (direction === 'asc' ? 1 : -1));
  return (count ? rows.slice(0, count) : rows) as T[];
}