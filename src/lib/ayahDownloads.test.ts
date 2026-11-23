import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';

const mem = new Map<string, string>();
Object.assign(globalThis, {
  window: globalThis,
  localStorage: {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    clear: () => mem.clear(),
  },
});

describe('ayah downloads', () => {
  beforeEach(() => { vi.resetModules(); localStorage.clear(); Object.assign(globalThis, { indexedDB: new IDBFactory() }); vi.restoreAllMocks(); });

  it('marks downloads interrupted by closing the page as failed so they can be retried', async () => {
    localStorage.setItem('ayahDownloads.v1', JSON.stringify([
      { id: 'ar.husary:1', reciterId: 'ar.husary', reciterName: 'x', surah: 1, surahName: 'الفاتحة', ayah: 1, globalAyah: 1, status: 'downloading', progress: 40, createdAt: 1 },
      { id: 'ar.husary:2', reciterId: 'ar.husary', reciterName: 'x', surah: 1, surahName: 'الفاتحة', ayah: 2, globalAyah: 2, status: 'completed', progress: 100, createdAt: 2 },
    ]));
    const m = await import('./ayahDownloads');
    const [a, b] = m.getDownloads();
    expect(a.status).toBe('error');
    expect(b.status).toBe('completed');
  });

  it('bulk deletion removes only selected metadata and actual stored blobs', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(new Uint8Array(7)));
    const m = await import('./ayahDownloads');
    const { reciters } = await import('@/data/reciters');
    const ids = [1, 2, 3].map((n) => m.startAyahDownload(reciters[0], n, 'الفاتحة'));
    await vi.waitFor(() => expect(m.getDownloads().filter((d) => d.status === 'completed')).toHaveLength(3));
    expect(m.getUsedStorage()).toBe(21);
    await m.deleteDownloads([ids[0], ids[1]]);
    expect(m.getDownloads().map((d) => d.id)).toEqual([ids[2]]);
    expect(await m.getDownloadBlob(ids[0])).toBeUndefined();
    expect(await m.getDownloadBlob(ids[1])).toBeUndefined();
    expect((await m.getDownloadBlob(ids[2]))?.size).toBe(7);
    expect(m.getUsedStorage()).toBe(7);
  });

  it('blocks a regular download above 10 MiB without storing a partial file', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(new Uint8Array(10 * 1024 * 1024 + 1)));
    const m = await import('./ayahDownloads');
    const { reciters } = await import('@/data/reciters');
    const id = m.startAyahDownload(reciters[0], 1, 'الفاتحة');
    await vi.waitFor(() => expect(m.getDownloads()[0].status).toBe('error'));
    expect(m.getStorageLimit()).toBe(10 * 1024 * 1024);
    expect(await m.getDownloadBlob(id)).toBeUndefined();
    expect(m.getUsedStorage()).toBe(0);
  });

  it('allows an 11 MiB download with the 100 MiB Pro limit', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(new Uint8Array(11 * 1024 * 1024)));
    const m = await import('./ayahDownloads');
    const { reciters } = await import('@/data/reciters');
    m.setDownloadStorageLimit(100 * 1024 * 1024);
    const id = m.startAyahDownload(reciters[0], 1, 'الفاتحة');
    await vi.waitFor(() => expect(m.getDownloads()[0].status).toBe('completed'));
    expect(m.getStorageLimit()).toBe(100 * 1024 * 1024);
    expect((await m.getDownloadBlob(id))?.size).toBe(11 * 1024 * 1024);
  });

  it('does not let two concurrent downloads exceed the regular 10 MiB limit', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(new Uint8Array(6 * 1024 * 1024)));
    const m = await import('./ayahDownloads');
    const { reciters } = await import('@/data/reciters');
    m.startAyahDownload(reciters[0], 1, 'الفاتحة');
    m.startAyahDownload(reciters[0], 2, 'الفاتحة');
    await vi.waitFor(() => expect(m.getDownloads().every((d) => d.status === 'completed' || d.status === 'error')).toBe(true));
    expect(m.getDownloads().filter((d) => d.status === 'completed')).toHaveLength(1);
    expect(m.getDownloads().filter((d) => d.status === 'error')).toHaveLength(1);
    expect(m.getUsedStorage()).toBe(6 * 1024 * 1024);
  });

  it('retries a failed download and saves the file successfully', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(new Response(new Uint8Array(7)));
    const m = await import('./ayahDownloads');
    const { reciters } = await import('@/data/reciters');
    const id = m.startAyahDownload(reciters[0], 1, 'الفاتحة');
    await vi.waitFor(() => expect(m.getDownloads()[0].status).toBe('error'));
    m.retryDownload(id);
    await vi.waitFor(() => expect(m.getDownloads()[0].status).toBe('completed'));
    expect((await m.getDownloadBlob(id))?.size).toBe(7);
  });
});
