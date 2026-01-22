import { BookOpen, Download, Trash2, CheckCircle, Loader2, Star, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HadithBook } from '@/data/hadithBooks';
import { cn } from '@/lib/utils';

interface HadithLibraryCardProps {
  book: HadithBook;
  isSelected: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onSelect: (bookId: string) => void;
  onDownload: (bookId: string, e: React.MouseEvent) => void;
  onDelete: (bookId: string, e: React.MouseEvent) => void;
}

const HadithLibraryCard = ({
  book,
  isSelected,
  isDownloaded,
  isDownloading,
  downloadProgress,
  onSelect,
  onDownload,
  onDelete,
}: HadithLibraryCardProps) => {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden cursor-pointer transition-all duration-500",
        "hover:shadow-2xl hover:-translate-y-2",
        "border-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-xl ring-4 ring-primary/10" 
          : "border-border/40 hover:border-primary/40 bg-card/80 backdrop-blur-sm"
      )}
      onClick={() => onSelect(book.id)}
    >
      {/* Gradient overlay at top */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-24 bg-gradient-to-b opacity-50",
        book.color
      )} />
      
      {/* Downloaded indicator */}
      {isDownloaded && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-4 left-4 z-10 w-8 h-8 rounded-full bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </TooltipTrigger>
          <TooltipContent>متاح بدون إنترنت</TooltipContent>
        </Tooltip>
      )}

      <div className="relative p-6">
        {/* Book icon with gradient */}
        <div 
          className={cn(
            "w-18 h-18 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
            book.color
          )}
          style={{ width: '72px', height: '72px' }}
        >
          <BookOpen className="w-9 h-9 text-white" />
        </div>
        
        {/* Book info */}
        <h3 className="font-bold text-lg text-foreground mb-1.5 line-clamp-1">
          {book.nameAr}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
          {book.authorAr}
        </p>
        
        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-full">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="font-bold text-foreground">{book.totalHadiths.toLocaleString('ar-EG')}</span>
            <span className="text-xs">حديث</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-5 min-h-[2.5rem]">
          {book.description}
        </p>

        {/* Download/Delete button */}
        {isDownloading ? (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري التنزيل {downloadProgress}%</span>
            </div>
            <Progress value={downloadProgress} className="h-2" />
          </div>
        ) : isDownloaded ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-10 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                onClick={(e) => onDelete(book.id, e)}
              >
                <Trash2 className="w-4 h-4" />
                حذف من الجهاز
              </Button>
            </TooltipTrigger>
            <TooltipContent>حذف الكتاب من التخزين المحلي</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 text-xs gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                onClick={(e) => onDownload(book.id, e)}
              >
                <Download className="w-4 h-4" />
                تنزيل للقراءة بدون نت
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              تنزيل الكتاب (~{Math.round((book.totalHadiths * 500) / 1024)} KB)
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </Card>
  );
};

export default HadithLibraryCard;
