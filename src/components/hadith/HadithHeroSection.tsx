import { useState } from 'react';
import { Search, Library, X, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HadithHeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  isSearching: boolean;
  searchResultsCount: number;
  isSearchMode: boolean;
}

const HadithHeroSection = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  isSearching,
  searchResultsCount,
  isSearchMode,
}: HadithHeroSectionProps) => {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-accent/5 to-primary/3" />
      
      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-40" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-10 right-[10%] w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-[10%] w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Decorative icon */}
          <div className="relative inline-block mb-8">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Library className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
          
          {/* Title with gradient */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            الأحاديث النبوية الشريفة
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
            مكتبة رقمية شاملة من كتب الحديث التسعة المعتمدة
            <br />
            <span className="text-sm opacity-75">بتشكيل دقيق وجودة عالية للمشاركة</span>
          </p>

          {/* Premium search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-border/50 shadow-2xl overflow-hidden group-focus-within:border-primary/50 transition-colors duration-300">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder="ابحث بكلمة، راوٍ، أو نص الحديث..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pr-14 pl-14 h-16 text-lg rounded-2xl border-0 bg-transparent text-right focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
                
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={onClearSearch}
                    className="absolute left-5 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted/80 transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                
                {isSearching && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Search status */}
            {isSearchMode && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="h-px flex-1 max-w-16 bg-gradient-to-r from-transparent to-border" />
                <p className="text-sm text-muted-foreground">
                  {isSearching ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري البحث...
                    </span>
                  ) : (
                    <span>تم العثور على <strong className="text-foreground">{searchResultsCount}</strong> نتيجة</span>
                  )}
                </p>
                <div className="h-px flex-1 max-w-16 bg-gradient-to-l from-transparent to-border" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HadithHeroSection;
