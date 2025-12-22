import { useState, useEffect } from "react";
import { Book, Target, CheckCircle, Plus, Minus, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { useDailyWird } from "@/hooks/useDailyWird";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const DailyWirdPage = () => {
  const { user } = useAuth();
  const { wird, createOrUpdateWird, updateProgress, isLoading } = useDailyWird();

  const handleAddPage = () => {
    if (wird) {
      updateProgress(1);
    }
  };

  const handleRemovePage = () => {
    // Note: current hook doesn't support removing, so we'll handle it differently
    if (wird && (wird.completed_pages || 0) > 0) {
      // For now, just show a toast
      toast.info("يمكنك البدء من جديد غداً");
    }
  };

  const handleUpdateTarget = (newTarget: number) => {
    const target = Math.max(1, Math.min(20, newTarget));
    createOrUpdateWird(target);
  };

  const progress = wird ? ((wird.completed_pages || 0) / (wird.target_pages || 2)) * 100 : 0;
  const isCompleted = progress >= 100;

  // Calculate days to complete Quran based on target
  const totalPages = 604;
  const daysToComplete = wird?.target_pages ? Math.ceil(totalPages / wird.target_pages) : 302;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 arabic-ui">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            الورد اليومي
          </h1>
          <p className="text-muted-foreground">
            حافظ على وردك اليومي من القرآن الكريم
          </p>
        </div>

        {!user && (
          <Card className="p-6 mb-8 bg-accent/10 border-accent/20">
            <div className="text-center">
              <p className="text-foreground mb-4">
                سجّل الدخول لحفظ تقدمك في الورد اليومي
              </p>
              <Link to="/auth">
                <Button>تسجيل الدخول</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Main Progress Card */}
        <Card className="p-8 mb-8 relative overflow-hidden">
          {isCompleted && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          )}
          
          <div className="relative">
            {/* Circular Progress */}
            <div className="flex justify-center mb-8">
              <div className="relative w-48 h-48">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={553}
                    strokeDashoffset={553 - (553 * progress) / 100}
                    strokeLinecap="round"
                    className={`transition-all duration-500 ${isCompleted ? "text-green-500" : "text-primary"}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {isCompleted ? (
                    <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-foreground">
                        {wird?.completed_pages || 0}
                      </span>
                      <span className="text-muted-foreground">
                        من {wird?.target_pages || 2}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isCompleted ? (
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                  <Award className="w-6 h-6" />
                  أحسنت! أكملت وردك اليومي
                </h2>
                <p className="text-muted-foreground">
                  استمر في المواظبة على الورد اليومي
                </p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">
                  متبقي {(wird?.target_pages || 2) - (wird?.completed_pages || 0)} صفحة
                </h2>
                <p className="text-muted-foreground">
                  لإكمال وردك اليومي
                </p>
              </div>
            )}

            {/* Page Counter Buttons */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRemovePage}
                disabled={!wird || (wird.completed_pages || 0) <= 0}
                className="w-14 h-14 rounded-full"
              >
                <Minus className="w-6 h-6" />
              </Button>
              
              <div className="text-center px-6">
                <p className="text-3xl font-bold text-foreground">
                  {wird?.completed_pages || 0}
                </p>
                <p className="text-sm text-muted-foreground">صفحة مكتملة</p>
              </div>
              
              <Button
                size="lg"
                onClick={handleAddPage}
                disabled={!wird || (wird.completed_pages || 0) >= (wird?.target_pages || 2)}
                className="w-14 h-14 rounded-full"
              >
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Target Settings */}
        <Card className="p-6 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            إعدادات الهدف اليومي
          </h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">عدد الصفحات اليومية</p>
              <p className="text-sm text-muted-foreground">
                ستكمل القرآن في {daysToComplete} يوم تقريباً
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleUpdateTarget((wird?.target_pages || 2) - 1)}
                disabled={!wird || (wird.target_pages || 2) <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="text-2xl font-bold text-foreground w-12 text-center">
                {wird?.target_pages || 2}
              </span>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleUpdateTarget((wird?.target_pages || 2) + 1)}
                disabled={!wird || (wird.target_pages || 2) >= 20}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Recommended Targets */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">أهداف مقترحة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { pages: 1, desc: "ختمة في سنتين" },
              { pages: 2, desc: "ختمة في سنة" },
              { pages: 4, desc: "ختمة في 5 أشهر" },
              { pages: 20, desc: "ختمة في شهر" },
            ].map((option) => (
              <button
                key={option.pages}
                onClick={() => handleUpdateTarget(option.pages)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  wird?.target_pages === option.pages
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="text-2xl font-bold text-foreground">{option.pages}</p>
                <p className="text-sm text-muted-foreground">{option.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link to="/mushaf">
            <Button size="lg" className="gap-2">
              <Book className="w-5 h-5" />
              ابدأ القراءة من المصحف
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DailyWirdPage;
