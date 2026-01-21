import { BookOpen, Copy, Share2, Image, Heart, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hadith, getBookById } from '@/data/hadithBooks';
import { cn } from '@/lib/utils';

interface HadithDetailsModalProps {
  hadith: Hadith | null;
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  fontFamily: string;
  onCopy: (hadith: Hadith) => void;
  onShare: (hadith: Hadith) => void;
  onShareAsImage: (hadith: Hadith) => void;
  onToggleFavorite?: (hadith: Hadith) => void;
  isFavorite?: boolean;
}

const HadithDetailsModal = ({
  hadith,
  isOpen,
  onClose,
  fontSize,
  fontFamily,
  onCopy,
  onShare,
  onShareAsImage,
  onToggleFavorite,
  isFavorite = false,
}: HadithDetailsModalProps) => {
  if (!hadith) return null;
  
  const book = getBookById(hadith.bookId);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 arabic-ui">
        {/* Header with gradient */}
        <div className={cn(
          "p-6 text-white bg-gradient-to-br",
          book?.color || "from-primary to-primary/80"
        )}>
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
                {book?.nameAr}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-8 w-8"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <DialogTitle className="text-xl font-bold text-right text-white">
              الحديث رقم {hadith.hadithNumber}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-right">
          {/* Hadith Text */}
          <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
            <p 
              className={cn(
                "leading-[2.4] text-foreground",
                getFontClass()
              )}
              style={{ fontSize: `${fontSize + 2}px` }}
            >
              {hadith.text}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-4 border shadow-sm">
              <span className="text-xs text-muted-foreground block mb-1.5">المصدر</span>
              <span className="font-bold text-foreground">{book?.nameAr}</span>
            </div>
            <div className="bg-card rounded-xl p-4 border shadow-sm">
              <span className="text-xs text-muted-foreground block mb-1.5">رقم الحديث</span>
              <span className="font-bold text-foreground">{hadith.hadithNumber}</span>
            </div>
            {hadith.narrator && (
              <div className="bg-card rounded-xl p-4 border shadow-sm sm:col-span-2">
                <span className="text-xs text-muted-foreground block mb-1.5">الراوي</span>
                <span className="font-semibold text-foreground">{hadith.narrator}</span>
              </div>
            )}
          </div>

          {/* Elaboration if available */}
          {hadith.elaboration && (
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-lg text-foreground">الشرح</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed text-base">
                {hadith.elaboration}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t">
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              onClick={() => onShareAsImage(hadith)}
            >
              <Image className="w-4 h-4" />
              تحميل كصورة
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => onCopy(hadith)}
            >
              <Copy className="w-4 h-4" />
              نسخ
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => onShare(hadith)}
            >
              <Share2 className="w-4 h-4" />
              مشاركة
            </Button>
            {onToggleFavorite && (
              <Button 
                variant="outline" 
                size="sm" 
                className={cn("gap-2", isFavorite && "text-red-500 border-red-500/30")}
                onClick={() => onToggleFavorite(hadith)}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                {isFavorite ? 'إزالة' : 'إضافة'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HadithDetailsModal;
