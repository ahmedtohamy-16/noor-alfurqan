import { useState } from 'react';
import { Copy, Check, Share2, Heart, Eye, Image, MoreHorizontal } from 'lucide-react';
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

interface HadithItemCardProps {
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
}

const HadithItemCard = ({
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
}: HadithItemCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const book = getBookById(hadith.bookId);
  
  // Maximum characters for preview
  const MAX_PREVIEW_LENGTH = 300;
  const shouldTruncate = hadith.text.length > MAX_PREVIEW_LENGTH;
  const displayText = shouldTruncate && !isExpanded 
    ? hadith.text.substring(0, MAX_PREVIEW_LENGTH) + '...' 
    : hadith.text;

  // Get font class based on fontFamily
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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30 border-2 border-transparent bg-card">
      {/* Header with book badge and actions */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-3">
          <Badge 
            className={cn(
              "text-white border-0 shadow-md",
              `bg-gradient-to-r ${book?.color}`
            )}
          >
            {book?.nameAr}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            رقم {hadith.hadithNumber}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Quick actions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onCopy(hadith)}
              >
                {copiedId === hadith.id ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>نسخ</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
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
                  className={cn("h-8 w-8", isFavorite && "text-red-500")}
                  onClick={() => onToggleFavorite(hadith)}
                >
                  <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}</TooltipContent>
            </Tooltip>
          )}
          
          {/* More options dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem onClick={() => onViewDetails(hadith)}>
                <Eye className="w-4 h-4 ml-2" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onShareAsImage(hadith)}>
                <Image className="w-4 h-4 ml-2" />
                تحميل كصورة
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCopy(hadith)}>
                <Copy className="w-4 h-4 ml-2" />
                نسخ النص
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hadith text */}
      <div className="p-5 pt-4">
        <p 
          className={cn(
            "leading-[2.2] text-foreground text-right",
            getFontClass()
          )}
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayText}
        </p>
        
        {shouldTruncate && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-primary hover:underline font-medium"
          >
            {isExpanded ? 'عرض أقل' : 'قراءة المزيد'}
          </button>
        )}
      </div>

      {/* Narrator section */}
      {hadith.narrator && (
        <div className="px-5 pb-4">
          <div className="bg-muted/50 rounded-xl p-3 border border-border/50">
            <span className="text-xs text-muted-foreground font-medium">الراوي: </span>
            <span className="text-sm text-foreground">{hadith.narrator}</span>
          </div>
        </div>
      )}

      {/* Footer with always-visible actions on mobile */}
      <div className="flex items-center justify-between px-5 pb-4 border-t pt-4 mt-2 border-border/30 md:hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-xs"
          onClick={() => onViewDetails(hadith)}
        >
          <Eye className="w-4 h-4" />
          التفاصيل
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-xs"
          onClick={() => onShareAsImage(hadith)}
        >
          <Image className="w-4 h-4" />
          صورة
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-xs"
          onClick={() => onCopy(hadith)}
        >
          {copiedId === hadith.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          نسخ
        </Button>
      </div>
    </Card>
  );
};

export default HadithItemCard;
