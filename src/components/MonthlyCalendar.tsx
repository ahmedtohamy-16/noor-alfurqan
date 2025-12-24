import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, ChevronRight, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserSettings } from "@/hooks/useUserSettings";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { ar } from "date-fns/locale";

interface DayPrayerTimes {
  date: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

const fetchMonthlyPrayerTimes = async (
  lat: number,
  lng: number,
  month: number,
  year: number,
  method: number
): Promise<DayPrayerTimes[]> => {
  const response = await fetch(
    `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${lat}&longitude=${lng}&method=${method}`
  );
  const data = await response.json();
  
  return data.data.map((day: any) => ({
    date: day.date.gregorian.date,
    Fajr: day.timings.Fajr.split(" ")[0],
    Sunrise: day.timings.Sunrise.split(" ")[0],
    Dhuhr: day.timings.Dhuhr.split(" ")[0],
    Asr: day.timings.Asr.split(" ")[0],
    Maghrib: day.timings.Maghrib.split(" ")[0],
    Isha: day.timings.Isha.split(" ")[0],
  }));
};

const MonthlyCalendar = () => {
  const { settings } = useUserSettings();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const lat = settings.latitude || 21.4225;
  const lng = settings.longitude || 39.8262;
  const method = settings.prayer_method || 4;

  const { data: monthlyData, isLoading } = useQuery({
    queryKey: ["monthlyPrayerTimes", lat, lng, currentMonth.getMonth() + 1, currentMonth.getFullYear(), method],
    queryFn: () => fetchMonthlyPrayerTimes(lat, lng, currentMonth.getMonth() + 1, currentMonth.getFullYear(), method),
    enabled: !!lat && !!lng,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  const exportToCSV = () => {
    if (!monthlyData) return;

    const headers = ["التاريخ", "الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"];
    const rows = monthlyData.map(day => [
      day.date,
      day.Fajr,
      day.Sunrise,
      day.Dhuhr,
      day.Asr,
      day.Maghrib,
      day.Isha,
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prayer-times-${format(currentMonth, "yyyy-MM", { locale: ar })}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground">التقويم الشهري</h3>
        </div>
        
        <Button variant="outline" size="sm" onClick={exportToCSV} disabled={!monthlyData}>
          <Download className="w-4 h-4 ml-2" />
          تصدير
        </Button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <span className="font-bold text-foreground">
          {format(currentMonth, "MMMM yyyy", { locale: ar })}
        </span>
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 px-1 text-right text-muted-foreground font-medium">اليوم</th>
                <th className="py-2 px-1 text-center text-muted-foreground font-medium">الفجر</th>
                <th className="py-2 px-1 text-center text-muted-foreground font-medium">الشروق</th>
                <th className="py-2 px-1 text-center text-muted-foreground font-medium">الظهر</th>
                <th className="py-2 px-1 text-center text-muted-foreground font-medium">العصر</th>
                <th className="py-2 px-1 text-center text-muted-foreground font-medium">المغرب</th>
                <th className="py-2 px-1 text-center text-muted-foreground font-medium">العشاء</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData?.map((day, index) => {
                const isToday = day.date === format(new Date(), "dd-MM-yyyy");
                return (
                  <tr 
                    key={index} 
                    className={`border-b border-border/50 ${isToday ? "bg-primary/10" : ""}`}
                  >
                    <td className="py-2 px-1 text-right font-medium text-foreground">
                      {day.date.split("-")[0]}
                    </td>
                    <td className="py-2 px-1 text-center text-foreground">{day.Fajr}</td>
                    <td className="py-2 px-1 text-center text-muted-foreground">{day.Sunrise}</td>
                    <td className="py-2 px-1 text-center text-foreground">{day.Dhuhr}</td>
                    <td className="py-2 px-1 text-center text-foreground">{day.Asr}</td>
                    <td className="py-2 px-1 text-center text-foreground">{day.Maghrib}</td>
                    <td className="py-2 px-1 text-center text-foreground">{day.Isha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

export default MonthlyCalendar;
