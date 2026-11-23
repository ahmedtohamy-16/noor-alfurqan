import { useSyncExternalStore } from 'react';
import { getAyahAudioUrl, getReciterById, globalToSurahAyah, type Reciter } from '@/data/reciters';
import { rangeGlobalAyahs, fitsStorageLimit, REGULAR_AUDIO_LIMIT } from './audioRangeRules';

export type DownloadStatus = 'queued' | 'downloading' | 'completed' | 'error';

export interface AyahDownload {
  id: string; // `${reciterId}:${globalAyah}`
  reciterId: string;
  reciterName: string;
  surah: number;
  surahName: string;
  ayah: number;
  globalAyah: number;
  endAyah?: number;
  phase?: 'fetching' | 'merging';
  status: DownloadStatus;
  progress: number; // 0..100
  size?: number; // bytes
  error?: string;
  createdAt: number;
}

const META_KEY = 'ayahDownloads.v1';
// Never restore an elevated limit from editable browser storage.
let storageLimit = REGULAR_AUDIO_LIMIT;
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
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(req.result as T);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
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
export const getStorageLimit = () => storageLimit;
export const useDownloadStorageLimit = () => useSyncExternalStore(subscribeDownloads, getStorageLimit, getStorageLimit);
export const getUsedStorage = () => items.reduce((n, d) => n + (d.status === 'completed' ? d.size || 0 : 0), 0);
export const setDownloadStorageLimit = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) throw new Error('اختر حدًا صحيحًا للتخزين');
  // Downgrades retain saved files but prevent further downloads until space is freed.
  storageLimit = bytes;
  listeners.forEach((l) => l());
};

// ---------- download queue (2 at a time) ----------
const controllers = new Map<string, AbortController>();
const MAX_PARALLEL = 2;
const reservations = new Map<string, number>();
const reserve = (id: string, bytes: number) => {
  const others = Array.from(reservations).reduce((n, [key, size]) => n + (key === id ? 0 : size), 0);
  if (!fitsStorageLimit(getUsedStorage() + others, bytes, storageLimit)) {
    throw new Error('بلغت حد التخزين؛ احذف بعض الملفات ثم أعد المحاولة');
  }
  reservations.set(id, bytes);
};

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
  let encoder: Awaited<ReturnType<typeof import('./mergeAyahAudio')['createRangeEncoder']>> | undefined;
  controllers.set(id, ctrl);
  patch(id, { status: 'downloading', progress: 0, error: undefined, phase: 'fetching' });
  try {
    const globals = d.endAyah ? rangeGlobalAyahs(d.surah, d.ayah, d.endAyah) : [d.globalAyah];
    if (globals.length > 1) {
      const { createRangeEncoder } = await import('./mergeAyahAudio');
      if (ctrl.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      encoder = createRangeEncoder(ctrl.signal);
    }
    let receivedTotal = 0;
    let blob: Blob | undefined;
    for (let index = 0; index < globals.length; index++) {
    patch(id, { phase: 'fetching' });
    const res = await fetch(getAyahAudioUrl(reciter, globals[index]), { signal: ctrl.signal });
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
        reserve(id, receivedTotal + received);
        if (total) patch(id, { progress: Math.min(95, ((index + received / total) / globals.length) * 95) });
      }
    } else {
      const part = await res.blob();
      chunks.push(part);
      received = part.size;
      reserve(id, receivedTotal + received);
    }
    receivedTotal += received;
    const part = new Blob(chunks, { type: 'audio/mpeg' });
    if (!part.size) throw new Error('ملف الصوت فارغ');
    if (encoder) {
      patch(id, { phase: 'merging' });
      await encoder.append(part);
    } else blob = part;
    patch(id, { progress: ((index + 1) / globals.length) * 95 });
    }
    if (encoder) blob = await encoder.finish();
    if (!blob || ctrl.signal.aborted || !items.some((x) => x.id === id)) return;
    reserve(id, blob.size);
    await idb('readwrite', (s) => s.put(blob, id));
    if (ctrl.signal.aborted || !items.some((x) => x.id === id)) {
      await idb('readwrite', (s) => s.delete(id));
      return;
    }
    patch(id, { status: 'completed', progress: 100, size: blob.size, phase: undefined });
    reservations.delete(id);
  } catch (e) {
    if (!items.some((x) => x.id === id)) return; // deleted while downloading
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    patch(id, {
      status: 'error',
      progress: 0,
      phase: undefined,
      error: offline ? 'لا يوجد اتصال بالإنترنت'
        : e instanceof Error && e.message.startsWith('بلغت حد') ? e.message
        : e instanceof DOMException && e.name === 'QuotaExceededError' ? 'مساحة الجهاز غير كافية؛ احذف ملفات ثم أعد المحاولة'
        : 'تعذّر تنزيل الصوت؛ أعد المحاولة',
    });
    console.error('Ayah download failed', e);
  } finally {
    encoder?.close();
    reservations.delete(id);
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

export const startRangeDownload = (reciter: Reciter, surah: number, start: number, end: number, surahName: string): string => {
  const globals = rangeGlobalAyahs(surah, start, end);
  if (start === end) return startAyahDownload(reciter, globals[0], surahName);
  const id = `${reciter.id}:${globals[0]}-${globals[globals.length - 1]}`;
  const existing = items.find((d) => d.id === id);
  if (existing) { if (existing.status === 'error') retryDownload(id); return id; }
  commit([{ id, reciterId: reciter.id, reciterName: reciter.nameArabic, surah, surahName, ayah: start,
    endAyah: end, globalAyah: globals[0], status: 'queued', progress: 0, createdAt: Date.now() }, ...items]);
  pump();
  return id;
};

export const retryDownload = (id: string) => {
  if (items.find((d) => d.id === id)?.status !== 'error') return;
  patch(id, { status: 'queued', progress: 0, error: undefined });
  pump();
};

export const deleteDownloads = async (ids: string[]) => {
  const deleting = new Set(ids);
  ids.forEach((id) => controllers.get(id)?.abort());
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    ids.forEach((id) => tx.objectStore(STORE).delete(id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  commit(items.filter((d) => !deleting.has(d.id)));
  ids.forEach((id) => reservations.delete(id));
  pump();
};
export const deleteDownload = (id: string) => deleteDownloads([id]);

export const downloadFileName = (d: AyahDownload) => `${d.surahName}_${d.endAyah ? `آيات_${d.ayah}-${d.endAyah}` : `آية_${d.ayah}`}_${d.reciterName}.mp3`;
