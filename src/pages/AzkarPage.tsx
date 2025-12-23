import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sunrise, Sunset, Moon, Sun, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface AzkarCategory {
  id: string;
  name: string;
  icon: string;
  display_order: number;
}

interface Dhikr {
  id: string;
  text: string;
  reference: string | null;
  repeat_count: number;
  display_order: number;
}

interface UserProgress {
  [azkarId: string]: number;
}

const iconMap: { [key: string]: React.ReactNode } = {
  sunrise: <Sunrise className="w-6 h-6" />,
  sunset: <Sunset className="w-6 h-6" />,
  moon: <Moon className="w-6 h-6" />,
  sun: <Sun className="w-6 h-6" />,
};

const AzkarPage = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<AzkarCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory | null>(null);
  const [azkar, setAzkar] = useState<Dhikr[]>([]);
  const [progress, setProgress] = useState<UserProgress>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchAzkar(selectedCategory.id);
      setCurrentIndex(0);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (user && azkar.length > 0) {
      fetchProgress();
    }
  }, [user, azkar]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("azkar_categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAzkar = async (categoryId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("azkar")
        .select("*")
        .eq("category_id", categoryId)
        .order("display_order");

      if (error) throw error;
      setAzkar(data || []);
    } catch (error) {
      console.error("Error fetching azkar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("user_azkar_progress")
        .select("azkar_id, completed_count")
        .eq("user_id", user.id)
        .eq("progress_date", today);

      if (error) throw error;

      const progressMap: UserProgress = {};
      data?.forEach((p) => {
        progressMap[p.azkar_id] = p.completed_count;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const incrementProgress = async (dhikr: Dhikr) => {
    const currentCount = progress[dhikr.id] || 0;
    if (currentCount >= dhikr.repeat_count) return;

    const newCount = currentCount + 1;
    setProgress((prev) => ({ ...prev, [dhikr.id]: newCount }));

    // Vibrate for feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    if (!user) {
      // Save to localStorage for non-authenticated users
      const localProgress = JSON.parse(localStorage.getItem("azkar_progress") || "{}");
      const today = new Date().toISOString().split("T")[0];
      if (!localProgress[today]) localProgress[today] = {};
      localProgress[today][dhikr.id] = newCount;
      localStorage.setItem("azkar_progress", JSON.stringify(localProgress));
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      await supabase
        .from("user_azkar_progress")
        .upsert({
          user_id: user.id,
          azkar_id: dhikr.id,
          completed_count: newCount,
          progress_date: today,
        }, { onConflict: "user_id,azkar_id,progress_date" });
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const getCategoryProgress = (categoryId: string) => {
    const categoryAzkar = azkar.filter((a) => a.id);
    if (categoryAzkar.length === 0) return { completed: 0, total: 0 };

    let completed = 0;
    let total = 0;
    categoryAzkar.forEach((a) => {
      total += a.repeat_count;
      completed += progress[a.id] || 0;
    });

    return { completed, total };
  };

  const currentDhikr = azkar[currentIndex];
  const currentProgress = currentDhikr ? (progress[currentDhikr.id] || 0) : 0;
  const isCurrentCompleted = currentDhikr && currentProgress >= currentDhikr.repeat_count;

  const goToNext = () => {
    if (currentIndex < azkar.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Category List View
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />

        <main className="container mx-auto px-4 py-6 arabic-ui">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">الأذكار والأدعية</h1>
              <p className="text-muted-foreground text-sm">حافظ على ذكرك اليومي</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] group"
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {iconMap[category.icon] || <Sun className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{category.name}</h3>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Dhikr Detail View
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{selectedCategory.name}</h1>
            <p className="text-muted-foreground text-sm">
              {currentIndex + 1} من {azkar.length}
            </p>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : currentDhikr ? (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">التقدم في هذا الذكر</span>
                <span className="font-medium text-primary">
                  {currentProgress}/{currentDhikr.repeat_count}
                </span>
              </div>
              <Progress 
                value={(currentProgress / currentDhikr.repeat_count) * 100} 
                className="h-2"
              />
            </div>

            {/* Dhikr Card */}
            <Card
              className={`p-6 text-center cursor-pointer transition-all min-h-[200px] flex flex-col justify-center ${
                isCurrentCompleted
                  ? "bg-green-500/10 border-green-500/30"
                  : "hover:bg-primary/5"
              }`}
              onClick={() => incrementProgress(currentDhikr)}
            >
              {isCurrentCompleted && (
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <Check className="w-6 h-6" />
                  <span className="font-medium">تم الإكمال</span>
                </div>
              )}

              <p className="text-2xl font-quran leading-loose text-foreground mb-4">
                {currentDhikr.text}
              </p>

              {currentDhikr.reference && (
                <p className="text-sm text-muted-foreground">
                  {currentDhikr.reference}
                </p>
              )}

              {!isCurrentCompleted && (
                <p className="text-primary text-sm mt-4">
                  اضغط للتسبيح • {currentDhikr.repeat_count - currentProgress} متبقي
                </p>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="gap-2"
              >
                السابق
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="flex gap-1">
                {azkar.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentIndex
                        ? "bg-primary"
                        : progress[azkar[i]?.id] >= azkar[i]?.repeat_count
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                onClick={goToNext}
                disabled={currentIndex === azkar.length - 1}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                التالي
              </Button>
            </div>

            {/* Quick Stats */}
            <Card className="p-4 mt-6 bg-muted/50">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {azkar.filter((a) => (progress[a.id] || 0) >= a.repeat_count).length}
                  </p>
                  <p className="text-sm text-muted-foreground">مكتمل</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{azkar.length}</p>
                  <p className="text-sm text-muted-foreground">إجمالي</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {azkar.filter((a) => (progress[a.id] || 0) < a.repeat_count).length}
                  </p>
                  <p className="text-sm text-muted-foreground">متبقي</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            لا توجد أذكار في هذا القسم
          </p>
        )}
      </main>
    </div>
  );
};

export default AzkarPage;
