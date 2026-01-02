import { useState, useEffect, useCallback } from 'react';
import { Hadith, hadithBooks } from '@/data/hadithBooks';
import { supabase } from '@/integrations/supabase/client';

const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL || 'https://xjbykaphnxiyocmkurpo.supabase.co';
};

export const useHadith = () => {
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFallbackHadith = (): Hadith => ({
    id: 1,
    hadith_id: 1,
    book: 'bukhari',
    hadith_arabic: 'عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ يَقُولُ: «إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»',
    hadith_english: "Umar ibn Al-Khattab (may Allah be pleased with him) narrated: I heard the Messenger of Allah (peace be upon him) say: Actions are but by intentions, and every person will have only what they intended.",
    narrator_arabic: 'عمر بن الخطاب رضي الله عنه'
  });

  // Fetch via edge function (to bypass CORS)
  const fetchFromApi = async (path: string): Promise<any> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(
        `${getSupabaseUrl()}/functions/v1/hadith-api?path=${encodeURIComponent(path)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('فشل في جلب البيانات');
      }

      return await response.json();
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  };

  // Get a random hadith for daily display
  const fetchDailyHadith = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const today = new Date();
      const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
      
      const bookIndex = dayOfYear % hadithBooks.length;
      const book = hadithBooks[bookIndex];
      const hadithNumber = (dayOfYear % 100) + 1;
      
      const data = await fetchFromApi(`${book.id}/${hadithNumber}`);
      setDailyHadith(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
      setDailyHadith(getFallbackHadith());
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
      
      const data = await fetchFromApi(`${bookId}?start=${startId}&end=${endId}`);
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
      const data = await fetchFromApi(`${bookId}/${hadithId}`);
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
      let path = `search?q=${encodeURIComponent(query)}`;
      if (bookId) {
        path += `&collection=${bookId}`;
      }
      
      const data = await fetchFromApi(path);
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
