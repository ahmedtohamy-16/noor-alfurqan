import { useSyncExternalStore } from 'react';
import { getAyahAudioUrl, getReciterById, globalToSurahAyah, type Reciter } from '@/data/reciters';

export type DownloadStatus = 'queued' | 'downloading' | 'completed' | 'error';

export interface AyahDownload {
  id: string; // `${reciterId}:${globalAyah}`
  reciterId: string;
  reciterName: string;
  surah: number;
  surahName: string;
  ayah: number;
  globalAyah: number;
  status: DownloadStatus;
  progress: number; // 0..100
  size?: number; // bytes
  error?: string;
  createdAt: number;
}

const META_KEY = 'ayahDownloads.v1';
const DB_NAME = 'noor-audio';
const STORE = 'files';

// ---------- IndexedDB (audio files) ----------
let dbPromise: Promise<IDBDatabase> | null = null;
const openDb = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};
const idb = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest): Promise<T> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result as T);
    req.onerror = () => reject(req.error);
  });
};
export const getDownloadBlob = (id: string) => idb<Blob | undefined>('readonly', (s) => s.get(id));

// ---------- metadata store ----------
const load = (): AyahDownload[] => {
  try {
    const list: AyahDownload[] = JSON.parse(localStorage.getItem(META_KEY) || '[]');
    // Downloads cut off by closing the page can't resume: mark them for retry.
    return list.map((d) =>
      d.status === 'downloading' || d.status === 'queued'
        ? { ...d, status: 'error', progress: 0, error: 'توقف التنزيل قبل اكتماله' }
        : d,
    );
  } catch {
    return [];
  }
};

let items: AyahDownload[] = typeof window === 'undefined' ? [] : load();
const listeners = new Set<() => void>();
const commit = (next: AyahDownload[]) => {
  items = next;
  try { localStorage.setItem(META_KEY, JSON.stringify(items)); } catch { /* quota */ }
  listeners.forEach((l) => l());
};
const patch = (id: string, p: Partial<AyahDownload>) =>
  commit(items.map((d) => (d.id === id ? { ...d, ...p } : d)));

export const subscribeDownloads = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
export const getDownloads = () => items;
export const useAyahDownloads = () => useSyncExternalStore(subscribeDownloads, getDownloads, getDownloads);

// ---------- download queue (2 at a time) ----------
const controllers = new Map<string, AbortController>();
const MAX_PARALLEL = 2;

const pump = () => {
  const running = items.filter((d) => d.status === 'downloading').length;
  const waiting = items.filter((d) => d.status === 'queued').sort((a, b) => a.createdAt - b.createdAt);
  waiting.slice(0, Math.max(0, MAX_PARALLEL - running)).forEach((d) => void run(d.id));
};

const run = async (id: string) => {
  const d = items.find((x) => x.id === id);
  const reciter = d && getReciterById(d.reciterId);
  if (!d || !reciter) return;
  const ctrl = new AbortController();
  controllers.set(id, ctrl);
  patch(id, { status: 'downloading', progress: 0, error: undefined });
  try {
    const res = await fetch(getAyahAudioUrl(reciter, d.globalAyah), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const total = Number(res.headers.get('content-length')) || 0;
    const reader = res.body?.getReader();
    const chunks: BlobPart[] = [];
    let received = 0;
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) patch(id, { progress: Math.min(99, (received / total) * 100) });
      }
    } else {
      chunks.push(await res.blob());
    }
    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    await idb('readwrite', (s) => s.put(blob, id));
    patch(id, { status: 'completed', progress: 100, size: blob.size });
  } catch (e) {
    if (!items.some((x) => x.id === id)) return; // deleted while downloading
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    patch(id, {
      status: 'error',
      progress: 0,
      error: offline ? 'لا يوجد اتصال بالإنترنت' : 'تعذّر تنزيل الآية',
    });
    console.error('Ayah download failed', e);
  } finally {
    controllers.delete(id);
    pump();
  }
};

/** Queue an ayah download. Returns its id; already-saved ayahs are not re-downloaded. */
export const startAyahDownload = (reciter: Reciter, globalAyah: number, surahName: string): string => {
  const id = `${reciter.id}:${globalAyah}`;
  const existing = items.find((d) => d.id === id);
  if (existing) {
    if (existing.status === 'error') retryDownload(id);
    return id;
  }
  const { surah, ayah } = globalToSurahAyah(globalAyah);
  commit([
    {
      id, reciterId: reciter.id, reciterName: reciter.nameArabic, surah, surahName, ayah, globalAyah,
      status: 'queued', progress: 0, createdAt: Date.now(),
    },
    ...items,
  ]);
  pump();
  return id;
};

export const retryDownload = (id: string) => {
  patch(id, { status: 'queued', progress: 0, error: undefined });
  pump();
};

export const deleteDownload = async (id: string) => {
  controllers.get(id)?.abort();
  commit(items.filter((d) => d.id !== id));
  try { await idb('readwrite', (s) => s.delete(id)); } catch { /* ignore */ }
  pump();
};

export const downloadFileName = (d: AyahDownload) => `${d.surahName}_آية_${d.ayah}_${d.reciterName}.mp3`;
