import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Check, 
  Share2, 
  Eye, 
  Image,
  Quote,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Hadith, getBookById } from '@/data/hadithBooks';
import { cn } from '@/lib/utils';

interface HadithFeaturedCardProps {
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

const HadithFeaturedCard = ({
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
}: HadithFeaturedCardProps) => {
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

  const book = hadith ? getBookById(hadith.bookId) : null;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-card via-card to-muted/30 border-2 border-accent/20 shadow-2xl">
      {/* Decorative background elements */}
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-accent/50 rounded-2xl blur-xl" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg">
                <Sparkles className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-xl text-foreground">حديث اليوم</h2>
                <Star className="w-5 h-5 text-accent fill-accent" />
              </div>
              <p className="text-sm text-muted-foreground">اكتشف حديثاً جديداً كل مرة</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            disabled={isLoading} 
            className="gap-2 bg-card/50 backdrop-blur-sm hover:bg-accent/20 hover:text-accent-foreground hover:border-accent/50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">حديث جديد</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative px-6 pb-6">
        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-5 w-48" />
          </div>
        ) : hadith ? (
          <div className="space-y-5">
            {/* Hadith text container */}
            <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-inner">
              {/* Large decorative quotes */}
              <Quote className="absolute top-4 right-4 w-12 h-12 text-accent/20 rotate-180" />
              <Quote className="absolute bottom-4 left-4 w-12 h-12 text-accent/20" />
              
              <p 
                className={cn(
                  "relative z-10 leading-[2.3] text-foreground text-center py-4",
                  getFontClass()
                )}
                style={{ fontSize: `${fontSize + 2}px` }}
              >
                {hadith.text.length > 500 ? hadith.text.substring(0, 500) + '...' : hadith.text}
              </p>
            </div>

            {/* Footer with metadata and actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Badge 
                  className={cn(
                    "text-white border-0 shadow-md py-1.5 px-3",
                    `bg-gradient-to-r ${book?.color}`
                  )}
                >
                  {book?.nameAr}
                </Badge>
                {hadith.narrator && (
                  <span className="text-sm text-muted-foreground max-w-[200px] truncate">
                    الراوي: {hadith.narrator.slice(0, 40)}...
                  </span>
                )}
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 hover:bg-primary/10 hover:text-primary" 
                      onClick={() => onCopy(hadith)}
                    >
                      {copiedId === hadith.id ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>نسخ</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 hover:bg-primary/10 hover:text-primary" 
                      onClick={() => onShare(hadith)}
                    >
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>مشاركة</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 hover:bg-primary/10 hover:text-primary" 
                      onClick={() => onShareAsImage(hadith)}
                    >
                      <Image className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>تحميل كصورة</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 hover:bg-primary/10 hover:text-primary" 
                      onClick={() => onViewDetails(hadith)}
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>التفاصيل</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-accent/50" />
            </div>
            <p className="text-muted-foreground mb-6">اضغط لعرض حديث عشوائي</p>
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

export default HadithFeaturedCard;
