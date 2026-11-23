export type StatePayload = Record<string, unknown>;
export const USER_STATE_FRESH_MS = 5 * 60 * 1000;
export const USER_STATE_BATCH_SIZE = 100;
export function mergeState(base: StatePayload, patch: StatePayload): StatePayload {
  const result = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    const previous = result[key];
    result[key] = value && typeof value === 'object' && !Array.isArray(value) && previous && typeof previous === 'object' && !Array.isArray(previous)
      ? mergeState(previous as StatePayload, value as StatePayload) : value;
  }
  return result;
}
export const sameState = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export const changedFields = (before: StatePayload, after: StatePayload): StatePayload =>
  Object.fromEntries(Object.entries(after).filter(([key, value]) => !sameState(before[key], value)));
export const userCacheKey = (uid: string) => `noor:user-state:v1:${uid}`;