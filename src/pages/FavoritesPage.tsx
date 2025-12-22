import { Heart, Trash2, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";

const FavoritesPage = () => {
  const { user } = useAuth();
  const { favorites, isLoading, removeFavorite } = useFavorites();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        <h1 className="text-3xl font-bold text-foreground text-center mb-8">
          الآيات المفضلة
        </h1>

        {!user ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              سجل دخولك لعرض المفضلة
            </h2>
            <p className="text-muted-foreground mb-6">
              يجب تسجيل الدخول لحفظ وعرض الآيات المفضلة
            </p>
            <Link to="/auth">
              <Button>تسجيل الدخول</Button>
            </Link>
          </div>
        ) : isLoading ? (
          <div className="max-w-2xl mx-auto space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
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
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="bg-card border border-border rounded-xl p-4 group hover:border-primary/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    to={`/surah/${fav.surah_number}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {fav.surah_name} - الآية {fav.ayah_number}
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeFavorite(fav.surah_number, fav.ayah_number)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-lg font-quran text-foreground leading-relaxed text-center">
                  {fav.ayah_text}
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
