export const TAP_MOVEMENT_LIMIT = 10;

export function isStationaryTap(start: { x: number; y: number }, end: { x: number; y: number }): boolean {
  return Math.hypot(end.x - start.x, end.y - start.y) <= TAP_MOVEMENT_LIMIT;
}