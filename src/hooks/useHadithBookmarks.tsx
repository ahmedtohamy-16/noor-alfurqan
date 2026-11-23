import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { firestoreGet, firestoreSet, COLLECTIONS } from "@/lib/firebase";
import { toast } from "sonner";
import { safeHadithSnapshot, refreshHadithSnapshots, preserveSavedHadiths } from "@/lib/hadithContent";

export interface HadithBookmark {
  bookId: string;
  hadithNumber: number;
  text: string;
  narrator?: string;
  grade?: string;
  contentVersion?: number;
  savedAt: string; // ISO
}

const LS_KEY = "hadith_bookmarks_v1";

const bookmarkKey = (b: { bookId: string; hadithNumber: number }) =>
  `${b.bookId}::${b.hadithNumber}`;

const readLocal = (): HadithBookmark[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (items: HadithBookmark[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
};

export const useHadithBookmarks = () => {
  const { user } = useAuth();
  const storedRecords = useRef<HadithBookmark[]>(readLocal());
  const [bookmarks, setBookmarks] = useState<HadithBookmark[]>(() => readLocal().map(safeHadithSnapshot));
  const [loading, setLoading] = useState(false);

  // Sync from Firestore on login + merge with local
  useEffect(() => {
    if (!user) {
      let cancelled = false;
      const records = readLocal();
      storedRecords.current = records;
      refreshHadithSnapshots(records).then(items => { if (!cancelled) setBookmarks(items); });
      return () => { cancelled = true; };
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const remote = await firestoreGet<{ items?: HadithBookmark[] }>(
          COLLECTIONS.HADITH_BOOKMARKS,
          user.uid
        );
        const local = readLocal();
        const remoteItems = remote?.items || [];
        // Merge by key, prefer most recent savedAt
        const map = new Map<string, HadithBookmark>();
        [...remoteItems, ...local].forEach((b) => {
          const k = bookmarkKey(b);
          const existing = map.get(k);
          if (!existing || (b.savedAt > existing.savedAt)) {
            map.set(k, b);
          }
        });
        const records = Array.from(map.values()).sort(
          (a, b) => (a.savedAt < b.savedAt ? 1 : -1)
        );
        const merged = await refreshHadithSnapshots(records);
        if (cancelled) return;
        setBookmarks(merged);
        storedRecords.current = records;
        writeLocal(records);
        // Push merged back if local had extras
        if (local.length > remoteItems.length) {
          await firestoreSet(COLLECTIONS.HADITH_BOOKMARKS, user.uid, { items: records });
        }
      } catch (e) {
        console.error("Bookmark sync failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  const persist = useCallback(
    async (next: HadithBookmark[]) => {
      setBookmarks(next);
      const records = preserveSavedHadiths(next, storedRecords.current);
      storedRecords.current = records;
      writeLocal(records);
      if (user) {
        try {
          await firestoreSet(COLLECTIONS.HADITH_BOOKMARKS, user.uid, { items: records });
        } catch (e) {
          console.error("Bookmark save failed", e);
        }
      }
    },
    [user?.uid]
  );

  const isBookmarked = useCallback(
    (b: { bookId: string; hadithNumber: number }) =>
      bookmarks.some((x) => x.bookId === b.bookId && x.hadithNumber === b.hadithNumber),
    [bookmarks]
  );

  const toggle = useCallback(
    async (b: Omit<HadithBookmark, "savedAt">) => {
      const exists = bookmarks.some(
        (x) => x.bookId === b.bookId && x.hadithNumber === b.hadithNumber
      );
      if (exists) {
        const next = bookmarks.filter(
          (x) => !(x.bookId === b.bookId && x.hadithNumber === b.hadithNumber)
        );
        await persist(next);
        toast.success("تم إزالة الحديث من المحفوظات");
        return false;
      } else {
        const [verified] = await refreshHadithSnapshots([b]);
        if (!verified?.text) { toast.error("تعذر التحقق من نص الحديث، حاول مرة أخرى عند الاتصال"); return false; }
        const next = [{ ...verified, savedAt: new Date().toISOString() }, ...bookmarks];
        await persist(next);
        toast.success("تم حفظ الحديث");
        return true;
      }
    },
    [bookmarks, persist]
  );

  const remove = useCallback(
    async (b: { bookId: string; hadithNumber: number }) => {
      const next = bookmarks.filter(
        (x) => !(x.bookId === b.bookId && x.hadithNumber === b.hadithNumber)
      );
      await persist(next);
    },
    [bookmarks, persist]
  );

  return { bookmarks, isBookmarked, toggle, remove, loading };
};
