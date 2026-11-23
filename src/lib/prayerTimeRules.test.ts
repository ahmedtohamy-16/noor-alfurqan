import { describe, expect, it } from 'vitest';
import { localDateAt, nextDate, prayerClock, zonedInstant, normalizePrayerDay, upcomingPrayer, prayerDayUrl } from '../../supabase/functions/_shared/prayerTimeRules';
const context = { latitude: 30.53766, longitude: 31.67875, timeZone: 'Africa/Cairo', method: 5, school: 0 };
describe('location-local prayer accuracy', () => {
  it('uses Abu Hammad Egyptian method and coordinates, not device time', () => {
    const u = new URL(prayerDayUrl(context, '2026-11-24'));
    expect(u.searchParams.get('method')).toBe('5');
    expect(u.searchParams.get('latitude')).toBe('30.53766');
    expect(u.searchParams.get('timezonestring')).toBe('Africa/Cairo');
    expect(localDateAt(new Date('2026-11-23T23:12:00Z'), context.timeZone)).toBe('2026-11-24');
  });
  it('honors the same Hanafi school parameter on every consumer', () => expect(new URL(prayerDayUrl({ ...context, school: 1 }, '2026-11-24')).searchParams.get('school')).toBe('1'));
  it('handles Egypt DST without adding a second hour', () => {
    expect(new Date(zonedInstant('2026-11-24', '04:55', context.timeZone)).toISOString()).toBe('2026-11-24T02:55:00.000Z');
    expect(new Date(zonedInstant('2026-07-24', '04:55', context.timeZone)).toISOString()).toBe('2026-07-24T01:55:00.000Z');
  });
  it('uses tomorrow actual Fajr after Isha, including month rollover', () => {
    const timings = { Fajr: '04:55', Sunrise: '06:27', Dhuhr: '11:40', Asr: '14:34', Maghrib: '16:53', Isha: '18:15' };
    const today = normalizePrayerDay(context, '2026-11-24', { timings });
    const tomorrow = normalizePrayerDay(context, '2026-11-25', { timings: { ...timings, Fajr: '04:56' } });
    expect(upcomingPrayer([today, tomorrow], Date.parse('2026-11-24T21:00:00Z'))?.time).toBe('04:56');
    expect(nextDate('2026-11-30')).toBe('2026-12-01');
  });
  it('validates suffixes and rejects invalid clock values', () => {
    expect(prayerClock('04:55 (EET)')).toBe('04:55');
    expect(() => prayerClock('04:99')).toThrow();
  });
});