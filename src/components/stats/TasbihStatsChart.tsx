import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface TasbihStatsChartProps {
  data: { type: string; count: number }[];
}

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(142, 71%, 45%)", // green
  "hsl(38, 92%, 50%)", // amber
  "hsl(262, 83%, 58%)", // purple
  "hsl(199, 89%, 48%)", // cyan
];

const TasbihStatsChart = ({ data }: TasbihStatsChartProps) => {
  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().split("").map((digit) => arabicNumbers[parseInt(digit)] || digit).join("");
  };

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">التسبيحات حسب النوع</h3>
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          لا توجد بيانات للتسبيح
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">التسبيحات حسب النوع</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis 
              type="category" 
              dataKey="type" 
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              width={100}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.slice(0, 6).map((item, index) => (
          <div 
            key={item.type} 
            className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded-lg"
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="flex-1 truncate text-foreground">{item.type}</span>
            <span className="font-bold text-foreground">{convertToArabicNumber(item.count)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TasbihStatsChart;
