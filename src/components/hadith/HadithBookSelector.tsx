import { BookOpen, Check, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { HadithBook } from '@/data/hadithBooks';
import { cn } from '@/lib/utils';

interface HadithBookSelectorProps {
  books: HadithBook[];
  selectedBookId: string;
  onSelectBook: (bookId: string) => void;
  isDownloaded: (bookId: string) => boolean;
  isSearchMode: boolean;
  onClearSearch: () => void;
}

const HadithBookSelector = ({
  books,
  selectedBookId,
  onSelectBook,
  isDownloaded,
  isSearchMode,
  onClearSearch,
}: HadithBookSelectorProps) => {
  return (
    <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl border-2 border-border/40 p-4 shadow-lg">
      {/* Label */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-foreground">اختر الكتاب</span>
        </div>
        
        {isSearchMode && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearSearch} 
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            إلغاء البحث
          </Button>
        )}
      </div>
      
      {/* Books horizontal scroll */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {books.map(book => {
            const isSelected = selectedBookId === book.id;
            const downloaded = isDownloaded(book.id);
            
            return (
              <Button
                key={book.id}
                variant="outline"
                size="sm"
                className={cn(
                  "shrink-0 h-11 px-4 gap-2 rounded-xl transition-all duration-300",
                  "border-2",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                )}
                onClick={() => onSelectBook(book.id)}
              >
                {/* Book name */}
                <span className={cn(
                  "font-medium",
                  isSelected ? "text-primary-foreground" : "text-foreground"
                )}>
                  {book.nameAr}
                </span>
                
                {/* Status indicators */}
                {downloaded && (
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    isSelected ? "bg-primary-foreground" : "bg-emerald-500"
                  )} />
                )}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default HadithBookSelector;
