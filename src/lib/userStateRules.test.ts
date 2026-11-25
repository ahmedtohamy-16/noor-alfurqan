import { describe, expect, it } from 'vitest';
import { changedFields, composeChanges, mergeState, userCacheKey, USER_STATE_BATCH_SIZE, USER_STATE_FRESH_MS } from './userStateRules';
describe('private cached user state', () => {
  it('separates account caches', () => expect(userCacheKey('one')).not.toBe(userCacheKey('two')));
  it('writes only actual changes', () => {
    expect(changedFields({ count: 4, reciter: 'husary' }, { count: 4, reciter: 'husary' })).toEqual({});
    expect(changedFields({ count: 4, reciter: 'husary' }, { count: 5, reciter: 'husary' })).toEqual({ count: 5 });
    expect(changedFields({ count: 4, user_id: 'one' }, { count: 5 })).toEqual({ count: 5 });
  });
  it('retains unrelated preferences and adhkar entries', () => {
    expect(mergeState({ progress: { '1_1': 5, '2_1': 2 }, fontSize: 24 }, { progress: { '1_1': 6 } })).toEqual({ progress: { '1_1': 6, '2_1': 2 }, fontSize: 24 });
  });
  it('does not resend unchanged nested settings from a stale device', () => {
    expect(changedFields({ value: { fontSize: 24, reciter: 'husary' } }, { value: { fontSize: 24, reciter: 'minshawi' } })).toEqual({ value: { reciter: 'minshawi' } });
  });
  it('limits batches and avoids unchanged reads for five minutes', () => {
    expect(USER_STATE_BATCH_SIZE).toBe(100);
    expect(USER_STATE_FRESH_MS).toBe(300000);
  });
  it('explicitly clears reset adhkar and memorization entries instead of retaining old counters', () => {
    expect(changedFields({ value: { '1_1': 5, '2_1': 2 } }, { value: { '2_1': 2 } })).toEqual({ value: { '1_1': null } });
    expect(mergeState({ value: { '1_1': 5, '2_1': 2 } }, { value: { '1_1': null } })).toEqual({ value: { '2_1': 2 } });
  });
  it('keeps queued reset markers when another dhikr changes before the batch is sent', () => {
    expect(composeChanges({ value: { '1_1': null } }, { value: { '2_1': 3 } })).toEqual({ value: { '1_1': null, '2_1': 3 } });
  });
});