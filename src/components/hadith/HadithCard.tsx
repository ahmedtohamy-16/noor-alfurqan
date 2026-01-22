import { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  Heart, 
  Eye, 
  Image, 
  MoreVertical,
  Quote,
  BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Hadith, getBookById } from '@/data/hadithBooks';
import { cn } from '@/lib/utils';

interface HadithCardProps {
  hadith: Hadith;
  fontSize: number;
  fontFamily: string;
  onCopy: (hadith: Hadith) => void;
  onShare: (hadith: Hadith) => void;
  onViewDetails: (hadith: Hadith) => void;
  onShareAsImage: (hadith: Hadith) => void;
  onToggleFavorite?: (hadith: Hadith) => void;
  isFavorite?: boolean;
  copiedId: number | null;
  index?: number;
}

const HadithCard = ({
  hadith,
  fontSize,
  fontFamily,
  onCopy,
  onShare,
  onViewDetails,
  onShareAsImage,
  onToggleFavorite,
  isFavorite = false,
  copiedId,
  index = 0,
}: HadithCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const book = getBookById(hadith.bookId);
  
  const MAX_PREVIEW_LENGTH = 350;
  const shouldTruncate = hadith.text.length > MAX_PREVIEW_LENGTH;
  const displayText = shouldTruncate && !isExpanded 
    ? hadith.text.substring(0, MAX_PREVIEW_LENGTH) + '...' 
    : hadith.text;

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
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-500",
        "bg-card/95 backdrop-blur-sm",
        "border-2 border-border/40 hover:border-primary/30",
        "shadow-lg hover:shadow-2xl hover:shadow-primary/5",
        "hover:-translate-y-1"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Decorative gradient top border */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        book?.color || "from-primary to-primary/60"
      )} />
      
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-0">
        <div className="flex items-center gap-3">
          {/* Book badge with icon */}
          <Badge 
            className={cn(
              "text-white border-0 shadow-md py-1.5 px-3 gap-1.5",
              `bg-gradient-to-r ${book?.color}`
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {book?.nameAr}
          </Badge>
          
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-xs opacity-60">الحديث</span>
            <span className="font-semibold text-sm text-foreground/80">#{hadith.hadithNumber}</span>
          </div>
        </div>
        
        {/* Desktop actions - show on hover */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                onClick={() => onCopy(hadith)}
              >
                {copiedId === hadith.id ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>نسخ الحديث</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                onClick={() => onShare(hadith)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>مشاركة</TooltipContent>
          </Tooltip>

          {onToggleFavorite && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-9 w-9", isFavorite ? "text-rose-500 hover:bg-rose-500/10" : "hover:bg-rose-500/10 hover:text-rose-500")}
                  onClick={() => onToggleFavorite(hadith)}
                >
                  <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}</TooltipContent>
            </Tooltip>
          )}
          
          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-popover">
              <DropdownMenuItem onClick={() => onViewDetails(hadith)} className="gap-3">
                <Eye className="w-4 h-4" />
                عرض التفاصيل الكاملة
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShareAsImage(hadith)} className="gap-3">
                <Image className="w-4 h-4" />
                تحميل كصورة مزخرفة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCopy(hadith)} className="gap-3">
                <Copy className="w-4 h-4" />
                نسخ النص
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hadith text with decorative quote */}
      <div className="relative p-6 pt-5">
        {/* Decorative quote icon */}
        <Quote className="absolute top-4 right-4 w-10 h-10 text-primary/10 rotate-180" />
        
        <p 
          className={cn(
            "leading-[2.3] text-foreground text-right relative z-10",
            getFontClass()
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayText}
        </p>
        
        {shouldTruncate && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1.5 transition-colors"
          >
            {isExpanded ? 'عرض أقل ↑' : 'قراءة المزيد ↓'}
          </button>
        )}
      </div>

      {/* Narrator section - distinct styling */}
      {hadith.narrator && (
        <div className="mx-5 mb-5">
          <div className="bg-gradient-to-l from-muted/80 to-muted/40 rounded-xl p-4 border border-border/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">الراوي</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed pt-1">
                {hadith.narrator}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile footer actions */}
      <div className="flex items-center justify-around px-4 py-4 border-t border-border/30 bg-muted/20 md:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 text-xs h-10"
          onClick={() => onViewDetails(hadith)}
        >
          <Eye className="w-4 h-4" />
          التفاصيل
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 text-xs h-10"
          onClick={() => onShareAsImage(hadith)}
        >
          <Image className="w-4 h-4" />
          صورة
        </Button>
        <div className="w-px h-6 bg-border" />
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 text-xs h-10"
          onClick={() => onCopy(hadith)}
        >
          {copiedId === hadith.id ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
          نسخ
        </Button>
      </div>
    </Card>
  );
};

export default HadithCard;
