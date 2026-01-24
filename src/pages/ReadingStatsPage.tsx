import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Book, Clock, Calendar, TrendingUp, Target, Award, 
  ArrowRight, BarChart3, RefreshCw, Repeat
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import StatsPeriodFilter from "@/components/stats/StatsPeriodFilter";
import StatsComparisonCard from "@/components/stats/StatsComparisonCard";
import TasbihStatsChart from "@/components/stats/TasbihStatsChart";
import { useAdvancedStats, TimePeriod } from "@/hooks/useAdvancedStats";
import { useAuth } from "@/hooks/useAuth";
import BottomNavigation from "@/components/BottomNavigation";

const ReadingStatsPage = () => {
  const [period, setPeriod] = useState<TimePeriod>("30days");
  const { stats, isLoading, refetch } = useAdvancedStats(period);
  const { user } = useAuth();

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => {
      if (digit === "-") return "-";
      return arabicNumbers[parseInt(digit)] || digit;
    }).join("");
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${convertToArabicNumber(minutes)} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${convertToArabicNumber(hours)} ساعة ${mins > 0 ? `و ${convertToArabicNumber(mins)} دقيقة` : ""}`;
  };

  // Calculate progress towards daily goal
  const dailyPageGoal = 5;
  const dailyProgress = Math.min((stats.todayPagesRead / dailyPageGoal) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                إحصائيات متقدمة
              </h1>
              <p className="text-sm text-muted-foreground">تتبع تقدمك في العبادات</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Period Filter */}
        <div className="mb-6">
          <StatsPeriodFilter activePeriod={period} onPeriodChange={setPeriod} />
        </div>

        {!user && (
          <Card className="p-4 mb-6 bg-accent/10 border-accent/20">
            <div className="text-center">
              <p className="text-foreground mb-3 text-sm">
                سجّل الدخول لحفظ إحصائياتك ومزامنتها
              </p>
              <Link to="/auth">
                <Button size="sm">تسجيل الدخول</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Today's Progress Card */}
        <Card className="p-5 mb-6 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">تقدم اليوم</h2>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-muted-foreground">
                الهدف اليومي: {convertToArabicNumber(dailyPageGoal)} صفحات
              </span>
              <span className="font-bold text-foreground">
                {convertToArabicNumber(stats.todayPagesRead)} / {convertToArabicNumber(dailyPageGoal)}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            {dailyProgress >= 100 && (
              <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
                <Award className="w-4 h-4" />
                <span className="font-medium">أحسنت! لقد حققت هدفك اليومي 🎉</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-background/60 rounded-xl p-3 text-center">
              <Book className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">
                {convertToArabicNumber(stats.todayPagesRead)}
              </p>
              <p className="text-xs text-muted-foreground">صفحات اليوم</p>
            </div>
            <div className="bg-background/60 rounded-xl p-3 text-center">
              <Repeat className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">
                {convertToArabicNumber(stats.todayTasbih)}
              </p>
              <p className="text-xs text-muted-foreground">تسبيحات اليوم</p>
            </div>
          </div>
        </Card>

        {/* Comparison Cards */}
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          المقارنة والتحليل
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatsComparisonCard
            title="الصفحات المقروءة"
            currentValue={stats.totalPagesRead}
            previousValue={stats.previousPeriodPagesRead}
            changePercent={stats.pagesChangePercent}
            unit="صفحة"
            period={period}
            icon={<Book className="w-5 h-5 text-white" />}
            color="bg-primary"
          />
          
          <StatsComparisonCard
            title="التسبيحات"
            currentValue={stats.totalTasbih}
            previousValue={stats.previousPeriodTasbih}
            changePercent={stats.tasbihChangePercent}
            unit="تسبيحة"
            period={period}
            icon={<Repeat className="w-5 h-5 text-white" />}
            color="bg-accent"
          />
          
          <StatsComparisonCard
            title="الورد اليومي"
            currentValue={stats.completedWirdDays}
            previousValue={stats.previousPeriodWirdDays}
            changePercent={stats.wirdChangePercent}
            unit="يوم مكتمل"
            period={period}
            icon={<Calendar className="w-5 h-5 text-white" />}
            color="bg-green-500"
          />
          
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">سلسلة المواظبة</h3>
                <p className="text-xs text-muted-foreground">أيام متتالية</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {convertToArabicNumber(stats.streakDays)}
                </p>
                <p className="text-sm text-muted-foreground">يوم 🔥</p>
              </div>
              {stats.streakDays >= 7 && (
                <div className="bg-orange-500/20 px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-orange-600">أسبوع كامل!</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Overall Stats */}
        <h2 className="text-lg font-bold text-foreground mb-4">الإحصائيات الكلية</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 text-center">
            <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">
              {formatTime(stats.totalReadingTime)}
            </p>
            <p className="text-xs text-muted-foreground">وقت القراءة</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Calendar className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">
              {convertToArabicNumber(stats.totalSessions)}
            </p>
            <p className="text-xs text-muted-foreground">جلسات القراءة</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">
              {convertToArabicNumber(stats.khatmahCount)}
            </p>
            <p className="text-xs text-muted-foreground">ختمات كاملة</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Target className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-foreground">
              {convertToArabicNumber(stats.wirdCompletionRate)}%
            </p>
            <p className="text-xs text-muted-foreground">نسبة إتمام الورد</p>
          </Card>
        </div>

        {/* Tasbih Chart */}
        <TasbihStatsChart data={stats.tasbihByType} />

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/quran">
            <Button size="lg" className="gap-2">
              <Book className="w-5 h-5" />
              ابدأ القراءة
            </Button>
          </Link>
          <Link to="/tasbih">
            <Button size="lg" variant="outline" className="gap-2">
              <Repeat className="w-5 h-5" />
              التسبيح
            </Button>
          </Link>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default ReadingStatsPage;
