import { Link } from "react-router-dom";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import TasbihCounter from "@/components/TasbihCounter";
import { useTasbih } from "@/hooks/useTasbih";

const TasbihPage = () => {
  const { stats } = useTasbih();

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />

      <main className="container mx-auto px-4 py-6 arabic-ui">
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">التسبيح الإلكتروني</h1>
            <p className="text-muted-foreground text-sm">سبّح واذكر الله</p>
          </div>
        </div>

        {/* Counter */}
        <div className="max-w-md mx-auto mb-8">
          <TasbihCounter />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">اليوم</p>
            <p className="text-2xl font-bold text-foreground">{convertToArabicNumber(stats.todayCount)}</p>
            <p className="text-xs text-muted-foreground">تسبيحة</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">الإجمالي</p>
            <p className="text-2xl font-bold text-primary">{convertToArabicNumber(stats.totalCount)}</p>
            <p className="text-xs text-muted-foreground">تسبيحة</p>
          </Card>
        </div>

        {/* Link to full stats */}
        <div className="text-center mt-6">
          <Link to="/reading-stats">
            <Button variant="ghost" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              عرض الإحصائيات الكاملة
            </Button>
          </Link>
        </div>

        {/* Virtues */}
        <Card className="mt-8 p-4 bg-primary/5 border-primary/20 max-w-md mx-auto">
          <h3 className="font-bold text-foreground mb-3">فضل التسبيح</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            قال رسول الله ﷺ: «من قال سبحان الله وبحمده في يوم مائة مرة حُطت خطاياه وإن كانت مثل زبد البحر»
          </p>
          <p className="text-xs text-primary mt-2">رواه البخاري ومسلم</p>
        </Card>
      </main>
    </div>
  );
};

export default TasbihPage;
