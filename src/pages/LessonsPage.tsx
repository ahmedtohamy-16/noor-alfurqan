import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  GraduationCap, 
  Play, 
  Clock,
  ArrowRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPublishedLessons, getLessonsByCategory, incrementViewCount, Lesson } from "@/services/lessonService";
import { useAuth } from "@/hooks/useAuth";

const LessonsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    loadLessons();
  }, [selectedCategory]);

  const loadLessons = async () => {
    try {
      setIsLoading(true);
      const fetchedLessons = selectedCategory === "all"
        ? await getPublishedLessons()
        : await getLessonsByCategory(selectedCategory);
      setLessons(fetchedLessons);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLesson = async (lesson: Lesson) => {
    if (lesson.id) {
      await incrementViewCount(lesson.id);
    }
    // Navigate to lesson detail page
    navigate(`/lessons/${lesson.id}`);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      tajweed: "التجويد",
      tafsir: "التفسير",
      memorization: "الحفظ",
      general: "عام",
    };
    return labels[category] || category;
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "مبتدئ",
      intermediate: "متوسط",
      advanced: "متقدم",
    };
    return labels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: "bg-green-500/10 text-green-600",
      intermediate: "bg-yellow-500/10 text-yellow-600",
      advanced: "bg-red-500/10 text-red-600",
    };
    return colors[level] || "";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">الدروس التعليمية</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6 arabic-ui">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="tajweed">التجويد</TabsTrigger>
            <TabsTrigger value="tafsir">التفسير</TabsTrigger>
            <TabsTrigger value="memorization">الحفظ</TabsTrigger>
            <TabsTrigger value="general">عام</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lessons Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 h-40 bg-muted" />
              </Card>
            ))}
          </div>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد دروس</h3>
              <p className="text-muted-foreground">
                لم يتم إضافة دروس في هذا التصنيف بعد
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lessons.map((lesson) => (
              <Card 
                key={lesson.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleViewLesson(lesson)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                      <Badge variant="outline" className={getLevelColor(lesson.level)}>
                        {getLevelLabel(lesson.level)}
                      </Badge>
                    </div>
                    <Badge>{getCategoryLabel(lesson.category)}</Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-right mb-2">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-muted-foreground text-right line-clamp-2 mb-4">
                    {lesson.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Play className="w-4 h-4" />
                      ابدأ الدرس
                    </Button>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        {lesson.teacherName}
                      </span>
                      <span className="flex items-center gap-1">
                        {lesson.viewCount} مشاهدة
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LessonsPage;
