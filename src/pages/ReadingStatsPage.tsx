import { Book, Clock, Calendar, TrendingUp, Target, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import { useReadingStats } from "@/hooks/useReadingStats";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ReadingStatsPage = () => {
  const { stats, isLoading } = useReadingStats();
  const { user } = useAuth();

  const statCards = [
    {
      icon: Book,
      label: "الصفحات المقروءة",
      value: stats.pagesRead.toString(),
      description: "إجمالي الصفحات",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Clock,
      label: "وقت القراءة",
      value: `${stats.totalReadingTime}`,
      description: "دقيقة",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Calendar,
      label: "أيام القراءة",
      value: stats.sessionsCount.toString(),
      description: "جلسة قراءة",
      color: "bg-green-500/10 text-green-600",
    },
    {
      icon: TrendingUp,
      label: "سلسلة المواظبة",
      value: stats.streakDays.toString(),
      description: "يوم متتالي",
      color: "bg-orange-500/10 text-orange-600",
    },
  ];

  const todayStats = [
    {
      icon: Book,
      label: "صفحات اليوم",
      value: stats.todayPagesRead.toString(),
    },
    {
      icon: Clock,
      label: "وقت القراءة اليوم",
      value: `${stats.totalReadingTime} دقيقة`,
    },
  ];

  // Calculate progress towards goals
  const dailyPageGoal = 5;
  const dailyProgress = Math.min((stats.todayPagesRead / dailyPageGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            إحصائيات القراءة
          </h1>
          <p className="text-muted-foreground">
            تتبع تقدمك في قراءة القرآن الكريم
          </p>
        </div>

        {!user && (
          <Card className="p-6 mb-8 bg-accent/10 border-accent/20">
            <div className="text-center">
              <p className="text-foreground mb-4">
                سجّل الدخول لحفظ إحصائياتك بشكل دائم
              </p>
              <Link to="/auth">
                <Button>تسجيل الدخول</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Today's Progress */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            تقدم اليوم
          </h2>
          
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-muted-foreground">الهدف اليومي: {dailyPageGoal} صفحات</span>
              <span className="font-bold text-foreground">{stats.todayPagesRead} / {dailyPageGoal}</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            {dailyProgress >= 100 && (
              <div className="flex items-center gap-2 mt-3 text-green-600">
                <Award className="w-5 h-5" />
                <span className="font-medium">أحسنت! لقد حققت هدفك اليومي</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {todayStats.map((stat) => (
              <div key={stat.label} className="bg-muted/50 rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Overall Stats */}
        <h2 className="text-xl font-bold text-foreground mb-4">الإحصائيات الكلية</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} className="p-6">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Streak Motivation */}
        {stats.streakDays > 0 && (
          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  سلسلة {stats.streakDays} يوم! 🔥
                </h3>
                <p className="text-muted-foreground">
                  استمر في المواظبة على القراءة اليومية
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link to="/quran">
            <Button size="lg" className="gap-2">
              <Book className="w-5 h-5" />
              ابدأ القراءة الآن
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ReadingStatsPage;
