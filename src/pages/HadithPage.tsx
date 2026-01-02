import { useState, useEffect } from 'react';
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
  BookMarked,
  Filter,
  RotateCcw,
  Eye,
  Heart,
  FileDown
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [randomHadith, setRandomHadith] = useState<Hadith | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [loadingHadiths, setLoadingHadiths] = useState(false);
  
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // Load downloaded books on mount
  useEffect(() => {
    refreshDownloadedBooks();
  }, [refreshDownloadedBooks]);

  // Load hadiths when book or page changes
  useEffect(() => {
    if (!isSearchMode) {
      loadHadiths();
    }
  }, [selectedBook, currentPage, isSearchMode]);

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setIsSearchMode(true);
    try {
      const data = await searchHadiths(selectedBook, searchQuery);
      setSearchResults(data.results);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchMode(false);
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
    setIsSearchMode(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const openDetails = (hadith: Hadith) => {
    setSelectedHadith(hadith);
    setDetailsOpen(true);
  };

  const downloadSingleHadith = async (hadith: Hadith) => {
    const book = getBookById(hadith.bookId);
    const fileName = `hadith_${book?.id || 'unknown'}_${hadith.hadithNumber}.txt`;
    const content = `${hadith.text}\n\n${hadith.narrator ? `الراوي: ${hadith.narrator}\n` : ''}المصدر: ${book?.nameAr || ''}\nرقم الحديث: ${hadith.hadithNumber}${hadith.elaboration ? `\n\nالشرح:\n${hadith.elaboration}` : ''}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تنزيل الحديث');
  };

  const currentBookData = getBookById(selectedBook);
  const displayedHadiths = isSearchMode ? searchResults : hadiths;

  return (
    <>
      <Helmet>
        <title>الأحاديث النبوية الشريفة | نور الفرقان</title>
        <meta name="description" content="تصفح الأحاديث النبوية من الكتب التسعة بالتشكيل الكامل" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8 overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center arabic-ui">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
                <Library className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                الأحاديث النبوية الشريفة
              </h1>
              <p className="text-muted-foreground mb-6">
                مستمدة من كتب الحديث التسعة بتشكيل دقيق
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="ابحث بكلمة – راوٍ – نص الحديث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-12 h-12 text-base rounded-xl border-2 border-border focus:border-primary bg-background/80 backdrop-blur-sm text-right"
                    />
                    {searchQuery && (
                      <button 
                        type="button"
                        onClick={clearSearch}
                        className="absolute left-14 top-1/2 -translate-y-1/2"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  <Button type="submit" size="lg" className="h-12 rounded-xl px-6" disabled={isSearching}>
                    {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-6 arabic-ui">
          {/* Filters Bar */}
          <Card className="mb-6 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">اختر الكتاب:</span>
              </div>
              <Select value={selectedBook} onValueChange={selectBook}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hadithBooks.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      <div className="flex items-center gap-2">
                        <span>{book.nameAr}</span>
                        {isDownloaded(book.id) && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {isSearchMode && (
                <Button variant="outline" size="sm" onClick={clearSearch}>
                  <RotateCcw className="w-4 h-4 ml-2" />
                  إلغاء البحث
                </Button>
              )}
              
              <div className="flex-1" />
              
              <Badge variant="secondary" className="gap-1">
                <BookMarked className="w-3 h-3" />
                {storageStats.totalHadiths.toLocaleString('ar-EG')} حديث محفوظ
              </Badge>
            </div>
          </Card>

          {/* Books Grid */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              الكتب التسعة المتوفرة
            </h2>
            <ScrollArea className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {hadithBooks.map((book) => {
                  const bookDownloaded = isDownloaded(book.id);
                  const isDownloading = downloading === book.id;
                  const isSelected = selectedBook === book.id;

                  return (
                    <Card
                      key={book.id}
                      className={`relative p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => selectBook(book.id)}
                    >
                      {bookDownloaded && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                      )}

                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${book.color} flex items-center justify-center mb-3`}>
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      
                      <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-1">{book.nameAr}</h3>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{book.authorAr}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                        <Star className="w-3 h-3 fill-accent text-accent" />
                        <span>{book.totalHadiths.toLocaleString('ar-EG')} حديث</span>
                      </div>

                      {isDownloading ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>{downloadProgress}%</span>
                          </div>
                          <Progress value={downloadProgress} className="h-1.5" />
                        </div>
                      ) : bookDownloaded ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(book.id, e)}
                        >
                          <Trash2 className="w-3 h-3 ml-1" />
                          حذف
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={(e) => handleDownload(book.id, e)}
                          disabled={!!downloading}
                        >
                          <Download className="w-3 h-3 ml-1" />
                          تنزيل للقراءة بدون نت
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </section>

          {/* Random Hadith */}
          <Card className="mb-8 overflow-hidden">
            <div className="bg-gradient-to-br from-accent/10 to-primary/10 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground">حديث عشوائي</h2>
                    <p className="text-xs text-muted-foreground">اكتشف حديثاً جديداً</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={loadRandomHadith} disabled={loadingRandom}>
                  <RefreshCw className={`w-4 h-4 ${loadingRandom ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              {randomHadith ? (
                <div className="space-y-3">
                  <div className="bg-card/50 rounded-xl p-4">
                    <p className="quran-text text-base leading-loose text-foreground">
                      {randomHadith.text}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span>{getBookById(randomHadith.bookId)?.nameAr}</span>
                      {randomHadith.narrator && (
                        <span className="mx-2">|</span>
                      )}
                      {randomHadith.narrator && (
                        <span>{randomHadith.narrator}</span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(randomHadith)}>
                        {copiedId === randomHadith.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare(randomHadith)}>
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetails(randomHadith)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button onClick={loadRandomHadith} disabled={loadingRandom} size="sm">
                    <Sparkles className="w-4 h-4 ml-2" />
                    اظهر حديثاً عشوائياً
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Hadiths List */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-foreground">
                  {isSearchMode ? `نتائج البحث (${searchResults.length})` : currentBookData?.nameAr}
                </h2>
                {!isSearchMode && isDownloaded(selectedBook) && (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-500/30 bg-green-500/10">
                    <WifiOff className="w-3 h-3" />
                    متاح بدون نت
                  </Badge>
                )}
              </div>
              
              {!isSearchMode && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loadingHadiths}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground px-3 min-w-[80px] text-center">
                    {currentPage} / {Math.ceil(totalHadiths / ITEMS_PER_PAGE) || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!hasMore || loadingHadiths}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {loadingHadiths || isSearching ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <Skeleton className="h-5 w-20 mb-3" />
                    <Skeleton className="h-20 w-full" />
                  </Card>
                ))}
              </div>
            ) : displayedHadiths.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="font-semibold text-foreground mb-2">
                  {isSearchMode ? 'لا توجد نتائج' : 'لا توجد أحاديث'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {isSearchMode 
                    ? 'جرب كلمات بحث مختلفة' 
                    : 'قم بتنزيل الكتاب للتصفح بدون انترنت'}
                </p>
                {!isSearchMode && !isDownloaded(selectedBook) && !downloading && (
                  <Button onClick={(e) => handleDownload(selectedBook, e)} size="sm">
                    <Download className="w-4 h-4 ml-2" />
                    تنزيل الكتاب
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-3">
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
          <Card className="mt-8 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                📊 عدد الأحاديث المعروضة: {displayedHadiths.length} 
                {!isSearchMode && totalHadiths > 0 && ` من أصل ${totalHadiths.toLocaleString('ar-EG')}`}
              </div>
              <div className="flex items-center gap-2">
                📁 تم التحميل محليًا: {storageStats.totalHadiths.toLocaleString('ar-EG')} حديث
              </div>
              <div className="flex items-center gap-2">
                💾 الكتب المحفوظة: {storageStats.booksCount} من {hadithBooks.length}
              </div>
            </div>
          </Card>
        </main>

        {/* Details Modal */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-right arabic-ui">تفاصيل الحديث</DialogTitle>
            </DialogHeader>
            
            {selectedHadith && (
              <div className="space-y-4 arabic-ui text-right">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="quran-text text-lg leading-loose">{selectedHadith.text}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">المصدر: </span>
                    <span className="font-medium">{getBookById(selectedHadith.bookId)?.nameAr}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">رقم الحديث: </span>
                    <span className="font-medium">{selectedHadith.hadithNumber}</span>
                  </div>
                  {selectedHadith.narrator && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">الراوي: </span>
                      <span className="font-medium">{selectedHadith.narrator}</span>
                    </div>
                  )}
                </div>
                
                {selectedHadith.elaboration && (
                  <div>
                    <h4 className="font-bold mb-2">الشرح:</h4>
                    <p className="text-muted-foreground leading-relaxed">{selectedHadith.elaboration}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(selectedHadith)}>
                    <Copy className="w-4 h-4 ml-2" />
                    نسخ
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleShare(selectedHadith)}>
                    <Share2 className="w-4 h-4 ml-2" />
                    مشاركة
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadSingleHadith(selectedHadith)}>
                    <FileDown className="w-4 h-4 ml-2" />
                    تنزيل
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

// Hadith Card Component
interface HadithCardProps {
  hadith: Hadith;
  onCopy: (hadith: Hadith) => void;
  onShare: (hadith: Hadith) => void;
  onViewDetails: (hadith: Hadith) => void;
  onDownload: (hadith: Hadith) => void;
  copiedId: number | null;
}

const HadithCard = ({ hadith, onCopy, onShare, onViewDetails, onDownload, copiedId }: HadithCardProps) => {
  const book = getBookById(hadith.bookId);
  
  // Truncate text for preview
  const previewText = hadith.text.length > 300 
    ? hadith.text.substring(0, 300) + '...' 
    : hadith.text;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {book?.nameAr}
          </Badge>
          <span className="text-xs text-muted-foreground">#{hadith.hadithNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDownload(hadith)}>
            <FileDown className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(hadith)}>
            {copiedId === hadith.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onShare(hadith)}>
            <Share2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <p className="quran-text text-base leading-loose mb-3 text-foreground">
        {previewText}
      </p>
      
      <div className="flex items-center justify-between">
        {hadith.narrator && (
          <p className="text-xs text-muted-foreground">
            🔸 الراوي: {hadith.narrator}
          </p>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-auto text-xs"
          onClick={() => onViewDetails(hadith)}
        >
          <Eye className="w-3.5 h-3.5 ml-1" />
          عرض التفاصيل
        </Button>
      </div>
    </Card>
  );
};

export default HadithPage;
