import { useState, useCallback, useEffect } from 'react';
import { Hadith, hadithBooks } from '@/data/hadithBooks';
import { toast } from 'sonner';

const DB_NAME = 'hadith-offline-db';
const DB_VERSION = 1;
const STORE_NAME = 'hadiths';

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'bookId' });
        store.createIndex('bookId', 'bookId', { unique: true });
      }
    };
  });
};

// Save hadiths to IndexedDB
const saveHadithsToDb = async (bookId: string, hadiths: Hadith[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data = {
      bookId,
      hadiths,
      downloadedAt: new Date().toISOString()
    };
    
    const request = store.put(data);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Get hadiths from IndexedDB
const getHadithsFromDb = async (bookId: string): Promise<Hadith[] | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(bookId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.hadiths : null);
      };
    });
  } catch {
    return null;
  }
};

// Get all downloaded books
const getDownloadedBooks = async (): Promise<string[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAllKeys();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  } catch {
    return [];
  }
};

// Delete book from IndexedDB
const deleteBookFromDb = async (bookId: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(bookId);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// API helper
const fetchFromApi = async (path: string): Promise<any> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xjbykaphnxiyocmkurpo.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqYnlrYXBobnhpeW9jbWt1cnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0MjUyNjksImV4cCI6MjA4MjAwMTI2OX0.9TyjG4lhIbvxnEBHg8aP3_QWtxVW4iOGReZ69I08hfo';
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/hadith-api?path=${encodeURIComponent(path)}`,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
};

export const useHadithOffline = () => {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedBooks, setDownloadedBooks] = useState<string[]>([]);

  // Check which books are downloaded
  const checkDownloadedBooks = useCallback(async () => {
    const books = await getDownloadedBooks();
    setDownloadedBooks(books);
  }, []);

  useEffect(() => {
    checkDownloadedBooks();
  }, [checkDownloadedBooks]);

  // Download all hadiths for a book
  const downloadBook = useCallback(async (bookId: string) => {
    const book = hadithBooks.find(b => b.id === bookId);
    if (!book) {
      toast.error('الكتاب غير موجود');
      return;
    }

    setDownloading(bookId);
    setDownloadProgress(0);

    try {
      const allHadiths: Hadith[] = [];
      const batchSize = 100;
      const totalBatches = Math.ceil(book.totalHadiths / batchSize);
      let successfulBatches = 0;

      for (let batch = 0; batch < totalBatches; batch++) {
        const start = batch * batchSize + 1;
        const end = Math.min((batch + 1) * batchSize, book.totalHadiths);
        
        try {
          const data = await fetchFromApi(`${bookId}?start=${start}&end=${end}`);
          
          if (Array.isArray(data)) {
            allHadiths.push(...data.map((h: any, idx: number) => ({
              ...h,
              id: h.id || start + idx,
              hadith_id: h.hadith_id || h.id || start + idx,
              book: bookId
            })));
            successfulBatches++;
          } else if (data?.hadiths && Array.isArray(data.hadiths)) {
            allHadiths.push(...data.hadiths.map((h: any, idx: number) => ({
              ...h,
              id: h.id || start + idx,
              hadith_id: h.hadith_id || h.id || start + idx,
              book: bookId
            })));
            successfulBatches++;
          }
        } catch (err) {
          console.warn(`Batch ${batch + 1} failed:`, err);
        }

        setDownloadProgress(Math.round(((batch + 1) / totalBatches) * 100));
        
        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      if (allHadiths.length > 0) {
        await saveHadithsToDb(bookId, allHadiths);
        setDownloadedBooks(prev => [...new Set([...prev, bookId])]);
        toast.success(`تم تنزيل ${book.nameAr} (${allHadiths.length} حديث)`);
      } else {
        toast.error(`فشل تنزيل ${book.nameAr}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('فشل في تنزيل الأحاديث');
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  }, []);

  // Get hadiths (from IndexedDB if available, otherwise from API)
  const getHadiths = useCallback(async (bookId: string, page: number = 1, limit: number = 20): Promise<Hadith[]> => {
    // First check IndexedDB
    const offlineHadiths = await getHadithsFromDb(bookId);
    
    if (offlineHadiths && offlineHadiths.length > 0) {
      const start = (page - 1) * limit;
      const end = start + limit;
      return offlineHadiths.slice(start, end);
    }

    // Fallback to API
    try {
      const startId = (page - 1) * limit + 1;
      const endId = page * limit;
      
      const data = await fetchFromApi(`${bookId}?start=${startId}&end=${endId}`);
      
      if (Array.isArray(data)) {
        return data.map((h: any, idx: number) => ({
          ...h,
          id: h.id || startId + idx,
          hadith_id: h.hadith_id || h.id || startId + idx,
          book: bookId
        }));
      } else if (data?.hadiths) {
        return data.hadiths.map((h: any, idx: number) => ({
          ...h,
          id: h.id || startId + idx,
          hadith_id: h.hadith_id || h.id || startId + idx,
          book: bookId
        }));
      }
    } catch (error) {
      console.error('API Error:', error);
    }

    return [];
  }, []);

  // Get specific hadith
  const getHadith = useCallback(async (bookId: string, hadithId: number): Promise<Hadith | null> => {
    const offlineHadiths = await getHadithsFromDb(bookId);
    
    if (offlineHadiths && offlineHadiths.length > 0) {
      return offlineHadiths.find(h => h.hadith_id === hadithId || h.id === hadithId) || null;
    }

    try {
      const data = await fetchFromApi(`${bookId}/${hadithId}`);
      return data;
    } catch (error) {
      console.error('API Error:', error);
    }

    return null;
  }, []);

  // Delete downloaded book
  const deleteBook = useCallback(async (bookId: string) => {
    try {
      await deleteBookFromDb(bookId);
      setDownloadedBooks(prev => prev.filter(id => id !== bookId));
      toast.success('تم حذف الكتاب من التنزيلات');
    } catch {
      toast.error('فشل في حذف الكتاب');
    }
  }, []);

  // Check if book is downloaded
  const isDownloaded = useCallback((bookId: string): boolean => {
    return downloadedBooks.includes(bookId);
  }, [downloadedBooks]);

  return {
    downloading,
    downloadProgress,
    downloadedBooks,
    checkDownloadedBooks,
    downloadBook,
    getHadiths,
    getHadith,
    deleteBook,
    isDownloaded
  };
};
