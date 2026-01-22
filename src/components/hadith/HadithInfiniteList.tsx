import { useEffect, useRef, useCallback, useState } from 'react';
import { Loader2, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Hadith } from '@/data/hadithBooks';
import HadithCard from './HadithCard';
import { cn } from '@/lib/utils';

interface HadithInfiniteListProps {
  hadiths: Hadith[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  fontSize: number;
  fontFamily: string;
  onCopy: (hadith: Hadith) => void;
  onShare: (hadith: Hadith) => void;
  onViewDetails: (hadith: Hadith) => void;
  onShareAsImage: (hadith: Hadith) => void;
  onToggleFavorite?: (hadith: Hadith) => void;
  isFavorite?: (hadithId: number) => boolean;
  copiedId: number | null;
  emptyMessage?: string;
  emptySubMessage?: string;
  showDownloadButton?: boolean;
  onDownload?: () => void;
}

const HadithInfiniteList = ({
  hadiths,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  fontSize,
  fontFamily,
  onCopy,
  onShare,
  onViewDetails,
  onShareAsImage,
  onToggleFavorite,
  isFavorite,
  copiedId,
  emptyMessage = 'لا توجد أحاديث',
  emptySubMessage = 'جرب كلمات بحث مختلفة أو اختر كتاباً آخر',
  showDownloadButton = false,
  onDownload,
}: HadithInfiniteListProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observerRef.current = observer;
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, isLoading, onLoadMore]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 bg-card/80 border-2 border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-32 w-full rounded-xl mb-4" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-24 rounded-lg" />
              <Skeleton className="h-4 w-40" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (hadiths.length === 0) {
    return (
      <Card className="p-16 text-center border-2 border-dashed border-border/50 bg-card/50">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/50 flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h3 className="font-bold text-xl text-foreground mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{emptySubMessage}</p>
        {showDownloadButton && onDownload && (
          <Button onClick={onDownload} size="lg" className="gap-2">
            تنزيل الكتاب
          </Button>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hadiths list */}
      {hadiths.map((hadith, index) => (
        <HadithCard
          key={`${hadith.bookId}-${hadith.id}-${index}`}
          hadith={hadith}
          fontSize={fontSize}
          fontFamily={fontFamily}
          onCopy={onCopy}
          onShare={onShare}
          onViewDetails={onViewDetails}
          onShareAsImage={onShareAsImage}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite?.(hadith.id)}
          copiedId={copiedId}
          index={index}
        />
      ))}

      {/* Load more trigger / loading indicator */}
      <div ref={loadMoreRef} className="py-8">
        {isLoadingMore && (
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm">جاري تحميل المزيد...</span>
          </div>
        )}
        
        {!hasMore && hadiths.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 px-6 py-3 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              تم عرض جميع الأحاديث
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HadithInfiniteList;
