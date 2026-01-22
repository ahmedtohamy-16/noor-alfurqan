import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useHadith } from '@/hooks/useHadith';
import { useReadingSettings } from '@/hooks/useReadingSettings';
import { hadithBooks, Hadith, getBookById } from '@/data/hadithBooks';
import HadithShareDialog from '@/components/HadithShareDialog';
import HadithFontControls from '@/components/hadith/HadithFontControls';
import HadithDetailsModal from '@/components/hadith/HadithDetailsModal';
import HadithHeroSection from '@/components/hadith/HadithHeroSection';
import HadithFeaturedCard from '@/components/hadith/HadithFeaturedCard';
import HadithBookSelector from '@/components/hadith/HadithBookSelector';
import HadithInfiniteList from '@/components/hadith/HadithInfiniteList';
import HadithLibraryCard from '@/components/hadith/HadithLibraryCard';
import { 
  BookMarked,
  Library,
  HardDrive,
  BookOpen,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const HadithPage = () => {
  const { 
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
  } = useHadith();

  const { settings, updateSettings } = useReadingSettings();
  
  // States
  const [selectedBook, setSelectedBook] = useState(hadithBooks[0].id);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHadiths, setTotalHadiths] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [randomHadith, setRandomHadith] = useState<Hadith | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Share dialog states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareHadith, setShareHadith] = useState<Hadith | null>(null);

  // Font settings
  type FontFamily = 'Amiri' | 'Scheherazade' | 'Noto Naskh' | 'Uthmani';
  const [hadithFontSize, setHadithFontSize] = useState(settings.fontSize || 22);
  const [hadithFontFamily, setHadithFontFamily] = useState<FontFamily>(settings.fontFamily || 'Amiri');

  // Tab state
  const [activeTab, setActiveTab] = useState<'browse' | 'library'>('browse');

  const ITEMS_PER_PAGE = 20;
  
  // Debounced search query for real-time search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const isSearchMode = debouncedSearchQuery.trim().length > 0;

  // Load downloaded books on mount
  useEffect(() => {
    refreshDownloadedBooks();
  }, [refreshDownloadedBooks]);

  // Load hadiths when book changes (reset to page 1)
  useEffect(() => {
    if (!isSearchMode) {
      setCurrentPage(1);
      setHadiths([]);
      loadHadiths(1, true);
    }
  }, [selectedBook]);

  // Load more when page changes
  useEffect(() => {
    if (!isSearchMode && currentPage > 1) {
      loadHadiths(currentPage, false);
    }
  }, [currentPage]);
  
  // Real-time search when query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, selectedBook]);

  // Load random hadith on mount
  useEffect(() => {
    loadRandomHadith();
  }, []);

  const loadHadiths = async (page: number, reset: boolean) => {
    if (reset) {
      setLoadingHadiths(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const data = await fetchHadiths(selectedBook, page, ITEMS_PER_PAGE);
      
      if (reset) {
        setHadiths(data.hadiths);
      } else {
        setHadiths(prev => [...prev, ...data.hadiths]);
      }
      
      setTotalHadiths(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading hadiths:', error);
      if (reset) setHadiths([]);
    } finally {
      setLoadingHadiths(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const data = await searchHadiths(selectedBook, query);
      setSearchResults(data.results);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCopy = async (hadith: Hadith) => {
    const book = getBookById(hadith.bookId);
    const bookName = book?.nameAr || '';
    const text = `${hadith.text}\n\n— ${bookName} (${hadith.hadithNumber})`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(hadith.id);
      toast.success('تم نسخ الحديث');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('فشل في النسخ');
    }
  };

  const handleShare = async (hadith: Hadith) => {
    const book = getBookById(hadith.bookId);
    const bookName = book?.nameAr || '';
    const text = `${hadith.text}\n\n— ${bookName} (${hadith.hadithNumber})`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'حديث نبوي', text });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy(hadith);
    }
  };

  const handleShareAsImage = (hadith: Hadith) => {
    setShareHadith(hadith);
    setShareDialogOpen(true);
  };

  const loadRandomHadith = async () => {
    setLoadingRandom(true);
    try {
      const hadith = await getRandomHadith();
      setRandomHadith(hadith);
    } catch {
      // Silent fail
    }
    setLoadingRandom(false);
  };

  const handleDownload = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await downloadBook(bookId);
    if (success) {
      toast.success('تم تنزيل الكتاب بنجاح');
    } else {
      toast.error('فشل في تنزيل الكتاب');
    }
  };

  const handleDelete = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteBook(bookId);
    toast.success('تم حذف الكتاب');
  };

  const selectBook = (bookId: string) => {
    setSelectedBook(bookId);
    setSearchQuery('');
    setSearchResults([]);
    setActiveTab('browse');
  };

  const openDetails = (hadith: Hadith) => {
    setSelectedHadith(hadith);
    setDetailsOpen(true);
  };

  const handleFontSizeChange = (size: number) => {
    setHadithFontSize(size);
    updateSettings({ fontSize: size });
  };

  const handleFontFamilyChange = (family: string) => {
    const validFamilies: FontFamily[] = ['Amiri', 'Scheherazade', 'Noto Naskh', 'Uthmani'];
    if (validFamilies.includes(family as FontFamily)) {
      setHadithFontFamily(family as FontFamily);
      updateSettings({ fontFamily: family as FontFamily });
    }
  };

  const currentBookData = getBookById(selectedBook);
  const displayedHadiths = isSearchMode ? searchResults : hadiths;

  return (
    <TooltipProvider>
      <Helmet>
        <title>الأحاديث النبوية الشريفة | نور الفرقان</title>
        <meta name="description" content="مكتبة الأحاديث النبوية من الكتب التسعة بتشكيل كامل وتصدير بجودة 4K" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Islamic pattern background overlay */}
        <div className="fixed inset-0 islamic-pattern opacity-30 pointer-events-none" />
        
        <Header />

        {/* Hero Section with Search */}
        <HadithHeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={clearSearch}
          isSearching={isSearching}
          searchResultsCount={searchResults.length}
          isSearchMode={isSearchMode}
        />

        <main className="container mx-auto px-4 py-8 arabic-ui relative z-10">
          {/* Featured Random Hadith */}
          <div className="mb-10">
            <HadithFeaturedCard
              hadith={randomHadith}
              isLoading={loadingRandom}
              copiedId={copiedId}
              fontSize={hadithFontSize}
              fontFamily={hadithFontFamily}
              onRefresh={loadRandomHadith}
              onCopy={handleCopy}
              onShare={handleShare}
              onViewDetails={openDetails}
              onShareAsImage={handleShareAsImage}
            />
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TabsList className="bg-card/80 backdrop-blur-sm p-1.5 h-14 border-2 border-border/40 shadow-lg">
                <TabsTrigger 
                  value="browse" 
                  className="gap-2.5 h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg transition-all"
                >
                  <BookMarked className="w-5 h-5" />
                  <span className="font-bold">تصفح الأحاديث</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="library" 
                  className="gap-2.5 h-11 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-lg transition-all"
                >
                  <Layers className="w-5 h-5" />
                  <span className="font-bold">المكتبة</span>
                </TabsTrigger>
              </TabsList>

              {/* Font Controls & Stats */}
              <div className="flex items-center gap-3">
                <HadithFontControls
                  fontSize={hadithFontSize}
                  fontFamily={hadithFontFamily}
                  onFontSizeChange={handleFontSizeChange}
                  onFontFamilyChange={handleFontFamilyChange}
                />
                
                <Badge 
                  variant="secondary" 
                  className="gap-2 py-2.5 px-4 hidden sm:flex bg-card/80 backdrop-blur-sm border border-border/40"
                >
                  <HardDrive className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold">{storageStats.totalHadiths.toLocaleString('ar-EG')}</span>
                  <span className="text-muted-foreground">حديث محفوظ</span>
                </Badge>
              </div>
            </div>

            {/* Browse Tab */}
            <TabsContent value="browse" className="space-y-6 mt-0">
              {/* Book Selector */}
              <HadithBookSelector
                books={hadithBooks}
                selectedBookId={selectedBook}
                onSelectBook={selectBook}
                isDownloaded={isDownloaded}
                isSearchMode={isSearchMode}
                onClearSearch={clearSearch}
              />

              {/* Section header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    {isSearchMode ? 'نتائج البحث' : currentBookData?.nameAr}
                  </h2>
                  {isSearchMode && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {searchResults.length} نتيجة
                    </Badge>
                  )}
                  {!isSearchMode && isDownloaded(selectedBook) && (
                    <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                      متاح بدون نت
                    </Badge>
                  )}
                </div>
              </div>

              {/* Infinite Scroll Hadith List */}
              <HadithInfiniteList
                hadiths={displayedHadiths}
                isLoading={loadingHadiths}
                isLoadingMore={loadingMore}
                hasMore={!isSearchMode && hasMore}
                onLoadMore={handleLoadMore}
                fontSize={hadithFontSize}
                fontFamily={hadithFontFamily}
                onCopy={handleCopy}
                onShare={handleShare}
                onViewDetails={openDetails}
                onShareAsImage={handleShareAsImage}
                copiedId={copiedId}
                emptyMessage={isSearchMode ? 'لا توجد نتائج' : 'لا توجد أحاديث'}
                emptySubMessage={
                  isSearchMode 
                    ? 'جرب كلمات بحث مختلفة أو اختر كتاباً آخر' 
                    : 'قم بتنزيل الكتاب لتصفحه بدون اتصال بالإنترنت'
                }
                showDownloadButton={!isSearchMode && !isDownloaded(selectedBook) && !downloading}
                onDownload={() => handleDownload(selectedBook, { stopPropagation: () => {} } as React.MouseEvent)}
              />
            </TabsContent>

            {/* Library Tab */}
            <TabsContent value="library" className="mt-0">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground mb-3">الكتب التسعة</h2>
                <p className="text-muted-foreground">
                  مكتبة شاملة من أمهات كتب الحديث الشريف — اختر كتاباً للتصفح أو التنزيل
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hadithBooks.map((book) => (
                  <HadithLibraryCard
                    key={book.id}
                    book={book}
                    isSelected={selectedBook === book.id}
                    isDownloaded={isDownloaded(book.id)}
                    isDownloading={downloading === book.id}
                    downloadProgress={downloadProgress}
                    onSelect={selectBook}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Stats summary */}
              <Card className="mt-10 p-6 bg-gradient-to-br from-card via-card to-muted/20 border-2 border-border/40 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-6 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Library className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs mb-0.5">إجمالي الأحاديث</span>
                      <span className="font-bold text-xl text-foreground">
                        {hadithBooks.reduce((sum, b) => sum + b.totalHadiths, 0).toLocaleString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <HardDrive className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs mb-0.5">محفوظ محلياً</span>
                      <span className="font-bold text-xl text-foreground">
                        {storageStats.totalHadiths.toLocaleString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs mb-0.5">الكتب المحفوظة</span>
                      <span className="font-bold text-xl text-foreground">
                        {storageStats.booksCount} من {hadithBooks.length}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Hadith Details Modal */}
        <HadithDetailsModal
          hadith={selectedHadith}
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          fontSize={hadithFontSize}
          fontFamily={hadithFontFamily}
          onCopy={handleCopy}
          onShare={handleShare}
          onShareAsImage={handleShareAsImage}
        />

        {/* Share as Image Dialog */}
        {shareHadith && (
          <HadithShareDialog
            isOpen={shareDialogOpen}
            onClose={() => {
              setShareDialogOpen(false);
              setShareHadith(null);
            }}
            hadithText={shareHadith.text}
            bookName={getBookById(shareHadith.bookId)?.nameAr || ''}
            hadithNumber={shareHadith.hadithNumber}
            narrator={shareHadith.narrator}
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default HadithPage;
