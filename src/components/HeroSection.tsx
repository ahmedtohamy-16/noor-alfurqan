import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 md:py-24">
      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-30" />
      
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center arabic-ui">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 animate-fade-in font-quran">
            نور القرآن
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-slide-up font-arabic">
            اقرأ القرآن الكريم بتدبر وخشوع، واستمع إلى تلاوات مباركة
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحث في القرآن الكريم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-14 text-lg rounded-xl border-2 border-border focus:border-primary bg-background/80 backdrop-blur-sm font-arabic text-right"
                />
              </div>
              <Button type="submit" size="xl" className="h-14 rounded-xl">
                بحث
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 mt-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary font-arabic">١١٤</p>
              <p className="text-sm text-muted-foreground">سورة</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary font-arabic">٦٢٣٦</p>
              <p className="text-sm text-muted-foreground">آية</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-primary font-arabic">٣٠</p>
              <p className="text-sm text-muted-foreground">جزء</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
