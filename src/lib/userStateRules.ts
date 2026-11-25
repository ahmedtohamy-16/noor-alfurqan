export type StatePayload = Record<string, unknown>;
export const USER_STATE_FRESH_MS = 5 * 60 * 1000;
export const USER_STATE_BATCH_SIZE = 100;
export function mergeState(base: StatePayload, patch: StatePayload): StatePayload {
  const result = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) { delete result[key]; continue; }
    const previous = result[key];
    result[key] = value && typeof value === 'object' && !Array.isArray(value) && previous && typeof previous === 'object' && !Array.isArray(previous)
      ? mergeState(previous as StatePayload, value as StatePayload) : value;
  }
  return result;
}
export const sameState = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export const changedFields = (before: StatePayload, after: StatePayload, removeMissing = false): StatePayload => {
  const changes: StatePayload = {};
  if (removeMissing) for (const key of Object.keys(before)) if (!(key in after)) changes[key] = null;
  for (const [key, value] of Object.entries(after)) {
    if (sameState(before[key], value)) continue;
    const previous = before[key];
    changes[key] = previous && value && typeof previous === 'object' && typeof value === 'object' && !Array.isArray(previous) && !Array.isArray(value)
      ? changedFields(previous as StatePayload, value as StatePayload, true) : value;
  }
  return changes;
};
export const userCacheKey = (uid: string) => `noor:user-state:v1:${uid}`;
/** Compose queued patches without consuming null deletion markers before the server sees them. */
export function composeChanges(before: StatePayload, patch: StatePayload): StatePayload {
  const result = { ...before };
  for (const [key, value] of Object.entries(patch)) {
    const previous = result[key];
    result[key] = previous && value && typeof previous === 'object' && typeof value === 'object' && !Array.isArray(previous) && !Array.isArray(value)
      ? composeChanges(previous as StatePayload, value as StatePayload) : value;
  }
  return result;
}