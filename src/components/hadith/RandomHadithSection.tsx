import { Sparkles, RefreshCw, Copy, Check, Share2, Eye, Image } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Hadith, getBookById } from '@/data/hadithBooks';
import { cn } from '@/lib/utils';

interface RandomHadithSectionProps {
  hadith: Hadith | null;
  isLoading: boolean;
  copiedId: number | null;
  fontSize: number;
  fontFamily: string;
  onRefresh: () => void;
  onCopy: (hadith: Hadith) => void;
  onShare: (hadith: Hadith) => void;
  onViewDetails: (hadith: Hadith) => void;
  onShareAsImage: (hadith: Hadith) => void;
}

const RandomHadithSection = ({
  hadith,
  isLoading,
  copiedId,
  fontSize,
  fontFamily,
  onRefresh,
  onCopy,
  onShare,
  onViewDetails,
  onShareAsImage,
}: RandomHadithSectionProps) => {
  const getFontClass = () => {
    switch (fontFamily) {
      case 'Scheherazade':
        return "font-['Scheherazade_New',_serif]";
      case 'Noto Naskh':
        return "font-['Noto_Naskh_Arabic',_serif]";
      case 'Uthmani':
        return "font-['KFGQPC_Uthmanic_Script_HAFS',_serif]";
      default:
        return "font-['Amiri',_serif]";
    }
  };

  return (
    <Card className="overflow-hidden shadow-xl border-2 border-accent/20">
      {/* Header with gradient */}
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-accent/10 p-6 border-b border-accent/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-foreground">حديث عشوائي</h2>
              <p className="text-sm text-muted-foreground">اكتشف حديثاً جديداً كل مرة</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isLoading} 
            className="gap-2 hover:bg-accent/20 hover:text-accent-foreground"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            حديث جديد
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : hadith ? (
          <div className="space-y-5">
            {/* Hadith text with decorative styling */}
            <div className="relative bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 shadow-inner border">
              {/* Decorative quote marks */}
              <div className="absolute top-3 right-4 text-6xl text-accent/20 font-serif leading-none">
                "
              </div>
              <p 
                className={cn(
                  "leading-[2.2] text-foreground pt-6",
                  getFontClass()
                )}
                style={{ fontSize: `${fontSize}px` }}
              >
                {hadith.text}
              </p>
              <div className="absolute bottom-3 left-4 text-6xl text-accent/20 font-serif leading-none rotate-180">
                "
              </div>
            </div>

            {/* Footer with metadata and actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-white border-0",
                    `bg-gradient-to-r ${getBookById(hadith.bookId)?.color}`
                  )}
                >
                  {getBookById(hadith.bookId)?.nameAr}
                </Badge>
                {hadith.narrator && (
                  <span className="text-sm text-muted-foreground">
                    الراوي: {hadith.narrator.slice(0, 50)}{hadith.narrator.length > 50 ? '...' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onCopy(hadith)}>
                      {copiedId === hadith.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>نسخ</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onShare(hadith)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>مشاركة</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onShareAsImage(hadith)}>
                      <Image className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>تحميل كصورة</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => onViewDetails(hadith)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>التفاصيل</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-accent/40 mb-4" />
            <p className="text-muted-foreground mb-4">اضغط لعرض حديث عشوائي</p>
            <Button onClick={onRefresh} disabled={isLoading} size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              اظهر حديثاً
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RandomHadithSection;
