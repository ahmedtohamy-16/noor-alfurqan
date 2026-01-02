import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHadith } from '@/hooks/useHadith';
import { hadithBooks, getBookById } from '@/data/hadithBooks';
import { 
  BookOpen, 
  RefreshCw, 
  ChevronLeft, 
  Share2, 
  Copy, 
  Check,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const DailyHadithCard = () => {
  const { getRandomHadith, loading } = useHadith();
  const [currentHadith, setCurrentHadith] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadHadith();
  }, []);

  const loadHadith = async () => {
    setInitialLoading(true);
    const hadith = await getRandomHadith();
    setCurrentHadith(hadith);
    setInitialLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const newHadith = await getRandomHadith();
    if (newHadith) {
      setCurrentHadith(newHadith);
    }
    setIsRefreshing(false);
  };

  const handleCopy = async () => {
    if (!currentHadith) return;
    
    const book = getBookById(currentHadith.bookId);
    const text = `${currentHadith.text}\n\n— ${book?.nameAr || ''}`;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('تم نسخ الحديث');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('فشل في النسخ');
    }
  };

  const handleShare = async () => {
    if (!currentHadith) return;
    
    const book = getBookById(currentHadith.bookId);
    const text = `${currentHadith.text}\n\n— ${book?.nameAr || ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'حديث اليوم',
          text: text
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  if (initialLoading && !currentHadith) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden group">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">حديث اليوم</h3>
              <p className="text-sm text-muted-foreground">
                {currentHadith ? getBookById(currentHadith.bookId)?.nameAr : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 w-9"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-9 w-9"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-9 w-9"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Hadith Text */}
        {currentHadith && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute -right-2 top-0 text-6xl text-primary/10 font-serif leading-none">
                ❝
              </div>
              <p className="quran-text text-lg md:text-xl leading-loose pr-6 text-foreground">
                {currentHadith.text}
              </p>
              <div className="absolute -left-2 bottom-0 text-6xl text-primary/10 font-serif leading-none rotate-180">
                ❝
              </div>
            </div>

            {/* Narrator */}
            {currentHadith.narrator && (
              <p className="text-sm text-muted-foreground text-right">
                الراوي: {currentHadith.narrator}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            {currentHadith && `رقم الحديث: ${currentHadith.hadithNumber || currentHadith.id}`}
          </p>
          <Link to="/hadith">
            <Button variant="ghost" size="sm" className="gap-2 group-hover:bg-primary/10">
              تصفح المزيد
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default DailyHadithCard;
