import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHadith } from '@/hooks/useHadith';
import { usePinnedHadith } from '@/hooks/usePinnedHadith';
import { hadithBooks, getBookById } from '@/data/hadithBooks';
import { 
  BookOpen, 
  RefreshCw, 
  ChevronLeft, 
  Share2, 
  Copy, 
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Pin,
  PinOff,
  Heart,
  Image
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import HadithShareDialog from './HadithShareDialog';

const MAX_TEXT_LENGTH = 200;

const DailyHadithCard = () => {
  const { getRandomHadith, loading } = useHadith();
  const { pinnedHadith, pinHadith, unpinHadith, isPinned, isLoading: isPinnedLoading } = usePinnedHadith();
  const [currentHadith, setCurrentHadith] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (!isPinnedLoading) {
      if (pinnedHadith) {
        setCurrentHadith(pinnedHadith);
        setInitialLoading(false);
      } else {
        loadHadith();
      }
    }
  }, [isPinnedLoading, pinnedHadith]);

  const loadHadith = async () => {
    setInitialLoading(true);
    const hadith = await getRandomHadith();
    setCurrentHadith(hadith);
    setInitialLoading(false);
  };

  const handleRefresh = async () => {
    // If hadith is pinned, ask before refresh
    if (isPinned(currentHadith)) {
      const confirmUnpin = window.confirm("هل تريد إلغاء تثبيت الحديث الحالي وعرض حديث جديد؟");
      if (!confirmUnpin) return;
      await unpinHadith();
    }
    
    setIsRefreshing(true);
    setIsExpanded(false);
    const newHadith = await getRandomHadith();
    if (newHadith) {
      setCurrentHadith(newHadith);
    }
    setIsRefreshing(false);
  };

  const handlePin = async () => {
    if (!currentHadith) return;
    
    if (isPinned(currentHadith)) {
      await unpinHadith();
      toast.success('تم إلغاء تثبيت الحديث');
    } else {
      await pinHadith(currentHadith);
      toast.success('تم تثبيت الحديث لهذا اليوم');
    }
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

  const isLongText = currentHadith?.text?.length > MAX_TEXT_LENGTH;
  const displayText = isLongText && !isExpanded 
    ? currentHadith.text.slice(0, MAX_TEXT_LENGTH) + '...'
    : currentHadith?.text;

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

  const book = currentHadith ? getBookById(currentHadith.bookId) : null;

  return (
    <>
      <Card className="relative overflow-hidden group">
        {/* Pinned indicator */}
        {isPinned(currentHadith) && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-accent/20 to-primary/20 py-1 px-3 flex items-center justify-center gap-2">
            <Pin className="w-3 h-3 text-accent" />
            <span className="text-xs font-medium text-foreground">مُثبَّت لهذا اليوم</span>
          </div>
        )}
        
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
        
        <div className={cn("relative p-6", isPinned(currentHadith) && "pt-10")}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">حديث اليوم</h3>
                <p className="text-sm text-muted-foreground">
                  {book?.nameAr || ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Pin Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePin}
                className={cn("h-9 w-9", isPinned(currentHadith) && "text-accent")}
                title={isPinned(currentHadith) ? "إلغاء التثبيت" : "تثبيت لهذا اليوم"}
              >
                {isPinned(currentHadith) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 w-9"
                title="حديث جديد"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-9 w-9"
                title="نسخ"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className="h-9 w-9"
                title="مشاركة"
              >
                <Share2 className="w-4 h-4" />
              </Button>
              {/* Share as Image Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShareDialogOpen(true)}
                className="h-9 w-9"
                title="مشاركة كصورة"
              >
                <Image className="w-4 h-4" />
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
                <p className={cn(
                  "quran-text text-lg md:text-xl leading-loose pr-6 text-foreground transition-all duration-300",
                  !isExpanded && isLongText && "line-clamp-4"
                )}>
                  {displayText}
                </p>
                <div className="absolute -left-2 bottom-0 text-6xl text-primary/10 font-serif leading-none rotate-180">
                  ❝
                </div>
              </div>

              {/* Read More Button */}
              {isLongText && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="gap-2 text-primary hover:text-primary/80 mx-auto flex"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      إخفاء
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      قراءة المزيد
                    </>
                  )}
                </Button>
              )}

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

      {/* Share as Image Dialog */}
      {currentHadith && (
        <HadithShareDialog
          isOpen={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          hadithText={currentHadith.text}
          bookName={book?.nameAr || ''}
          hadithNumber={currentHadith.hadithNumber || currentHadith.id}
          narrator={currentHadith.narrator}
        />
      )}
    </>
  );
};

export default DailyHadithCard;
