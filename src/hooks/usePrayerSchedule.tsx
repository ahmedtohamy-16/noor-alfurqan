import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import tzLookup from 'tz-lookup';
import { useUserSettings } from './useUserSettings';
import { hasLocationCoordinates } from '@/lib/cityNames';
import { recommendedPrayerMethod } from '@/lib/prayerMethods';
import { rememberFajrTime } from '@/lib/displayFormat';
import { localDateAt, nextDate, normalizePrayerDay, upcomingPrayer, prayerDayUrl, type PrayerContext, type PrayerDay } from '../../supabase/functions/_shared/prayerTimeRules';

const pending = new Map<string, Promise<PrayerDay>>();
export async function fetchPrayerDay(context: PrayerContext, date: string): Promise<PrayerDay> {
  const url = prayerDayUrl(context, date);
  const key = `noor:prayer-day:v2:${url}`;
  try { const saved = JSON.parse(localStorage.getItem(key) || 'null'); if (saved && saved.savedAt > Date.now() - 86400000) return saved.day; } catch { /* cache repair */ }
  const existing = pending.get(url); if (existing) return existing;
  const request = (async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('تعذّر تحديث المواقيت');
    const body = await response.json();
    if (body.code !== 200 || !body.data?.timings) throw new Error('المواقيت غير متاحة');
    const day = normalizePrayerDay(context, date, body.data);
    try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), day })); } catch { /* no quota */ }
    return day;
  })();
  pending.set(url, request);
  try { return await request; } finally { pending.delete(url); }
}
export function usePrayerSchedule() {
  const { settings } = useUserSettings();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const update = () => setNow(Date.now()); const timer = setInterval(update, 1000); window.addEventListener('focus', update); return () => { clearInterval(timer); window.removeEventListener('focus', update); }; }, []);
  const hasLocation = hasLocationCoordinates(settings.latitude, settings.longitude);
  const lat = settings.latitude ?? 0, lng = settings.longitude ?? 0;
  const timeZone = hasLocation ? tzLookup(lat, lng) : settings.timezone || 'UTC';
  const date = localDateAt(new Date(now), timeZone);
  const context: PrayerContext = { latitude: lat, longitude: lng, timeZone, method: settings.prayer_method || recommendedPrayerMethod(settings.country_code), school: settings.prayer_madhab };
  const query = useQuery({ queryKey: ['prayerSchedule', lat, lng, context.method, context.school, timeZone, date], queryFn: () => Promise.all([fetchPrayerDay(context, date), fetchPrayerDay(context, nextDate(date))]), enabled: hasLocation, staleTime: 3600000, gcTime: 86400000, retry: 1 });
  const day = query.data?.[0];
  useEffect(() => { if (day) rememberFajrTime(day.timings.Fajr); }, [day?.timings.Fajr]);
  const nextPrayer = upcomingPrayer(query.data || [], now);
  const remaining = Math.max(0, (nextPrayer?.instant || now) - now);
  return { ...query, prayerTimes: day?.timings, days: query.data || [], hijri: day?.hijri, nextPrayer, hasLocation, context, date, countdown: { hours: Math.floor(remaining / 3600000), minutes: Math.floor(remaining % 3600000 / 60000), seconds: Math.floor(remaining % 60000 / 1000) } };
}