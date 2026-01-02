import { useState, useCallback } from 'react';
import { Hadith, HadithBook, hadithBooks, getBookById } from '@/data/hadithBooks';

const DB_NAME = 'hadith-offline-v2';
const DB_VERSION = 1;
const STORE_NAME = 'hadiths';

// Get Supabase URL
const getSupabaseUrl = () => {
  return import.meta.env.VITE_SUPABASE_URL || 'https://xjbykaphnxiyocmkurpo.supabase.co';
};

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
const saveHadithsToDb = async (bookId: string, hadiths: Hadith[], total: number): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const data = {
      bookId,
      hadiths,
      total,
      downloadedAt: new Date().toISOString()
    };
    
    const request = store.put(data);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Get hadiths from IndexedDB
const getHadithsFromDb = async (bookId: string): Promise<{ hadiths: Hadith[]; total: number } | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(bookId);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? { hadiths: result.hadiths, total: result.total } : null);
      };
    });
  } catch {
    return null;
  }
};

// Get all downloaded books
const getDownloadedBooks = async (): Promise<{ bookId: string; count: number; downloadedAt: string }[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const results = request.result || [];
        resolve(results.map((r: any) => ({
          bookId: r.bookId,
          count: r.hadiths?.length || 0,
          downloadedAt: r.downloadedAt
        })));
      };
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

// Calculate storage size
const getStorageStats = async (): Promise<{ totalHadiths: number; booksCount: number }> => {
  try {
    const books = await getDownloadedBooks();
    return {
      totalHadiths: books.reduce((sum, b) => sum + b.count, 0),
      booksCount: books.length
    };
  } catch {
    return { totalHadiths: 0, booksCount: 0 };
  }
};

// Fetch from edge function
const fetchFromApi = async (params: Record<string, string>): Promise<any> => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${getSupabaseUrl()}/functions/v1/hadith-api?${queryString}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
};

export interface UseHadithResult {
  // States
  loading: boolean;
  downloading: string | null;
  downloadProgress: number;
  downloadedBooks: string[];
  storageStats: { totalHadiths: number; booksCount: number };
  
  // Methods
  fetchHadiths: (bookId: string, page: number, limit: number) => Promise<{ hadiths: Hadith[]; total: number; hasMore: boolean }>;
  searchHadiths: (bookId: string, query: string) => Promise<{ results: Hadith[]; total: number }>;
  downloadBook: (bookId: string, onProgress?: (progress: number) => void) => Promise<boolean>;
  deleteBook: (bookId: string) => Promise<void>;
  isDownloaded: (bookId: string) => boolean;
  getRandomHadith: (bookId?: string) => Promise<Hadith | null>;
  refreshDownloadedBooks: () => Promise<void>;
}

export const useHadith = (): UseHadithResult => {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedBooks, setDownloadedBooks] = useState<string[]>([]);
  const [storageStats, setStorageStats] = useState({ totalHadiths: 0, booksCount: 0 });

  // Refresh list of downloaded books
  const refreshDownloadedBooks = useCallback(async () => {
    const books = await getDownloadedBooks();
    setDownloadedBooks(books.map(b => b.bookId));
    const stats = await getStorageStats();
    setStorageStats(stats);
  }, []);

  // Check if book is downloaded
  const isDownloaded = useCallback((bookId: string): boolean => {
    return downloadedBooks.includes(bookId);
  }, [downloadedBooks]);

  // Fetch hadiths (from IndexedDB first, then API)
  const fetchHadiths = useCallback(async (bookId: string, page: number, limit: number) => {
    setLoading(true);
    
    try {
      // Check offline first
      const offlineData = await getHadithsFromDb(bookId);
      
      if (offlineData && offlineData.hadiths.length > 0) {
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedHadiths = offlineData.hadiths.slice(start, end);
        
        return {
          hadiths: paginatedHadiths,
          total: offlineData.total,
          hasMore: end < offlineData.hadiths.length
        };
      }

      // Fallback to API
      const start = (page - 1) * limit;
      const data = await fetchFromApi({
        action: 'fetch',
        book: bookId,
        start: start.toString(),
        limit: limit.toString()
      });

      return {
        hadiths: data.hadiths || [],
        total: data.total || 0,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error('Error fetching hadiths:', error);
      return { hadiths: [], total: 0, hasMore: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // Search hadiths
  const searchHadiths = useCallback(async (bookId: string, query: string) => {
    setLoading(true);
    
    try {
      // Check offline first
      const offlineData = await getHadithsFromDb(bookId);
      
      if (offlineData && offlineData.hadiths.length > 0) {
        const normalizedQuery = query.toLowerCase();
        const results = offlineData.hadiths.filter(h => 
          h.text.toLowerCase().includes(normalizedQuery) ||
          h.narrator?.toLowerCase().includes(normalizedQuery)
        ).slice(0, 100);
        
        return { results, total: results.length };
      }

      // Fallback to API
      const data = await fetchFromApi({
        action: 'search',
        book: bookId,
        q: query,
        limit: '100'
      });

      return {
        results: data.results || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error searching hadiths:', error);
      return { results: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  // Download entire book
  const downloadBook = useCallback(async (bookId: string, onProgress?: (progress: number) => void) => {
    const book = getBookById(bookId);
    if (!book) return false;

    setDownloading(bookId);
    setDownloadProgress(0);

    try {
      const allHadiths: Hadith[] = [];
      const batchSize = 500;
      let start = 0;
      let total = 0;
      let hasMore = true;

      while (hasMore) {
        const data = await fetchFromApi({
          action: 'fetch',
          book: bookId,
          start: start.toString(),
          limit: batchSize.toString()
        });

        if (data.hadiths && data.hadiths.length > 0) {
          allHadiths.push(...data.hadiths);
          total = data.total || allHadiths.length;
          hasMore = data.hasMore || false;
          start += batchSize;

          const progress = Math.min(Math.round((allHadiths.length / total) * 100), 100);
          setDownloadProgress(progress);
          onProgress?.(progress);
        } else {
          hasMore = false;
        }

        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (allHadiths.length > 0) {
        await saveHadithsToDb(bookId, allHadiths, total);
        await refreshDownloadedBooks();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Download error:', error);
      return false;
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  }, [refreshDownloadedBooks]);

  // Delete downloaded book
  const deleteBook = useCallback(async (bookId: string) => {
    await deleteBookFromDb(bookId);
    await refreshDownloadedBooks();
  }, [refreshDownloadedBooks]);

  // Get random hadith
  const getRandomHadith = useCallback(async (bookId?: string): Promise<Hadith | null> => {
    try {
      const targetBookId = bookId || hadithBooks[Math.floor(Math.random() * hadithBooks.length)].id;
      const book = getBookById(targetBookId);
      if (!book) return null;

      // Try offline first
      const offlineData = await getHadithsFromDb(targetBookId);
      if (offlineData && offlineData.hadiths.length > 0) {
        const randomIndex = Math.floor(Math.random() * offlineData.hadiths.length);
        return offlineData.hadiths[randomIndex];
      }

      // Random start position
      const randomStart = Math.floor(Math.random() * Math.min(book.totalHadiths, 1000));
      const data = await fetchFromApi({
        action: 'fetch',
        book: targetBookId,
        start: randomStart.toString(),
        limit: '1'
      });

      return data.hadiths?.[0] || null;
    } catch (error) {
      console.error('Error getting random hadith:', error);
      return null;
    }
  }, []);

  return {
    loading,
    downloading,
    downloadProgress,
    downloadedBooks,
    storageStats,
    fetchHadiths,
    searchHadiths,
    downloadBook,
    deleteBook,
    isDownloaded,
    getRandomHadith,
    refreshDownloadedBooks
  };
};
