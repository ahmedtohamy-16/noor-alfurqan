import type { QuranAyah } from '@/data/quranAyats';
import { surahs } from '@/data/surahs';
import { textSelectionId, validateTextSelection } from './offlineQuranRules';
export const QURAN_SELECTION_CACHE = 'noor-quran-selections-v1';
const EVENT = 'noor:offline-text-changed';
export interface QuranTextDownload { id: string; surah: number; surahName: string; from: number; to: number; size: number; savedAt: number; ayahs: QuranAyah[]; }
const path = (id: string) => new URL(`/__noor/offline-text/${encodeURIComponent(id)}`, window.location.origin).href;
let writing: Promise<unknown> = Promise.resolve();
export async function listQuranTextDownloads(): Promise<QuranTextDownload[]> {
  if (!('caches' in window)) return [];
  const cache = await caches.open(QURAN_SELECTION_CACHE);
  const keys = await cache.keys();
  const results = await Promise.all(keys.map(async key => {
    const response = await cache.match(key);
    if (!response) return null;
    try { return await response.json() as QuranTextDownload; } catch { return null; }
  }));
  return results.filter((r): r is QuranTextDownload => !!r).sort((a, b) => b.savedAt - a.savedAt);
}
export async function readOfflineQuran(): Promise<QuranAyah[]> {
  const saved = await listQuranTextDownloads();
  return [...new Map(saved.flatMap(record => record.ayahs).map(ayah => [ayah.id, ayah])).values()].sort((a, b) => a.id - b.id);
}
export function downloadQuranText(surah: number, from: number, to: number): Promise<QuranTextDownload> {
  const job = writing.catch(() => {}).then(async () => {
    if (!validateTextSelection(surah, from, to)) throw new Error('اختر آيات صحيحة من السورة نفسها');
    if (!('caches' in window)) throw new Error('التخزين دون اتصال غير مدعوم في هذا المتصفح');
    const response = await fetch('/data/quranAyats.json');
    if (!response.ok) throw new Error('تعذّر تحميل النص؛ حاول عند الاتصال بالإنترنت');
    const all: QuranAyah[] = await response.json();
    const ayahs = all.filter(a => a.sura_id === surah && a.ayat_number_in_sura >= from && a.ayat_number_in_sura <= to);
    if (ayahs.length !== to - from + 1) throw new Error('نص الآيات غير مكتمل؛ لم يُحفظ');
    const size = new Blob([JSON.stringify(ayahs)]).size;
    const quota = await navigator.storage?.estimate();
    if (quota?.quota && quota.usage && quota.usage + size > quota.quota * 0.95) throw new Error('المساحة غير كافية؛ احذف تنزيلات أخرى');
    const record: QuranTextDownload = { id: textSelectionId(surah, from, to), surah, surahName: surahs.find(s => s.number === surah)?.name || '', from, to, size, savedAt: Date.now(), ayahs };
    const cache = await caches.open(QURAN_SELECTION_CACHE);
    await cache.put(path(record.id), new Response(JSON.stringify(record), { headers: { 'Content-Type': 'application/json' } }));
    window.dispatchEvent(new Event(EVENT));
    return record;
  });
  writing = job;
  return job;
}
export async function deleteQuranText(id: string) {
  const cache = await caches.open(QURAN_SELECTION_CACHE);
  await cache.delete(path(id));
  window.dispatchEvent(new Event(EVENT));
}
export const subscribeOfflineText = (fn: () => void) => { window.addEventListener(EVENT, fn); return () => window.removeEventListener(EVENT, fn); };