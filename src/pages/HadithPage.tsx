import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHadith } from '@/hooks/useHadith';
import { useHadithOffline } from '@/hooks/useHadithOffline';
import { hadithBooks, Hadith } from '@/data/hadithBooks';
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
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

const HadithPage = () => {
  const { searchHadiths, getRandomHadith } = useHadith();
  const { 
    downloading, 
    downloadProgress, 
    downloadBook, 
    getHadiths,
    deleteBook,
    isDownloaded 
  } = useHadithOffline();
  
  const [selectedBook, setSelectedBook] = useState(hadithBooks[0].id);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [randomHadith, setRandomHadith] = useState<Hadith | null>(null);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [loadingHadiths, setLoadingHadiths] = useState(false);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    loadHadiths();
  }, [selectedBook, currentPage]);

  const loadHadiths = async () => {
    setLoadingHadiths(true);
    try {
      const data = await getHadiths(selectedBook, currentPage, ITEMS_PER_PAGE);
      setHadiths(data);
    } catch (error) {
      console.error('Error loading hadiths:', error);
      setHadiths([]);
    } finally {
      setLoadingHadiths(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchHadiths(searchQuery, selectedBook);
      setSearchResults(results?.results || []);
    } catch {
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleCopy = async (hadith: Hadith) => {
    const bookName = hadithBooks.find(b => b.id === (hadith.book || selectedBook))?.nameAr || '';
    const text = `${hadith.hadith_arabic}\n\n— ${bookName}`;
    
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
    const bookName = hadithBooks.find(b => b.id === (hadith.book || selectedBook))?.nameAr || '';
    const text = `${hadith.hadith_arabic}\n\n— ${bookName}`;
    
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
    await downloadBook(bookId);
  };

  const handleDelete = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteBook(bookId);
  };

  const selectBook = (bookId: string) => {
    setSelectedBook(bookId);
    setCurrentPage(1);
    setSearchResults([]);
    setSearchQuery('');
  };

  return (
    <>
      <Helmet>
        <title>الأحاديث النبوية الشريفة | نور الفرقان</title>
        <meta name="description" content="تصفح الأحاديث النبوية من الكتب الستة وغيرها" />
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-10 overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center arabic-ui">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
                <Library className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                الأحاديث النبوية الشريفة
              </h1>
              <p className="text-muted-foreground mb-6">
                تصفح وابحث في {hadithBooks.length} كتب من الأحاديث النبوية
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl mx-auto">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="ابحث في الأحاديث..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-12 h-12 text-base rounded-xl border-2 border-border focus:border-primary bg-background/80 backdrop-blur-sm text-right"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 rounded-xl px-6" disabled={isSearching}>
                    {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'بحث'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-6 arabic-ui">
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
                      {randomHadith.hadith_arabic}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {hadithBooks.find(b => b.id === randomHadith.book)?.nameAr} - رقم {randomHadith.hadith_id || randomHadith.id}
                    </p>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(randomHadith)}>
                        {copiedId === randomHadith.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleShare(randomHadith)}>
                        <Share2 className="w-4 h-4" />
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

          {/* Books Grid */}
          <section className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">الكتب المتوفرة ({hadithBooks.length})</h2>
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
                            <span>جاري التنزيل</span>
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
                          تنزيل
                        </Button>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </section>

          {/* Hadiths List */}
          <section>
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="w-full justify-start mb-4">
                <TabsTrigger value="browse" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  تصفح الأحاديث
                </TabsTrigger>
                {searchResults.length > 0 && (
                  <TabsTrigger value="search" className="gap-2">
                    <Search className="w-4 h-4" />
                    نتائج البحث ({searchResults.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="browse">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">
                      {hadithBooks.find(b => b.id === selectedBook)?.nameAr}
                    </h2>
                    {isDownloaded(selectedBook) && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">
                        <WifiOff className="w-3 h-3" />
                        متاح بدون نت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={hadiths.length < ITEMS_PER_PAGE}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {loadingHadiths ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-5 w-20 mb-3" />
                        <Skeleton className="h-16 w-full" />
                      </Card>
                    ))}
                  </div>
                ) : hadiths.length === 0 ? (
                  <Card className="p-8 text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">لا توجد أحاديث</h3>
                    <p className="text-sm text-muted-foreground mb-4">قم بتنزيل الكتاب للتصفح بدون انترنت</p>
                    {!isDownloaded(selectedBook) && !downloading && (
                      <Button onClick={(e) => handleDownload(selectedBook, e)} size="sm">
                        <Download className="w-4 h-4 ml-2" />
                        تنزيل الكتاب
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {hadiths.map((hadith, index) => (
                      <HadithCard
                        key={`${hadith.id}-${index}`}
                        hadith={hadith}
                        bookId={selectedBook}
                        onCopy={handleCopy}
                        onShare={handleShare}
                        copiedId={copiedId}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="search">
                <div className="space-y-3">
                  {searchResults.map((hadith, index) => (
                    <HadithCard
                      key={`search-${hadith.id}-${index}`}
                      hadith={hadith}
                      bookId={hadith.book || selectedBook}
                      onCopy={handleCopy}
                      onShare={handleShare}
                      copiedId={copiedId}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </div>
    </>
  );
};

// Hadith Card Component
interface HadithCardProps {
  hadith: Hadith;
  bookId: string;
  onCopy: (hadith: Hadith) => void;
  onShare: (hadith: Hadith) => void;
  copiedId: number | null;
}

const HadithCard = ({ hadith, bookId, onCopy, onShare, copiedId }: HadithCardProps) => {
  const book = hadithBooks.find(b => b.id === (hadith.book || bookId));
  
  return (
    <Card className="group hover:shadow-md transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${book?.color || 'from-primary to-primary/80'} flex items-center justify-center`}>
              <span className="text-white font-bold text-xs">
                {hadith.hadith_id || hadith.id}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{book?.nameAr}</p>
              {hadith.chapter_arabic && (
                <p className="text-xs text-muted-foreground line-clamp-1">{hadith.chapter_arabic}</p>
              )}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(hadith)}>
              {copiedId === hadith.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onShare(hadith)}>
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="quran-text text-base leading-loose text-foreground">
            {hadith.hadith_arabic}
          </p>
          
          {hadith.hadith_english && (
            <p className="text-sm text-muted-foreground leading-relaxed text-left" dir="ltr">
              {hadith.hadith_english}
            </p>
          )}

          {hadith.narrator_arabic && (
            <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
              الراوي: {hadith.narrator_arabic}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default HadithPage;
