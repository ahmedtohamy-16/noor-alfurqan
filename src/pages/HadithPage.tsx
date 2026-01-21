import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useHadith } from '@/hooks/useHadith';
import { useReadingSettings } from '@/hooks/useReadingSettings';
import { hadithBooks, Hadith, getBookById } from '@/data/hadithBooks';
import HadithShareDialog from '@/components/HadithShareDialog';
import HadithBookCard from '@/components/hadith/HadithBookCard';
import HadithItemCard from '@/components/hadith/HadithItemCard';
import HadithFontControls from '@/components/hadith/HadithFontControls';
import HadithDetailsModal from '@/components/hadith/HadithDetailsModal';
import RandomHadithSection from '@/components/hadith/RandomHadithSection';
import { 
  Search, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Library,
  Loader2,
  X,
  Filter,
  RotateCcw,
  HardDrive,
  Layers,
  BookMarked
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
  const [activeTab, setActiveTab] = useState<'browse' | 'books'>('browse');

  const ITEMS_PER_PAGE = 15;
  
  // Debounced search query for real-time search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const isSearchMode = debouncedSearchQuery.trim().length > 0;

  // Load downloaded books on mount
  useEffect(() => {
    refreshDownloadedBooks();
  }, [refreshDownloadedBooks]);

  // Load hadiths when book or page changes (only if not in search mode)
  useEffect(() => {
    if (!isSearchMode) {
      loadHadiths();
    }
  }, [selectedBook, currentPage, isSearchMode]);
  
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

  const loadHadiths = async () => {
    setLoadingHadiths(true);
    try {
      const data = await fetchHadiths(selectedBook, currentPage, ITEMS_PER_PAGE);
      setHadiths(data.hadiths);
      setTotalHadiths(data.total);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error loading hadiths:', error);
      setHadiths([]);
    } finally {
      setLoadingHadiths(false);
    }
  };

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
    setCurrentPage(1);
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
  const totalPages = Math.ceil(totalHadiths / ITEMS_PER_PAGE) || 1;

  return (
    <TooltipProvider>
      <Helmet>
        <title>الأحاديث النبوية الشريفة | نور الفرقان</title>
        <meta name="description" content="مكتبة الأحاديث النبوية من الكتب التسعة بتشكيل كامل وتصدير بجودة 4K" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/15 via-accent/5 to-background py-12 overflow-hidden">
          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 islamic-pattern opacity-30" />
          
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center arabic-ui">
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30">
                <Library className="w-10 h-10 text-primary-foreground" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                الأحاديث النبوية الشريفة
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                مستمدة من كتب الحديث التسعة بتشكيل دقيق وجودة عالية
              </p>

              {/* Large Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative group">
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    type="text"
                    placeholder="ابحث بكلمة – راوٍ – نص الحديث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-14 pl-12 h-14 text-lg rounded-2xl border-2 border-border focus:border-primary bg-background/80 backdrop-blur-sm text-right shadow-xl transition-all focus:shadow-2xl focus:shadow-primary/10"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={clearSearch}
                      className="absolute left-5 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  )}
                </div>
                {isSearchMode && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {isSearching ? 'جاري البحث...' : `عدد النتائج: ${searchResults.length}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-8 arabic-ui">
          {/* Random Hadith Section */}
          <div className="mb-8">
            <RandomHadithSection
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <TabsList className="bg-muted/50 p-1 h-12">
                <TabsTrigger value="browse" className="gap-2 h-10 px-5 data-[state=active]:bg-background data-[state=active]:shadow-md">
                  <BookMarked className="w-4 h-4" />
                  <span>تصفح الأحاديث</span>
                </TabsTrigger>
                <TabsTrigger value="books" className="gap-2 h-10 px-5 data-[state=active]:bg-background data-[state=active]:shadow-md">
                  <Layers className="w-4 h-4" />
                  <span>الكتب التسعة</span>
                </TabsTrigger>
              </TabsList>

              {/* Font Controls */}
              <div className="flex items-center gap-3">
                <HadithFontControls
                  fontSize={hadithFontSize}
                  fontFamily={hadithFontFamily}
                  onFontSizeChange={handleFontSizeChange}
                  onFontFamilyChange={handleFontFamilyChange}
                />
                
                {/* Storage stats badge */}
                <Badge variant="secondary" className="gap-2 py-2 px-3 hidden sm:flex">
                  <HardDrive className="w-3.5 h-3.5" />
                  {storageStats.totalHadiths.toLocaleString('ar-EG')} حديث محفوظ
                </Badge>
              </div>
            </div>

            {/* Browse Tab */}
            <TabsContent value="browse" className="space-y-6 mt-6">
              {/* Book selector and filters */}
              <Card className="p-4 shadow-md border-2 border-border/50">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">الكتاب:</span>
                  </div>
                  
                  <ScrollArea className="flex-1 max-w-full">
                    <div className="flex gap-2 pb-2">
                      {hadithBooks.map(book => (
                        <Button
                          key={book.id}
                          variant={selectedBook === book.id ? "default" : "outline"}
                          size="sm"
                          className={`shrink-0 gap-2 ${selectedBook === book.id ? '' : 'hover:bg-primary/10 hover:text-primary hover:border-primary/50'}`}
                          onClick={() => selectBook(book.id)}
                        >
                          {book.nameAr}
                          {isDownloaded(book.id) && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {isSearchMode && (
                    <Button variant="ghost" size="sm" onClick={clearSearch} className="gap-2 shrink-0">
                      <RotateCcw className="w-4 h-4" />
                      إلغاء البحث
                    </Button>
                  )}
                </div>
              </Card>

              {/* Hadiths list header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    {isSearchMode ? 'نتائج البحث' : currentBookData?.nameAr}
                  </h2>
                  {isSearchMode && (
                    <Badge variant="secondary">{searchResults.length} نتيجة</Badge>
                  )}
                  {!isSearchMode && isDownloaded(selectedBook) && (
                    <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                      متاح بدون نت
                    </Badge>
                  )}
                </div>
                
                {/* Pagination */}
                {!isSearchMode && totalHadiths > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loadingHadiths}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-3 min-w-[120px] text-center font-medium">
                      صفحة {currentPage} من {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!hasMore || loadingHadiths}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Hadiths grid */}
              {loadingHadiths || isSearching ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-24 w-full mb-3" />
                      <Skeleton className="h-4 w-40" />
                    </Card>
                  ))}
                </div>
              ) : displayedHadiths.length === 0 ? (
                <Card className="p-12 text-center border-2 border-dashed">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-bold text-xl text-foreground mb-2">
                    {isSearchMode ? 'لا توجد نتائج' : 'لا توجد أحاديث'}
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {isSearchMode 
                      ? 'جرب كلمات بحث مختلفة أو اختر كتاباً آخر' 
                      : 'قم بتنزيل الكتاب لتصفحه بدون اتصال بالإنترنت'}
                  </p>
                  {!isSearchMode && !isDownloaded(selectedBook) && !downloading && (
                    <Button onClick={(e) => handleDownload(selectedBook, e)} size="lg" className="gap-2">
                      تنزيل الكتاب
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="space-y-4">
                  {displayedHadiths.map((hadith, index) => (
                    <HadithItemCard
                      key={`${hadith.bookId}-${hadith.id}-${index}`}
                      hadith={hadith}
                      fontSize={hadithFontSize}
                      fontFamily={hadithFontFamily}
                      onCopy={handleCopy}
                      onShare={handleShare}
                      onViewDetails={openDetails}
                      onShareAsImage={handleShareAsImage}
                      copiedId={copiedId}
                    />
                  ))}
                </div>
              )}

              {/* Bottom pagination */}
              {!isSearchMode && totalHadiths > ITEMS_PER_PAGE && (
                <div className="flex justify-center pt-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loadingHadiths}
                      className="gap-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                      السابق
                    </Button>
                    <span className="text-sm text-muted-foreground px-4 font-medium">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={!hasMore || loadingHadiths}
                      className="gap-2"
                    >
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Books Tab */}
            <TabsContent value="books" className="mt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">الكتب التسعة</h2>
                <p className="text-muted-foreground">
                  مكتبة شاملة من كتب الحديث الشريف — اختر كتاباً للتصفح أو التنزيل
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {hadithBooks.map((book) => (
                  <HadithBookCard
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
              <Card className="mt-8 p-5 bg-gradient-to-br from-muted/30 to-muted/10 border-2">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Library className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">إجمالي الأحاديث</span>
                      <span className="font-bold text-foreground">
                        {hadithBooks.reduce((sum, b) => sum + b.totalHadiths, 0).toLocaleString('ar-EG')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <HardDrive className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">محفوظ محلياً</span>
                      <span className="font-bold text-foreground">
                        {storageStats.totalHadiths.toLocaleString('ar-EG')} حديث
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">الكتب المحفوظة</span>
                      <span className="font-bold text-foreground">
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
