import { BookOpen, Download, Trash2, CheckCircle, Loader2, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HadithBook } from '@/data/hadithBooks';
import { cn } from '@/lib/utils';

interface HadithBookCardProps {
  book: HadithBook;
  isSelected: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onSelect: (bookId: string) => void;
  onDownload: (bookId: string, e: React.MouseEvent) => void;
  onDelete: (bookId: string, e: React.MouseEvent) => void;
}

const HadithBookCard = ({
  book,
  isSelected,
  isDownloaded,
  isDownloading,
  downloadProgress,
  onSelect,
  onDownload,
  onDelete,
}: HadithBookCardProps) => {
  return (
    <Card
      className={cn(
        "group relative p-5 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2",
        isSelected 
          ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20" 
          : "border-transparent hover:border-primary/30 bg-card hover:bg-accent/5"
      )}
      onClick={() => onSelect(book.id)}
    >
      {/* Downloaded indicator */}
      {isDownloaded && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </TooltipTrigger>
          <TooltipContent>متاح بدون إنترنت</TooltipContent>
        </Tooltip>
      )}

      {/* Book icon with gradient */}
      <div 
        className={cn(
          "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-105",
          book.color
        )}
      >
        <BookOpen className="w-8 h-8 text-white" />
      </div>
      
      {/* Book info */}
      <h3 className="font-bold text-lg text-foreground mb-1 line-clamp-1">
        {book.nameAr}
      </h3>
      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
        {book.authorAr}
      </p>
      
      {/* Stats */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Star className="w-4 h-4 fill-accent text-accent" />
        <span className="font-medium">{book.totalHadiths.toLocaleString('ar-EG')}</span>
        <span>حديث</span>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
        {book.description}
      </p>

      {/* Download/Delete button */}
      {isDownloading ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري التنزيل {downloadProgress}%</span>
          </div>
          <Progress value={downloadProgress} className="h-1.5" />
        </div>
      ) : isDownloaded ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-9 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
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
              className="w-full h-9 text-xs gap-2 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
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
    </Card>
  );
};

export default HadithBookCard;
