import { useEffect, useState, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export type MemoStatus = "new" | "learning" | "memorized" | "review";

export interface AyahMemoRecord {
  id: string; // `${surah}_${ayah}`
  surah: number;
  ayah: number;
  status: MemoStatus;
  reviewCount: number;
  /** SM-2-lite ease factor */
  ease: number;
  /** ISO date for next review */
  nextReview: number; // epoch ms
  lastReviewed: number;
  updatedAt?: any;
}

const COLLECTION = "memorization";
const SUB = "ayahs";

const docId = (s: number, a: number) => `${s}_${a}`;

const computeNext = (rec: Partial<AyahMemoRecord>, grade: "again" | "hard" | "good" | "easy") => {
  let ease = rec.ease ?? 2.5;
  let interval = 1; // days
  const count = (rec.reviewCount ?? 0) + 1;
  switch (grade) {
    case "again":
      ease = Math.max(1.3, ease - 0.2);
      interval = 0; // review today
      break;
    case "hard":
      ease = Math.max(1.3, ease - 0.15);
      interval = Math.max(1, Math.round(((rec.reviewCount ?? 0) || 1) * 1.2));
      break;
    case "good":
      interval = Math.max(2, Math.round(((rec.reviewCount ?? 0) || 1) * ease));
      break;
    case "easy":
      ease = ease + 0.15;
      interval = Math.max(4, Math.round(((rec.reviewCount ?? 0) || 1) * ease * 1.3));
      break;
  }
  const next = Date.now() + interval * 24 * 60 * 60 * 1000;
  const status: MemoStatus =
    grade === "again" ? "review" : grade === "easy" || (count >= 3 && grade === "good") ? "memorized" : "learning";
  return { ease, interval, nextReview: next, status, reviewCount: count };
};

export const useMemorization = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record<string, AyahMemoRecord>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRecords({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const db = getFirestoreDb();
    const ref = collection(db, COLLECTION, user.uid, SUB);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const map: Record<string, AyahMemoRecord> = {};
        snap.forEach((d) => {
          map[d.id] = { id: d.id, ...(d.data() as any) };
        });
        setRecords(map);
        setLoading(false);
      },
      (err) => {
        console.error("memorization sync", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user?.uid]);

  const grade = useCallback(
    async (surah: number, ayah: number, g: "again" | "hard" | "good" | "easy") => {
      if (!user) return;
      const id = docId(surah, ayah);
      const prev = records[id];
      const updates = computeNext(prev || {}, g);
      const rec: AyahMemoRecord = {
        id,
        surah,
        ayah,
        status: updates.status,
        ease: updates.ease,
        reviewCount: updates.reviewCount,
        nextReview: updates.nextReview,
        lastReviewed: Date.now(),
      };
      const db = getFirestoreDb();
      await setDoc(
        doc(db, COLLECTION, user.uid, SUB, id),
        { ...rec, updatedAt: serverTimestamp() },
        { merge: true }
      );
    },
    [user, records]
  );

  const reset = useCallback(
    async (surah: number, ayah: number) => {
      if (!user) return;
      const id = docId(surah, ayah);
      const db = getFirestoreDb();
      await setDoc(
        doc(db, COLLECTION, user.uid, SUB, id),
        {
          id, surah, ayah, status: "new" as MemoStatus,
          ease: 2.5, reviewCount: 0, nextReview: Date.now(), lastReviewed: 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [user]
  );

  const dueToday = Object.values(records).filter(
    (r) => r.status !== "memorized" || r.nextReview <= Date.now()
  );

  const memorizedCount = Object.values(records).filter((r) => r.status === "memorized").length;

  const getStatus = (surah: number, ayah: number): MemoStatus =>
    records[docId(surah, ayah)]?.status ?? "new";

  return { records, loading, grade, reset, dueToday, memorizedCount, getStatus };
};
