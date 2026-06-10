import { useEffect, useState } from "react";
import { useHadith } from "./useHadith";
import { hadithBooks, type Hadith } from "@/data/hadithBooks";

const STORAGE_KEY = "hadith_of_the_day_v1";

// Deterministic hadith of the day based on the calendar date (YYYY-MM-DD).
export const useHadithOfTheDay = () => {
  const { fetchHadiths } = useHadith();
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);

    // Try cache first
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.date === todayKey && parsed?.hadith) {
          setHadith(parsed.hadith);
          setLoading(false);
          return;
        }
      }
    } catch {}

    let cancelled = false;
    (async () => {
      try {
        // Deterministic pick using date seed
        const seed = todayKey.split("-").reduce((a, b) => a + parseInt(b, 10), 0);
        const book = hadithBooks[seed % hadithBooks.length];
        const totalSafe = Math.max(1, Math.min(book.totalHadiths, 5000));
        const targetIndex = seed % totalSafe;
        const page = Math.floor(targetIndex / 20) + 1;
        const data = await fetchHadiths(book.id, page, 20);
        const list = data?.hadiths || [];
        const picked = list[targetIndex % Math.max(list.length, 1)] || list[0]