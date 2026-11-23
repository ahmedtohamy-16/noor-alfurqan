import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  beforeEach(() => { vi.resetModules(); localStorage.clear(); });

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
});
