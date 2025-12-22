import { useState } from "react";
import { BookOpen, Target, Check, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDailyWird } from "@/hooks/useDailyWird";

const DailyWirdCard = () => {
  const { wird, createOrUpdateWird } = useDailyWird();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetPages, setTargetPages] = useState(wird?.target_pages || 2);

  const progressPercent = wird 
    ? Math.round((wird.completed_pages / wird.target_pages) * 100) 
    : 0;

  const handleSaveTarget = () => {
    createOrUpdateWird(targetPages);
    setIsSettingsOpen(false);
  };

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)]).join("");
  };

  return (
    <>
      <Card className="p-4 arabic-ui">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">الورد اليومي</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {wird ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">التقدم</span>
              <span className="font-medium">
                {convertToArabicNumber(wird.completed_pages)} / {convertToArabicNumber(wird.target_pages)} صفحة
              </span>
            </div>
            
            <Progress value={progressPercent} className="h-3" />
            
            {wird.is_completed ? (
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <Check className="w-5 h-5" />
                <span className="font-medium">أتممت وردك اليوم!</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                باقي {convertToArabicNumber(wird.target_pages - wird.completed_pages)} صفحات لإتمام وردك
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">حدد وردك اليومي</p>
            <Button onClick={() => setIsSettingsOpen(true)} size="sm">
              تحديد الورد
            </Button>
          </div>
        )}
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-sm arabic-ui">
          <DialogHeader>
            <DialogTitle>إعدادات الورد اليومي</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عدد الصفحات اليومية</label>
              <Select
                value={targetPages.toString()}
                onValueChange={(val) => setTargetPages(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {convertToArabicNumber(num)} {num === 1 ? "صفحة" : "صفحات"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveTarget} className="w-full">
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DailyWirdCard;
