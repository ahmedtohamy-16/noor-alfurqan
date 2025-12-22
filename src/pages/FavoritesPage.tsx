import { Heart } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FavoritesPage = () => {
  // Mock favorites - would come from localStorage or backend
  const favorites: { surahNumber: number; surahName: string; ayahNumber: number; text: string }[] = [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        <h1 className="text-3xl font-bold text-foreground text-center mb-8">
          الآيات المفضلة
        </h1>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              لا توجد آيات مفضلة
            </h2>
            <p className="text-muted-foreground mb-6">
              اضغط على أيقونة القلب عند أي آية لإضافتها للمفضلة
            </p>
            <Link to="/">
              <Button>تصفح السور</Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-4">
            {favorites.map((fav, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {fav.surahName} - الآية {fav.ayahNumber}
                  </span>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Heart className="w-4 h-4 fill-destructive text-destructive" />
                  </Button>
                </div>
                <p className="text-lg font-quran text-foreground leading-relaxed">
                  {fav.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
