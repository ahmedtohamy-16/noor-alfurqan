import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({ uid: null as string | null }));
const rpc = vi.hoisted(() => vi.fn());
vi.mock('@/integrations/supabase/untypedClient', () => ({ supabase: {
  auth: { getSession: async () => ({ data: { session: auth.uid ? { user: { id: auth.uid } } : null } }) }, rpc,
} }));
describe('authenticated account hydration', () => {
  beforeEach(() => {
    vi.resetModules(); vi.clearAllMocks(); auth.uid = null;
    const memory = new Map<string, string>();
    vi.stubGlobal('localStorage', { getItem: (key: string) => memory.get(key) ?? null, setItem: (key: string, value: string) => memory.set(key, value) });
    vi.stubGlobal('navigator', { onLine: true });
    vi.stubGlobal('window', { addEventListener: vi.fn() });
    vi.stubGlobal('document', { addEventListener: vi.fn() });
  });
  it('never marks an unauthenticated empty response as fresh user data', async () => {
    const store = await import('./userStateStore');
    store.activateUserState('test'); await store.loadUserState('test');
    expect(rpc).not.toHaveBeenCalled(); expect(store.userStateReady('test')).toBe(false);
    auth.uid = 'test'; rpc.mockResolvedValue({ data: [{ namespace: 'tasbih', key: 'count', payload: { value: 7 } }], error: null });
    await store.loadUserState('test');
    expect(store.getUserRow('test', 'tasbih', 'count')).toEqual({ value: 7 });
    expect(store.userStateReady('test')).toBe(true);
    await store.loadUserState('test'); expect(rpc).toHaveBeenCalledTimes(1);
  });
  it('batches changed records and preserves reset markers without sending unchanged settings', async () => {
    auth.uid = 'test'; rpc.mockResolvedValue({ data: [{ namespace: 'azkar_progress', key: 'today', payload: { value: { a: 4, b: 2 } } }], error: null });
    const store = await import('./userStateStore'); store.activateUserState('test'); await store.loadUserState('test');
    store.queueUserState('test', 'azkar_progress', 'today', { value: { b: 2 } });
    store.queueUserState('test', 'azkar_progress', 'today', { value: { b: 3 } });
    store.queueUserState('test', 'azkar_progress', 'today', { value: { b: 3 } });
    await store.flushUserState('test');
    expect(rpc).toHaveBeenCalledTimes(2);
    expect(rpc).toHaveBeenLastCalledWith('sync_user_state', { changes: [{ namespace: 'azkar_progress', key: 'today', payload: { value: { a: null, b: 3 } }, replace: false, deleted: false }] });
  });
});