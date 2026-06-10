import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { firestoreGet, firestoreSet, COLLECTIONS } from "@/lib/firebase";
import { toast } from "sonner";

export interface HadithBookmark {
  bookId: string;
  hadithNumber: number;
  text: string;
  narrator?: string;
  grade?: string;
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
  const [bookmarks, setBookmarks] = useState<HadithBookmark[]>(() => readLocal());
  const [loading, setLoading] = useState(false);

  // Sync from Firestore on login + merge with local
  useEffect(() => {
    if (!user) {
      setBookmarks(readLocal());
      return;
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
        const merged = Array.from(map.values()).sort(
          (a, b) => (a.savedAt < b.savedAt ? 1 : -1)
        );
        if (cancelled) return;
        setBookmarks(merged);
        writeLocal(merged);
        // Push merged back if local had extras
        if (local.length > remoteItems.length) {
          await firestoreSet(COLLECTIONS.HADITH_BOOKMARKS, user.uid, { items: merged });
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
      writeLocal(next);
      if (user) {
        try {
          await firestoreSet(COLLECTIONS.HADITH_BOOKMARKS, user.uid, { items: next });
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
        const next = [{ ...b, savedAt: new Date().toISOString() }, ...bookmarks];
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
