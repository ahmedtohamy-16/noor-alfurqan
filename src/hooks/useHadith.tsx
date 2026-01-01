import { useState, useEffect, useCallback } from 'react';
import { Hadith, hadithBooks } from '@/data/hadithBooks';

const HADITH_API_BASE = 'https://hadithapi.pages.dev/api';

export const useHadith = () => {
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get a random hadith for daily display
  const fetchDailyHadith = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use date to generate a consistent daily hadith
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      
      // Rotate through books and hadiths based on day
      const bookIndex = dayOfYear % hadithBooks.length;
      const book = hadithBooks[bookIndex];
      const hadithNumber = (dayOfYear % 100) + 1;
      
      const response = await fetch(`${HADITH_API_BASE}/${book.id}/${hadithNumber}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب الحديث');
      }
      
      const data = await response.json();
      setDailyHadith(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      // Fallback to a default hadith
      setDailyHadith({
        id: 1,
        hadith_id: 1,
        book: 'bukhari',
        hadith_arabic: 'عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»',
        hadith_english: "Umar ibn Al-Khattab (may Allah be pleased with him) narrated: I heard the Messenger of Allah (peace be upon him) say: Actions are but by intentions, and every person will have only what they intended. So whoever migration was for Allah and His Messenger, then their migration was for Allah and His Messenger. And whoever migration was for worldly gain or a woman to marry, then their migration was for what they migrated for.",
        narrator_arabic: 'عمر بن الخطاب رضي الله عنه'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch hadiths by book
  const fetchHadithsByBook = async (bookId: string, page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const startId = (page - 1) * limit + 1;
      const endId = page * limit;
      
      const response = await fetch(`${HADITH_API_BASE}/${bookId}?start=${startId}&end=${endId}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب الأحاديث');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific hadith
  const fetchHadith = async (bookId: string, hadithId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${HADITH_API_BASE}/${bookId}/${hadithId}`);
      
      if (!response.ok) {
        throw new Error('فشل في جلب الحديث');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Search hadiths
  const searchHadiths = async (query: string, bookId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${HADITH_API_BASE}/search?q=${encodeURIComponent(query)}`;
      if (bookId) {
        url += `&collection=${bookId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('فشل في البحث');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      return { results: [], pagination: { total: 0 } };
    } finally {
      setLoading(false);
    }
  };

  // Get random hadith
  const getRandomHadith = async (bookId?: string) => {
    const book = bookId || hadithBooks[Math.floor(Math.random() * hadithBooks.length)].id;
    const bookInfo = hadithBooks.find(b => b.id === book);
    const maxHadith = bookInfo?.totalHadiths || 100;
    const randomId = Math.floor(Math.random() * maxHadith) + 1;
    
    return fetchHadith(book, randomId);
  };

  useEffect(() => {
    fetchDailyHadith();
  }, [fetchDailyHadith]);

  return {
    dailyHadith,
    loading,
    error,
    fetchDailyHadith,
    fetchHadithsByBook,
    fetchHadith,
    searchHadiths,
    getRandomHadith
  };
};
