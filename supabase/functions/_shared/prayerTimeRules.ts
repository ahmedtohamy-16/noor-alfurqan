export const PRAYER_NAMES = { Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' } as const;
export type PrayerKey = keyof typeof PRAYER_NAMES;
export interface PrayerContext { latitude: number; longitude: number; timeZone: string; method: number; school: number; }
export interface PrayerDay { date: string; timeZone: string; timings: Record<PrayerKey, string>; events: { key: PrayerKey; name: string; time: string; instant: number }[]; hijri?: { weekday: { ar: string }; day: string; month: { ar: string }; year: string }; }
export function localDateAt(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const value = (type: string) => parts.find(p => p.type === type)?.value || '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function nextDate(date: string): string {
  const next = new Date(`${date}T12:00:00Z`); next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}
export function prayerClock(value: string): string {
  const match = String(value).match(/^(?:\d{4}-\d{2}-\d{2}T)?(\d{2}):(\d{2})/);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) throw new Error('Invalid prayer time');
  return `${match[1]}:${match[2]}`;
}
export function zonedInstant(date: string, time: string, zone: string): number {
  const [y, month, d] = date.split('-').map(Number);
  const [hour, minute] = prayerClock(time).split(':').map(Number);
  const target = Date.UTC(y, month - 1, d, hour, minute);
  let instant = target;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  for (let i = 0; i < 3; i++) {
    const parts = fmt.formatToParts(new Date(instant));
    const n = (key: string) => Number(parts.find(p => p.type === key)?.value);
    const local = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'));
    instant += target - local;
  }
  return instant;
}
export function normalizePrayerDay(context: PrayerContext, date: string, data: { timings: Record<string, string>; meta?: { timezone?: string }; date?: { hijri?: PrayerDay['hijri'] } }): PrayerDay {
  const timeZone = data.meta?.timezone || context.timeZone;
  const timings = {} as Record<PrayerKey, string>;
  const events: PrayerDay['events'] = [];
  for (const key of Object.keys(PRAYER_NAMES) as PrayerKey[]) {
    const raw = data.timings[key];
    timings[key] = prayerClock(raw);
    const instant = /^\d{4}-\d{2}-\d{2}T/.test(raw) ? Date.parse(raw) : zonedInstant(date, raw, timeZone);
    if (!Number.isFinite(instant)) throw new Error('Invalid prayer instant');
    if (key !== 'Sunrise') events.push({ key, name: PRAYER_NAMES[key], time: timings[key], instant });
  }
  return { date, timeZone, timings, events, hijri: data.date?.hijri };
}
export const upcomingPrayer = (days: PrayerDay[], now: number) => days.flatMap(d => d.events).filter(e => e.instant > now).sort((a, b) => a.instant - b.instant)[0] || null;
export function prayerDayUrl(context: PrayerContext, date: string): string {
  const [y, m, d] = date.split('-');
  const q = new URLSearchParams({ latitude: String(context.latitude), longitude: String(context.longitude), method: String(context.method), school: String(context.school), timezonestring: context.timeZone, iso8601: 'true' });
  return `https://api.aladhan.com/v1/timings/${d}-${m}-${y}?${q}`;
}