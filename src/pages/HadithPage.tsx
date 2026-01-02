import { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHadith } from '@/hooks/useHadith';
import { hadithBooks, Hadith, getBookById } from '@/data/hadithBooks';
import { 
  Search, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Sparkles,
  Library,
  Star,
  Download,
  Trash2,
  CheckCircle,
  Loader2,
  WifiOff,
  X,
  Filter,
  RotateCcw,
  Eye,
  FileDown,
  FileText,
  HardDrive
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

  const ITEMS_PER_PAGE = 20;
  
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

  const loadRandomHadith = async () => {
    setLoadingRandom(true);
    try {
      const hadith = await getRandomHadith();
      setRandomHadith(hadith);
    } catch {
      toast.error('فشل في جلب الحديث');
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
  };

  const openDetails = (hadith: Hadith) => {
    setSelectedHadith(hadith);
    setDetailsOpen(true);
  };

  const downloadSingleHadith = async (hadith: Hadith, format: 'txt' | 'json' = 'txt') => {
    const book = getBookById(hadith.bookId);
    
    if (format === 'json') {
      const data = {
        hadithNumber: hadith.hadithNumber,
        text: hadith.text,
        narrator: hadith.narrator || '',
        source: book?.nameAr || '',
        elaboration: hadith.elaboration || ''
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hadith_${book?.id || 'unknown'}_${hadith.hadithNumber}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const content = `${hadith.text}\n\n${hadith.narrator ? `الراوي: ${hadith.narrator}\n` : ''}المصدر: ${book?.nameAr || ''}\nرقم الحديث: ${hadith.hadithNumber}${hadith.elaboration ? `\n\nالشرح:\n${hadith.elaboration}` : ''}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hadith_${book?.id || 'unknown'}_${hadith.hadithNumber}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    toast.success('تم تنزيل الحديث');
  };

  const currentBookData = getBookById(selectedBook);
  const displayedHadiths = isSearchMode ? searchResults : hadiths;
  
  // Calculate estimated file size for current book
  const estimatedBookSize = useMemo(() => {
    const book = getBookById(selectedBook);
    if (!book) return '~';
    // Rough estimate: ~500 bytes per hadith
    const sizeKB = Math.round((book.totalHadiths * 500) / 1024);
    if (sizeKB < 1024) return `${sizeKB} KB`;
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  }, [selectedBook]);

  return (
    <TooltipProvider>
      <Helmet>
        <title>الأحاديث النبوية الشريفة | نور الفرقان</title>
        <meta name="description" content="تصفح الأحاديث النبوية من الكتب التسعة بالتشكيل الكامل" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <Header />

        {/* Hero Section with Large Search Bar */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-10 overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center arabic-ui">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
                <Library className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                الأحاديث النبوية الشريفة
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                مستمدة من كتب الحديث التسعة بتشكيل دقيق
              </p>

              {/* Large Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="ابحث بكلمة – راوٍ – نص الحديث... (النتائج تظهر فوراً)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-14 pl-12 h-14 text-lg rounded-2xl border-2 border-border focus:border-primary bg-background/90 backdrop-blur-sm text-right shadow-lg"
                  />
                  {searchQuery && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          type="button"
                          onClick={clearSearch}
                          className="absolute left-5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                        >
                          <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>مسح البحث</TooltipContent>
                    </Tooltip>
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

        <main className="container mx-auto px-4 py-6 arabic-ui">
          {/* Filters Bar */}
          <Card className="mb-6 p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {/* Book Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">الكتاب:</span>
              </div>
              <Select value={selectedBook} onValueChange={selectBook}>
                <SelectTrigger className="w-[220px] border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hadithBooks.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      <div className="flex items-center gap-2">
                        <span>{book.nameAr}</span>
                        {isDownloaded(book.id) && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Reset Button */}
              {isSearchMode && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={clearSearch} className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      إلغاء البحث
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>العودة لعرض كل الأحاديث</TooltipContent>
                </Tooltip>
              )}
              
              <div className="flex-1" />
              
              {/* Stats */}
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                      <HardDrive className="w-3.5 h-3.5" />
                      {storageStats.totalHadiths.toLocaleString('ar-EG')} حديث محفوظ
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>عدد الأحاديث المحفوظة للقراءة بدون إنترنت</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </Card>

          {/* Books Grid */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                الكتب التسعة المتوفرة
              </h2>
              <Badge variant="outline" className="text-muted-foreground">
                {hadithBooks.reduce((sum, b) => sum + b.totalHadiths, 0).toLocaleString('ar-EG')} حديث
              </Badge>
            </div>
            <ScrollArea className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {hadithBooks.map((book) => {
                  const bookDownloaded = isDownloaded(book.id);
                  const isDownloading = downloading === book.id;
                  const isSelected = selectedBook === book.id;

                  return (
                    <Card
                      key={book.id}
                      className={`relative p-4 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5 shadow-md' : 'hover:bg-muted/30'
                      }`}
                      onClick={() => selectBook(book.id)}
                    >
                      {bookDownloaded && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="absolute top-2 left-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>محفوظ للقراءة بدون إنترنت</TooltipContent>
                        </Tooltip>
                      )}

                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${book.color} flex items-center justify-center mb-3 shadow-md`}>
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      
                      <h3 className="font-bold text-foreground mb-1 line-clamp-1">{book.nameAr}</h3>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{book.authorAr}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span>{book.totalHadiths.toLocaleString('ar-EG')} حديث</span>
                      </div>

                      {isDownloading ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-primary font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>جاري التنزيل {downloadProgress}%</span>
                          </div>
                          <Progress value={downloadProgress} className="h-2" />
                        </div>
                      ) : bookDownloaded ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => handleDelete(book.id, e)}
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف من الجهاز
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>حذف الكتاب من التخزين المحلي</TooltipContent>
                        </Tooltip>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-8 text-xs gap-1"
                              onClick={(e) => handleDownload(book.id, e)}
                              disabled={!!downloading}
                            >
                              <Download className="w-4 h-4" />
                              تنزيل للقراءة بدون نت
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>تنزيل الكتاب للقراءة بدون إنترنت (~{Math.round((book.totalHadiths * 500) / 1024)} KB)</TooltipContent>
                        </Tooltip>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </section>

          {/* Random Hadith */}
          <Card className="mb-8 overflow-hidden shadow-md">
            <div className="bg-gradient-to-br from-accent/15 to-primary/15 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">حديث عشوائي</h2>
                    <p className="text-sm text-muted-foreground">اكتشف حديثاً جديداً كل مرة</p>
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={loadRandomHadith} disabled={loadingRandom} className="gap-2">
                      <RefreshCw className={`w-4 h-4 ${loadingRandom ? 'animate-spin' : ''}`} />
                      حديث جديد
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>عرض حديث عشوائي من أحد الكتب</TooltipContent>
                </Tooltip>
              </div>

              {randomHadith ? (
                <div className="space-y-4">
                  <div className="bg-card/60 rounded-xl p-5 shadow-inner">
                    <p className="quran-text text-lg leading-loose text-foreground">
                      {randomHadith.text}
                    </p>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Badge variant="outline">{getBookById(randomHadith.bookId)?.nameAr}</Badge>
                      {randomHadith.narrator && (
                        <span className="text-xs">الراوي: {randomHadith.narrator}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleCopy(randomHadith)}>
                            {copiedId === randomHadith.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>نسخ الحديث</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleShare(randomHadith)}>
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>مشاركة الحديث</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openDetails(randomHadith)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>عرض التفاصيل</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Button onClick={loadRandomHadith} disabled={loadingRandom} size="lg" className="gap-2">
                    <Sparkles className="w-5 h-5" />
                    اظهر حديثاً عشوائياً
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Hadiths List */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">
                  {isSearchMode ? `نتائج البحث` : currentBookData?.nameAr}
                </h2>
                {isSearchMode && (
                  <Badge variant="secondary">{searchResults.length} نتيجة</Badge>
                )}
                {!isSearchMode && isDownloaded(selectedBook) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1.5 text-green-600 border-green-500/30 bg-green-500/10">
                        <WifiOff className="w-3.5 h-3.5" />
                        متاح بدون نت
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>يمكنك قراءة هذا الكتاب بدون اتصال بالإنترنت</TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {!isSearchMode && (
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || loadingHadiths}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>الصفحة السابقة</TooltipContent>
                  </Tooltip>
                  <span className="text-sm text-muted-foreground px-3 min-w-[100px] text-center font-medium">
                    صفحة {currentPage} من {Math.ceil(totalHadiths / ITEMS_PER_PAGE) || 1}
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={!hasMore || loadingHadiths}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>الصفحة التالية</TooltipContent>
                  </Tooltip>
                </div>
              )}
            </div>

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
              <Card className="p-10 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">
                  {isSearchMode ? 'لا توجد نتائج' : 'لا توجد أحاديث'}
                </h3>
                <p className="text-muted-foreground mb-5">
                  {isSearchMode 
                    ? 'جرب كلمات بحث مختلفة أو اختر كتاباً آخر' 
                    : 'قم بتنزيل الكتاب للتصفح بدون انترنت'}
                </p>
                {!isSearchMode && !isDownloaded(selectedBook) && !downloading && (
                  <Button onClick={(e) => handleDownload(selectedBook, e)} size="lg" className="gap-2">
                    <Download className="w-5 h-5" />
                    تنزيل الكتاب (~{estimatedBookSize})
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {displayedHadiths.map((hadith, index) => (
                  <HadithCard
                    key={`${hadith.bookId}-${hadith.id}-${index}`}
                    hadith={hadith}
                    onCopy={handleCopy}
                    onShare={handleShare}
                    onViewDetails={openDetails}
                    onDownload={downloadSingleHadith}
                    copiedId={copiedId}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Footer Stats */}
          <Card className="mt-8 p-5 bg-muted/30">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <FileText className="w-4 h-4 text-primary" />
                <span className="font-medium">عدد الأحاديث المعروضة:</span>
                <span>{displayedHadiths.length}</span>
                {!isSearchMode && totalHadiths > 0 && (
                  <span className="text-muted-foreground">من أصل {totalHadiths.toLocaleString('ar-EG')}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <HardDrive className="w-4 h-4 text-primary" />
                <span className="font-medium">محفوظ محلياً:</span>
                <span>{storageStats.totalHadiths.toLocaleString('ar-EG')} حديث</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium">الكتب المحفوظة:</span>
                <span>{storageStats.booksCount} من {hadithBooks.length}</span>
              </div>
            </div>
          </Card>
        </main>

        {/* Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-right arabic-ui text-xl">تفاصيل الحديث</DialogTitle>
            </DialogHeader>
            
            {selectedHadith && (
              <div className="space-y-5 arabic-ui text-right">
                {/* Hadith Text */}
                <div className="bg-muted/50 rounded-xl p-5">
                  <p className="quran-text text-xl leading-loose text-foreground">{selectedHadith.text}</p>
                </div>
                
                {/* Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-card border rounded-lg p-3">
                    <span className="text-xs text-muted-foreground block mb-1">المصدر</span>
                    <span className="font-semibold text-foreground">{getBookById(selectedHadith.bookId)?.nameAr}</span>
                  </div>
                  <div className="bg-card border rounded-lg p-3">
                    <span className="text-xs text-muted-foreground block mb-1">رقم الحديث</span>
                    <span className="font-semibold text-foreground">{selectedHadith.hadithNumber}</span>
                  </div>
                  {selectedHadith.narrator && (
                    <div className="bg-card border rounded-lg p-3 sm:col-span-2">
                      <span className="text-xs text-muted-foreground block mb-1">الراوي</span>
                      <span className="font-semibold text-foreground">{selectedHadith.narrator}</span>
                    </div>
                  )}
                </div>
                
                {/* Elaboration */}
                {selectedHadith.elaboration && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      الشرح
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedHadith.elaboration}</p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleCopy(selectedHadith)} className="gap-2">
                        <Copy className="w-4 h-4" />
                        نسخ
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>نسخ نص الحديث</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleShare(selectedHadith)} className="gap-2">
                        <Share2 className="w-4 h-4" />
                        مشاركة
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>مشاركة الحديث</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => downloadSingleHadith(selectedHadith, 'txt')} className="gap-2">
                        <FileDown className="w-4 h-4" />
                        تنزيل TXT
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>تنزيل كملف نصي</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => downloadSingleHadith(selectedHadith, 'json')} className="gap-2">
                        <FileDown className="w-4 h-4" />
                        تنزيل JSON
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>تنزيل بصيغة JSON</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

// Hadith Card Component
interface HadithCardProps {
  hadith: Hadith;
  onCopy: (hadith: Hadith) => void;
  onShare: (hadith: Hadith) => void;
  onViewDetails: (hadith: Hadith) => void;
  onDownload: (hadith: Hadith, format: 'txt' | 'json') => void;
  copiedId: number | null;
}

const HadithCard = ({ hadith, onCopy, onShare, onViewDetails, onDownload, copiedId }: HadithCardProps) => {
  const book = getBookById(hadith.bookId);
  
  // Truncate text for preview
  const previewText = hadith.text.length > 350 
    ? hadith.text.substring(0, 350) + '...' 
    : hadith.text;

  return (
    <TooltipProvider>
      <Card className="p-5 hover:shadow-lg transition-all hover:border-primary/30">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge className={`bg-gradient-to-r ${book?.color} text-white border-0`}>
              {book?.nameAr}
            </Badge>
            <span className="text-sm text-muted-foreground font-medium">رقم {hadith.hadithNumber}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(hadith, 'txt')}>
                  <FileDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تنزيل الحديث (TXT)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(hadith)}>
                  {copiedId === hadith.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>نسخ الحديث</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShare(hadith)}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>مشاركة الحديث</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {/* Hadith Text */}
        <p className="quran-text text-lg leading-loose mb-4 text-foreground">
          {previewText}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {hadith.narrator ? (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">الراوي:</span> {hadith.narrator}
            </p>
          ) : (
            <span />
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary hover:bg-primary/10 gap-2"
            onClick={() => onViewDetails(hadith)}
          >
            <Eye className="w-4 h-4" />
            عرض التفاصيل
          </Button>
        </div>
      </Card>
    </TooltipProvider>
  );
};

export default HadithPage;
