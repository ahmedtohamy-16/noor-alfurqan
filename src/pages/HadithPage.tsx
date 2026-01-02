import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
  const navigate = useNavigate();
  const { searchHadiths, getRandomHadith, loading } = useHadith();
  const { 
    downloading, 
    downloadProgress, 
    downloadedBooks, 
    checkDownloadedBooks, 
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
    checkDownloadedBooks();
  }, [checkDownloadedBooks]);

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
    } finally {
      setLoadingHadiths(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchHadiths(searchQuery, selectedBook);
    setSearchResults(results?.results || []);
    setIsSearching(false);
  };

  const handleCopy = async (hadith: Hadith) => {
    const text = `${hadith.hadith_arabic}\n\n— ${getBookName(hadith.book || selectedBook)}`;
    
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
    const text = `${hadith.hadith_arabic}\n\n— ${getBookName(hadith.book || selectedBook)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'حديث نبوي',
          text: text
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy(hadith);
    }
  };

  const loadRandomHadith = async () => {
    setLoadingRandom(true);
    const hadith = await getRandomHadith();
    setRandomHadith(hadith);
    setLoadingRandom(false);
  };

  const getBookName = (bookId: string) => {
    const book = hadithBooks.find(b => b.id === bookId);
    return book?.nameAr || bookId;
  };

  const handleDownload = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await downloadBook(bookId);
  };

  const handleDelete = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteBook(bookId);
  };

  return (
    <>
      <Helmet>
        <title>الأحاديث النبوية الشريفة | نور الفرقان</title>
        <meta name="description" content="تصفح الأحاديث النبوية الشريفة من الكتب الستة: صحيح البخاري، صحيح مسلم، سنن أبي داود، جامع الترمذي، وسنن ابن ماجه" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12 overflow-hidden">
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center arabic-ui">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl">
                <Library className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                الأحاديث النبوية الشريفة
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                تصفح وابحث في الكتب الستة من الأحاديث النبوية الصحيحة
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
                      className="pr-12 h-14 text-lg rounded-xl border-2 border-border focus:border-primary bg-background/80 backdrop-blur-sm text-right"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-14 rounded-xl px-8" disabled={isSearching}>
                    {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'بحث'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 py-8 arabic-ui">
          {/* Random Hadith Section */}
          <section className="mb-12">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">حديث عشوائي</h2>
                      <p className="text-sm text-muted-foreground">اكتشف حديثاً جديداً</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={loadRandomHadith}
                    disabled={loadingRandom}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingRandom ? 'animate-spin' : ''}`} />
                    حديث آخر
                  </Button>
                </div>

                {randomHadith ? (
                  <div className="space-y-4">
                    <div className="relative bg-card/50 rounded-xl p-6">
                      <p className="quran-text text-lg leading-loose text-foreground">
                        {randomHadith.hadith_arabic}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {getBookName(randomHadith.book)} - رقم {randomHadith.hadith_id || randomHadith.id}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(randomHadith)}
                        >
                          {copiedId === randomHadith.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(randomHadith)}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Button onClick={loadRandomHadith} disabled={loadingRandom} className="gap-2">
                      <Sparkles className="w-5 h-5" />
                      اظهر حديثاً عشوائياً
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* Books Grid */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">الكتب المتوفرة</h2>
              {downloadedBooks.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <WifiOff className="w-4 h-4" />
                  <span>{downloadedBooks.length} كتب متاحة بدون انترنت</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {hadithBooks.map((book) => {
                const bookDownloaded = isDownloaded(book.id);
                const isDownloading = downloading === book.id;

                return (
                  <Card
                    key={book.id}
                    className={`relative p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                      selectedBook === book.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedBook(book.id);
                      setCurrentPage(1);
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                  >
                    {/* Download Status Badge */}
                    {bookDownloaded && (
                      <div className="absolute top-2 left-2 bg-green-500/10 text-green-600 rounded-full p-1">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${book.color} flex items-center justify-center mb-4`}>
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{book.nameAr}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{book.authorAr}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Star className="w-3 h-3 fill-accent text-accent" />
                      <span>{book.totalHadiths.toLocaleString('ar-EG')} حديث</span>
                    </div>

                    {/* Download/Delete Button */}
                    {isDownloading ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>جاري التنزيل...</span>
                        </div>
                        <Progress value={downloadProgress} className="h-2" />
                        <span className="text-xs text-muted-foreground">{downloadProgress}%</span>
                      </div>
                    ) : bookDownloaded ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(book.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف من التنزيلات
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={(e) => handleDownload(book.id, e)}
                        disabled={!!downloading}
                      >
                        <Download className="w-4 h-4" />
                        تنزيل للقراءة بدون نت
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Search Results or Hadiths List */}
          <section>
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="w-full justify-start mb-6">
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">
                      {getBookName(selectedBook)}
                    </h2>
                    {isDownloaded(selectedBook) && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                        <WifiOff className="w-3 h-3" />
                        متاح بدون نت
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground px-3">
                      صفحة {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage(p => p + 1)}
                      disabled={hadiths.length < ITEMS_PER_PAGE}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {loadingHadiths ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Card key={i} className="p-6">
                        <Skeleton className="h-6 w-24 mb-4" />
                        <Skeleton className="h-24 w-full" />
                      </Card>
                    ))}
                  </div>
                ) : hadiths.length === 0 ? (
                  <Card className="p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد أحاديث</h3>
                    <p className="text-muted-foreground mb-4">
                      قم بتنزيل الكتاب لتصفحه بدون انترنت
                    </p>
                    {!isDownloaded(selectedBook) && !downloading && (
                      <Button 
                        onClick={(e) => handleDownload(selectedBook, e)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        تنزيل {getBookName(selectedBook)}
                      </Button>
                    )}
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {hadiths.map((hadith, index) => (
                      <HadithCard
                        key={hadith.id || index}
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
                <div className="space-y-4">
                  {searchResults.map((hadith, index) => (
                    <HadithCard
                      key={hadith.id || index}
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
    <Card className="group hover:shadow-lg transition-all">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${book?.color || 'from-primary to-primary/80'} flex items-center justify-center`}>
              <span className="text-white font-bold text-sm">
                {hadith.hadith_id || hadith.id}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{book?.nameAr}</p>
              {hadith.chapter_arabic && (
                <p className="text-xs text-muted-foreground">{hadith.chapter_arabic}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopy(hadith)}
              className="h-8 w-8"
            >
              {copiedId === hadith.id ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onShare(hadith)}
              className="h-8 w-8"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hadith Text */}
        <div className="space-y-3">
          <p className="quran-text text-lg leading-loose text-foreground">
            {hadith.hadith_arabic}
          </p>
          
          {hadith.hadith_english && (
            <p className="text-sm text-muted-foreground leading-relaxed text-left" dir="ltr">
              {hadith.hadith_english}
            </p>
          )}

          {hadith.narrator_arabic && (
            <p className="text-sm text-muted-foreground pt-2 border-t border-border/50">
              الراوي: {hadith.narrator_arabic}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default HadithPage;
