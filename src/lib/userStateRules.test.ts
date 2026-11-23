import { describe, expect, it } from 'vitest';
import { changedFields, mergeState, userCacheKey, USER_STATE_BATCH_SIZE, USER_STATE_FRESH_MS } from './userStateRules';
describe('private cached user state', () => {
  it('separates account caches', () => expect(userCacheKey('one')).not.toBe(userCacheKey('two')));
  it('writes only actual changes', () => {
    expect(changedFields({ count: 4, reciter: 'husary' }, { count: 4, reciter: 'husary' })).toEqual({});
    expect(changedFields({ count: 4, reciter: 'husary' }, { count: 5, reciter: 'husary' })).toEqual({ count: 5 });
  });
  it('retains unrelated preferences and adhkar entries', () => {
    expect(mergeState({ progress: { '1_1': 5, '2_1': 2 }, fontSize: 24 }, { progress: { '1_1': 6 } })).toEqual({ progress: { '1_1': 6, '2_1': 2 }, fontSize: 24 });
  });
  it('limits batches and avoids unchanged reads for five minutes', () => {
    expect(USER_STATE_BATCH_SIZE).toBe(100);
    expect(USER_STATE_FRESH_MS).toBe(300000);
  });
});