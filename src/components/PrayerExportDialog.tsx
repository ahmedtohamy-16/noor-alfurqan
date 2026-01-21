import { useState, useRef } from "react";
import { Download, Image, MapPin, Loader2, FileJson, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries, prayerMethods, type City } from "@/data/locationData";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { firestoreAdd, COLLECTIONS } from "@/lib/firebase";
import ExportThemeSelector, { exportThemes, type ExportTheme } from "./ExportThemeSelector";

interface MonthlyPrayerDay {
  date: {
    readable: string;
    gregorian: { date: string; day: string; month: { number: number; en: string } };
    hijri: { date: string; day: string; month: { ar: string; number: number }; year: string };
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
}

interface PrayerExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMonth: number;
  currentYear: number;
  defaultLat?: number;
  defaultLng?: number;
  defaultCityName?: string;
  method: number;
  madhab: number;
}

const hijriMonthNames = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني", 
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
];

const gregorianMonthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const PrayerExportDialog = ({
  open,
  onOpenChange,
  currentMonth,
  currentYear,
  defaultLat,
  defaultLng,
  defaultCityName,
  method,
  madhab,
}: PrayerExportDialogProps) => {
  const { user } = useAuth();
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<"image" | "json" | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ExportTheme>(exportThemes[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const finalLat = useCustomLocation && selectedCity ? selectedCity.latitude : defaultLat;
  const finalLng = useCustomLocation && selectedCity ? selectedCity.longitude : defaultLng;
  const finalCityName = useCustomLocation && selectedCity ? selectedCity.name_ar : defaultCityName;

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setSelectedCity(null);
  };

  const handleCitySelect = (cityName: string) => {
    const country = countries.find(c => c.code === selectedCountry);
    const city = country?.cities.find(c => c.name_ar === cityName);
    if (city) {
      setSelectedCity(city);
    }
  };

  const currentCountryCities = countries.find(c => c.code === selectedCountry)?.cities || [];

  // Log export action to database
  const logExportAction = async (exportType: string) => {
    if (!user) return;
    
    try {
      const deviceType = /Android/.test(navigator.userAgent) ? "Android" :
                         /iPhone|iPad|iPod/.test(navigator.userAgent) ? "iOS" :
                         /Windows/.test(navigator.userAgent) ? "Windows" : "Other";
      
      await firestoreAdd('export_logs', {
        user_id: user.uid,
        export_type: exportType,
        theme: selectedTheme.id,
        location: {
          latitude: finalLat,
          longitude: finalLng,
          city_name: finalCityName,
          is_custom: useCustomLocation,
        },
        month: currentMonth,
        year: currentYear,
        device_type: deviceType,
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging export:", error);
    }
  };

  // Fetch monthly prayer times
  const fetchMonthlyTimes = async (): Promise<MonthlyPrayerDay[]> => {
    if (!finalLat || !finalLng) throw new Error("Location not set");
    
    const response = await fetch(
      `https://api.aladhan.com/v1/calendar/${currentYear}/${currentMonth}?latitude=${finalLat}&longitude=${finalLng}&method=${method}&school=${madhab}`
    );
    const data = await response.json();
    return data.data;
  };

  // Export as JSON
  const handleExportJSON = async () => {
    setIsExporting(true);
    setExportType("json");
    
    try {
      const monthlyTimes = await fetchMonthlyTimes();
      
      const exportData = monthlyTimes.map((day) => ({
        gregorian_date: day.date.gregorian.date,
        hijri_date: day.date.hijri.date,
        hijri_month: day.date.hijri.month.ar,
        fajr: day.timings.Fajr.split(" ")[0],
        sunrise: day.timings.Sunrise.split(" ")[0],
        dhuhr: day.timings.Dhuhr.split(" ")[0],
        asr: day.timings.Asr.split(" ")[0],
        maghrib: day.timings.Maghrib.split(" ")[0],
        isha: day.timings.Isha.split(" ")[0],
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prayer-times-${finalCityName || "location"}-${currentMonth}-${currentYear}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      await logExportAction("json");
      toast.success("تم تحميل الملف بنجاح");
      onOpenChange(false);
    } catch (error) {
      console.error("JSON export error:", error);
      toast.error("حدث خطأ في تحميل الملف");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  // Export as high-quality image with theme
  const handleExportImage = async () => {
    setIsExporting(true);
    setExportType("image");
    
    try {
      const monthlyTimes = await fetchMonthlyTimes();
      
      // Create 4K resolution canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      
      const scale = 4; // 4K resolution
      const width = 1200;
      const rowHeight = 42;
      const headerHeight = 100;
      const footerHeight = 120;
      const padding = 40;
      const tableHeaderHeight = 55;
      const height = headerHeight + tableHeaderHeight + (monthlyTimes.length * rowHeight) + footerHeight + padding * 2;
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.scale(scale, scale);
      
      // Background gradient based on theme
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, selectedTheme.bgStart);
      bgGradient.addColorStop(1, selectedTheme.bgEnd);
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Header with theme colors
      const isLightTheme = selectedTheme.id === "classic-white";
      const headerGradient = ctx.createLinearGradient(0, 0, width, headerHeight);
      
      if (selectedTheme.headerBg) {
        // Parse linear gradient colors
        const colors = selectedTheme.headerBg.match(/#[a-fA-F0-9]{6}/g) || [selectedTheme.accentColor, selectedTheme.accentColor];
        headerGradient.addColorStop(0, colors[0]);
        headerGradient.addColorStop(1, colors[1] || colors[0]);
      } else {
        headerGradient.addColorStop(0, selectedTheme.accentColor);
        headerGradient.addColorStop(1, selectedTheme.borderColor);
      }
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, width, headerHeight);
      
      // Header text
      ctx.fillStyle = isLightTheme ? "#ffffff" : selectedTheme.textColor;
      ctx.font = "bold 32px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`مواقيت الصلاة - ${finalCityName || ""}`, width / 2, 40);
      
      // Get Hijri month info from first day
      const firstDay = monthlyTimes[0];
      const hijriMonth = firstDay?.date?.hijri?.month?.ar || "";
      const hijriYear = firstDay?.date?.hijri?.year || "";
      
      ctx.font = "22px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(
        `${hijriMonth} ${hijriYear}هـ - ${gregorianMonthNames[currentMonth - 1]} ${currentYear}م`,
        width / 2,
        75
      );
      
      // Table columns with Fajr included
      const columns = [
        { label: "التاريخ", width: 200 },
        { label: "الفجر", width: 100 },
        { label: "الشروق", width: 100 },
        { label: "الظهر", width: 100 },
        { label: "العصر", width: 100 },
        { label: "المغرب", width: 100 },
        { label: "العشاء", width: 100 },
      ];
      
      const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
      const tableStartX = (width - tableWidth) / 2;
      const tableStartY = headerHeight + padding;
      
      // Table header background
      ctx.fillStyle = isLightTheme ? "#f0fdf4" : `${selectedTheme.accentColor}30`;
      ctx.fillRect(tableStartX, tableStartY, tableWidth, tableHeaderHeight);
      
      // Table header text
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      
      let xPos = tableStartX;
      columns.forEach((col) => {
        ctx.fillText(col.label, xPos + col.width / 2, tableStartY + 35);
        xPos += col.width;
      });
      
      // Table rows
      monthlyTimes.forEach((day, index) => {
        const rowY = tableStartY + tableHeaderHeight + (index * rowHeight);
        
        // Alternate row colors based on theme
        if (isLightTheme) {
          ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#f9fafb";
        } else {
          ctx.fillStyle = index % 2 === 0 ? `${selectedTheme.bgEnd}` : `${selectedTheme.bgStart}40`;
        }
        ctx.fillRect(tableStartX, rowY, tableWidth, rowHeight);
        
        // Row border
        ctx.strokeStyle = isLightTheme ? "#e5e7eb" : `${selectedTheme.borderColor}50`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(tableStartX, rowY + rowHeight);
        ctx.lineTo(tableStartX + tableWidth, rowY + rowHeight);
        ctx.stroke();
        
        // Row data
        ctx.textAlign = "center";
        
        const rowData = [
          `${day.date.gregorian.day} (${day.date.hijri.day} ${day.date.hijri.month.ar})`,
          day.timings.Fajr.split(" ")[0],
          day.timings.Sunrise.split(" ")[0],
          day.timings.Dhuhr.split(" ")[0],
          day.timings.Asr.split(" ")[0],
          day.timings.Maghrib.split(" ")[0],
          day.timings.Isha.split(" ")[0],
        ];
        
        xPos = tableStartX;
        rowData.forEach((text, i) => {
          // Date column - different style
          if (i === 0) {
            ctx.font = "bold 13px 'Segoe UI', Arial, sans-serif";
            ctx.fillStyle = selectedTheme.textColor;
          } else {
            ctx.font = "16px 'Courier New', monospace";
            ctx.fillStyle = selectedTheme.accentColor;
          }
          ctx.fillText(text, xPos + columns[i].width / 2, rowY + 28);
          xPos += columns[i].width;
        });
      });
      
      // Table border
      ctx.strokeStyle = selectedTheme.borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        tableStartX, 
        tableStartY, 
        tableWidth, 
        tableHeaderHeight + (monthlyTimes.length * rowHeight)
      );
      
      // Footer
      const footerY = tableStartY + tableHeaderHeight + (monthlyTimes.length * rowHeight) + 25;
      
      // Footer gradient background
      const footerGradient = ctx.createLinearGradient(0, footerY, 0, footerY + footerHeight);
      if (isLightTheme) {
        footerGradient.addColorStop(0, "#f0fdf4");
        footerGradient.addColorStop(1, "#ffffff");
      } else {
        footerGradient.addColorStop(0, `${selectedTheme.bgEnd}`);
        footerGradient.addColorStop(1, selectedTheme.bgEnd);
      }
      ctx.fillStyle = footerGradient;
      ctx.fillRect(0, footerY, width, footerHeight);
      
      // App branding
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.font = "bold 28px 'Segoe UI', Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("نور الفرقان", width / 2, footerY + 40);
      
      ctx.fillStyle = isLightTheme ? "#6b7280" : `${selectedTheme.textColor}80`;
      ctx.font = "16px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("تطبيق لقراءة القرآن الكريم", width / 2, footerY + 68);
      
      // Download image
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `prayer-times-${finalCityName || "location"}-${hijriMonth || currentMonth}-${currentYear}-4K.png`;
      a.click();
      
      await logExportAction("image");
      toast.success("تم تحميل الصورة بجودة 4K");
      onOpenChange(false);
    } catch (error) {
      console.error("Image export error:", error);
      toast.error("حدث خطأ في تحميل الصورة");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const nextTheme = () => {
    const currentIndex = exportThemes.findIndex((t) => t.id === selectedTheme.id);
    const nextIndex = (currentIndex + 1) % exportThemes.length;
    setSelectedTheme(exportThemes[nextIndex]);
  };

  const prevTheme = () => {
    const currentIndex = exportThemes.findIndex((t) => t.id === selectedTheme.id);
    const prevIndex = (currentIndex - 1 + exportThemes.length) % exportThemes.length;
    setSelectedTheme(exportThemes[prevIndex]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg arabic-ui max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            تصدير مواقيت الصلاة
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            اختر الموقع والثيم ونوع التصدير للحصول على جدول المواقيت
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Current location display */}
          {defaultCityName && !useCustomLocation && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">الموقع المحدد:</p>
              </div>
              <p className="font-bold text-lg text-foreground">{defaultCityName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {gregorianMonthNames[currentMonth - 1]} {currentYear}م
              </p>
            </div>
          )}

          {/* Custom location toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="customLocation"
              checked={useCustomLocation}
              onChange={(e) => setUseCustomLocation(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="customLocation" className="text-sm font-medium text-foreground">
              تحديد موقع مختلف للتصدير
            </label>
          </div>

          {/* Custom location selectors */}
          {useCustomLocation && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">الدولة</label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="اختر الدولة" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">المدينة</label>
                  <Select
                    value={selectedCity?.name_ar || ""}
                    onValueChange={handleCitySelect}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCountryCities.map((city) => (
                        <SelectItem key={city.name_en} value={city.name_ar}>
                          {city.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Theme selector */}
          <ExportThemeSelector selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />

          {/* Export buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleExportImage}
              disabled={isExporting || (useCustomLocation && !selectedCity)}
              className="h-14 flex flex-col items-center justify-center gap-1"
              variant="default"
            >
              {isExporting && exportType === "image" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Image className="w-5 h-5" />
                  <span className="text-xs">تحميل صورة 4K</span>
                </>
              )}
            </Button>
            
            <Button
              onClick={handleExportJSON}
              disabled={isExporting || (useCustomLocation && !selectedCity)}
              className="h-14 flex flex-col items-center justify-center gap-1"
              variant="outline"
            >
              {isExporting && exportType === "json" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <FileJson className="w-5 h-5" />
                  <span className="text-xs">تحميل JSON</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            سيتم تصدير مواقيت الشهر بالكامل بصيغة عالية الجودة (4K)
          </p>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default PrayerExportDialog;
