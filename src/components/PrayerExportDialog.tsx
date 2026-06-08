import { useState, useEffect, useRef } from "react";
import { Download, Image as ImageIcon, MapPin, Loader2, FileJson, FileText } from "lucide-react";
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
import { countries, type City } from "@/data/locationData";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { firestoreAdd } from "@/lib/firebase";
import ExportThemeSelector, { exportThemes, type ExportTheme } from "./ExportThemeSelector";
import jsPDF from "jspdf";

interface PrayerDay {
  date: {
    readable: string;
    gregorian: { date: string; day: string; weekday: { en: string }; month: { number: number; en: string }; year: string };
    hijri: { date: string; day: string; weekday: { ar: string }; month: { ar: string; number: number }; year: string };
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

const hijriMonthNamesAr = [
  "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
  "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان",
  "رمضان", "شوال", "ذو القعدة", "ذو الحجة",
];

const gregorianMonthNames = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",
];

type PeriodType = "week" | "gregorian" | "hijri";

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
  const [exportType, setExportType] = useState<"image" | "pdf" | "json" | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<ExportTheme>(exportThemes[0]);
  const [period, setPeriod] = useState<PeriodType>("hijri");
  const [hijriToday, setHijriToday] = useState<{ month: number; year: number } | null>(null);
  const [hijriMonth, setHijriMonth] = useState<number>(0);
  const [hijriYear, setHijriYear] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const finalLat = useCustomLocation && selectedCity ? selectedCity.latitude : defaultLat;
  const finalLng = useCustomLocation && selectedCity ? selectedCity.longitude : defaultLng;
  const finalCityName = useCustomLocation && selectedCity ? selectedCity.name_ar : defaultCityName;

  // Detect current Hijri month/year on open
  useEffect(() => {
    if (!open || hijriToday) return;
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    fetch(`https://api.aladhan.com/v1/gToH?date=${dateStr}`)
      .then((r) => r.json())
      .then((d) => {
        const h = d.data.hijri;
        const mNum = parseInt(h.month.number);
        const yNum = parseInt(h.year);
        setHijriToday({ month: mNum, year: yNum });
        setHijriMonth(mNum);
        setHijriYear(yNum);
      })
      .catch(() => {});
  }, [open, hijriToday]);

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setSelectedCity(null);
  };
  const handleCitySelect = (cityName: string) => {
    const country = countries.find((c) => c.code === selectedCountry);
    const city = country?.cities.find((c) => c.name_ar === cityName);
    if (city) setSelectedCity(city);
  };
  const currentCountryCities = countries.find((c) => c.code === selectedCountry)?.cities || [];

  const logExportAction = async (et: string) => {
    if (!user) return;
    try {
      await firestoreAdd("export_logs", {
        user_id: user.uid,
        export_type: et,
        period,
        theme: selectedTheme.id,
        location: { latitude: finalLat, longitude: finalLng, city_name: finalCityName, is_custom: useCustomLocation },
        month: currentMonth,
        year: currentYear,
        created_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Export log error:", e);
    }
  };

  // Fetch days according to selected period
  const fetchDays = async (): Promise<{ days: PrayerDay[]; titleSubtitle: string }> => {
    if (!finalLat || !finalLng) throw new Error("Location not set");

    if (period === "gregorian") {
      const r = await fetch(`https://api.aladhan.com/v1/calendar/${currentYear}/${currentMonth}?latitude=${finalLat}&longitude=${finalLng}&method=${method}&school=${madhab}`);
      const d = await r.json();
      const days = d.data as PrayerDay[];
      const subtitle = `${gregorianMonthNames[currentMonth - 1]} ${currentYear}م`;
      return { days, titleSubtitle: subtitle };
    }

    if (period === "hijri") {
      const r = await fetch(`https://api.aladhan.com/v1/hijriCalendar/${hijriYear}/${hijriMonth}?latitude=${finalLat}&longitude=${finalLng}&method=${method}&school=${madhab}`);
      const d = await r.json();
      const days = d.data as PrayerDay[];
      const subtitle = `شهر ${hijriMonthNamesAr[hijriMonth - 1]} ${hijriYear}هـ`;
      return { days, titleSubtitle: subtitle };
    }

    // Week: 7 days starting from today
    const out: PrayerDay[] = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const ds = `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
      const r = await fetch(`https://api.aladhan.com/v1/timings/${ds}?latitude=${finalLat}&longitude=${finalLng}&method=${method}&school=${madhab}`);
      const j = await r.json();
      out.push(j.data as PrayerDay);
    }
    const start = out[0].date.hijri;
    const end = out[6].date.hijri;
    const subtitle = `أسبوع: ${start.day} ${start.month.ar} - ${end.day} ${end.month.ar} ${end.year}هـ`;
    return { days: out, titleSubtitle: subtitle };
  };

  // Render canvas (used by image + pdf)
  const renderCanvas = (days: PrayerDay[], titleSubtitle: string): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const scale = period === "week" ? 3 : 3;
    const width = 1200;
    const rowHeight = period === "week" ? 60 : 42;
    const headerHeight = 130;
    const footerHeight = 110;
    const padding = 30;
    const tableHeaderHeight = 55;
    const height = headerHeight + tableHeaderHeight + days.length * rowHeight + footerHeight + padding * 2;

    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    const isLight = selectedTheme.id === "classic-white";

    // background
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, selectedTheme.bgStart);
    bg.addColorStop(1, selectedTheme.bgEnd);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // header band
    const hg = ctx.createLinearGradient(0, 0, width, headerHeight);
    if (selectedTheme.headerBg) {
      const cs = selectedTheme.headerBg.match(/#[a-fA-F0-9]{6}/g) || [selectedTheme.accentColor];
      hg.addColorStop(0, cs[0]);
      hg.addColorStop(1, cs[1] || cs[0]);
    } else {
      hg.addColorStop(0, selectedTheme.accentColor);
      hg.addColorStop(1, selectedTheme.borderColor);
    }
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, width, headerHeight);

    // Header text
    ctx.fillStyle = isLight ? "#ffffff" : selectedTheme.textColor;
    ctx.textAlign = "center";
    ctx.font = "bold 38px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(`مواقيت الصلاة لمدينة ${finalCityName || ""}`, width / 2, 55);
    ctx.font = "24px 'Segoe UI', Arial, sans-serif";
    ctx.fillText(titleSubtitle, width / 2, 95);

    // Columns
    const columns = [
      { label: period === "week" ? "اليوم" : "التاريخ", width: 240 },
      { label: "الفجر", width: 100 },
      { label: "الشروق", width: 100 },
      { label: "الظهر", width: 100 },
      { label: "العصر", width: 100 },
      { label: "المغرب", width: 100 },
      { label: "العشاء", width: 100 },
    ];
    const tableWidth = columns.reduce((s, c) => s + c.width, 0);
    const tableStartX = (width - tableWidth) / 2;
    const tableStartY = headerHeight + padding;

    // table header
    ctx.fillStyle = isLight ? "#f0fdf4" : `${selectedTheme.accentColor}30`;
    ctx.fillRect(tableStartX, tableStartY, tableWidth, tableHeaderHeight);
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 18px 'Segoe UI', Arial, sans-serif";
    let xPos = tableStartX;
    columns.forEach((c) => {
      ctx.fillText(c.label, xPos + c.width / 2, tableStartY + 35);
      xPos += c.width;
    });

    // rows
    days.forEach((day, i) => {
      const rowY = tableStartY + tableHeaderHeight + i * rowHeight;
      ctx.fillStyle = isLight
        ? (i % 2 === 0 ? "#ffffff" : "#f9fafb")
        : (i % 2 === 0 ? selectedTheme.bgEnd : `${selectedTheme.bgStart}40`);
      ctx.fillRect(tableStartX, rowY, tableWidth, rowHeight);

      ctx.strokeStyle = isLight ? "#e5e7eb" : `${selectedTheme.borderColor}50`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(tableStartX, rowY + rowHeight);
      ctx.lineTo(tableStartX + tableWidth, rowY + rowHeight);
      ctx.stroke();

      const dateLabel = period === "week"
        ? `${day.date.hijri.weekday.ar} - ${day.date.hijri.day} ${day.date.hijri.month.ar}`
        : `${day.date.gregorian.day} (${day.date.hijri.day} ${day.date.hijri.month.ar})`;

      const rowData = [
        dateLabel,
        day.timings.Fajr.split(" ")[0],
        day.timings.Sunrise.split(" ")[0],
        day.timings.Dhuhr.split(" ")[0],
        day.timings.Asr.split(" ")[0],
        day.timings.Maghrib.split(" ")[0],
        day.timings.Isha.split(" ")[0],
      ];

      xPos = tableStartX;
      rowData.forEach((text, idx) => {
        if (idx === 0) {
          ctx.font = "bold 14px 'Segoe UI', Arial, sans-serif";
          ctx.fillStyle = selectedTheme.textColor;
        } else {
          ctx.font = "16px 'Courier New', monospace";
          ctx.fillStyle = selectedTheme.accentColor;
        }
        ctx.fillText(text, xPos + columns[idx].width / 2, rowY + rowHeight / 2 + 6);
        xPos += columns[idx].width;
      });
    });

    // table border
    ctx.strokeStyle = selectedTheme.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(tableStartX, tableStartY, tableWidth, tableHeaderHeight + days.length * rowHeight);

    // footer
    const footerY = tableStartY + tableHeaderHeight + days.length * rowHeight + 25;
    const fg = ctx.createLinearGradient(0, footerY, 0, footerY + footerHeight);
    if (isLight) {
      fg.addColorStop(0, "#f0fdf4");
      fg.addColorStop(1, "#ffffff");
    } else {
      fg.addColorStop(0, selectedTheme.bgEnd);
      fg.addColorStop(1, selectedTheme.bgEnd);
    }
    ctx.fillStyle = fg;
    ctx.fillRect(0, footerY, width, footerHeight);

    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 26px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("نور الفرقان", width / 2, footerY + 38);

    ctx.fillStyle = isLight ? "#6b7280" : `${selectedTheme.textColor}90`;
    ctx.font = "15px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("noor-alfurqan.lovable.app", width / 2, footerY + 62);
    ctx.font = "13px 'Segoe UI', Arial, sans-serif";
    ctx.fillText("© جميع الحقوق محفوظة - تطبيق نور الفرقان", width / 2, footerY + 85);

    return canvas;
  };

  const safeFilename = () => {
    const p = period === "week" ? "week" : period === "hijri" ? `hijri-${hijriMonth}-${hijriYear}` : `${currentMonth}-${currentYear}`;
    return `prayer-times-${finalCityName || "location"}-${p}`;
  };

  const handleExportImage = async () => {
    setIsExporting(true); setExportType("image");
    try {
      const { days, titleSubtitle } = await fetchDays();
      const canvas = renderCanvas(days, titleSubtitle);
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${safeFilename()}.png`;
      a.click();
      await logExportAction("image");
      toast.success("تم تحميل الصورة بجودة عالية");
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ في التصدير");
    } finally {
      setIsExporting(false); setExportType(null);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true); setExportType("pdf");
    try {
      const { days, titleSubtitle } = await fetchDays();
      const canvas = renderCanvas(days, titleSubtitle);
      const imgData = canvas.toDataURL("image/png", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
        compress: true,
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.height / canvas.width;
      const imgWidth = pageWidth - 40;
      const imgHeight = imgWidth * ratio;

      if (imgHeight <= pageHeight - 40) {
        pdf.addImage(imgData, "PNG", 20, 20, imgWidth, imgHeight, undefined, "FAST");
      } else {
        // scale to fit single page
        const scaledH = pageHeight - 40;
        const scaledW = scaledH / ratio;
        pdf.addImage(imgData, "PNG", (pageWidth - scaledW) / 2, 20, scaledW, scaledH, undefined, "FAST");
      }
      pdf.save(`${safeFilename()}.pdf`);
      await logExportAction("pdf");
      toast.success("تم تحميل ملف PDF");
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ في تصدير PDF");
    } finally {
      setIsExporting(false); setExportType(null);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true); setExportType("json");
    try {
      const { days } = await fetchDays();
      const data = days.map((d) => ({
        gregorian_date: d.date.gregorian.date,
        hijri_date: d.date.hijri.date,
        hijri_weekday: d.date.hijri.weekday?.ar,
        hijri_month: d.date.hijri.month.ar,
        fajr: d.timings.Fajr.split(" ")[0],
        sunrise: d.timings.Sunrise.split(" ")[0],
        dhuhr: d.timings.Dhuhr.split(" ")[0],
        asr: d.timings.Asr.split(" ")[0],
        maghrib: d.timings.Maghrib.split(" ")[0],
        isha: d.timings.Isha.split(" ")[0],
      }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeFilename()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      await logExportAction("json");
      toast.success("تم تحميل الملف بنجاح");
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ في تحميل الملف");
    } finally {
      setIsExporting(false); setExportType(null);
    }
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
            اختر الفترة (أسبوع / شهر هجري / شهر ميلادي) ثم نوع التصدير
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Period selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">الفترة</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "hijri" as PeriodType, label: "شهر هجري" },
                { id: "gregorian" as PeriodType, label: "شهر ميلادي" },
                { id: "week" as PeriodType, label: "أسبوع" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPeriod(opt.id)}
                  className={`h-11 rounded-xl border text-sm font-medium transition ${
                    period === opt.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:bg-muted"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {period === "hijri" && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Select value={String(hijriMonth || 1)} onValueChange={(v) => setHijriMonth(parseInt(v))}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="الشهر" /></SelectTrigger>
                  <SelectContent>
                    {hijriMonthNamesAr.map((m, i) => (
                      <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(hijriYear || 1446)} onValueChange={(v) => setHijriYear(parseInt(v))}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="السنة" /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => (hijriToday?.year || 1446) - 1 + i).map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}هـ</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Current location */}
          {defaultCityName && !useCustomLocation && (
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-sm text-muted-foreground">الموقع المحدد:</p>
              </div>
              <p className="font-bold text-lg text-foreground">{defaultCityName}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="customLocation"
              checked={useCustomLocation}
              onChange={(e) => setUseCustomLocation(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="customLocation" className="text-sm font-medium">
              تحديد موقع مختلف للتصدير
            </label>
          </div>

          {useCustomLocation && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border">
              <div className="space-y-2">
                <label className="text-sm font-medium">الدولة</label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="اختر الدولة" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.name_ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCountry && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">المدينة</label>
                  <Select value={selectedCity?.name_ar || ""} onValueChange={handleCitySelect}>
                    <SelectTrigger className="h-12"><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                    <SelectContent>
                      {currentCountryCities.map((c) => (
                        <SelectItem key={c.name_en} value={c.name_ar}>{c.name_ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <ExportThemeSelector selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />

          {/* Export buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting || (useCustomLocation && !selectedCity)}
              className="h-16 flex flex-col items-center justify-center gap-1"
            >
              {isExporting && exportType === "pdf" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (<><FileText className="w-5 h-5" /><span className="text-xs">PDF</span></>)}
            </Button>
            <Button
              onClick={handleExportImage}
              disabled={isExporting || (useCustomLocation && !selectedCity)}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1"
            >
              {isExporting && exportType === "image" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (<><ImageIcon className="w-5 h-5" /><span className="text-xs">صورة</span></>)}
            </Button>
            <Button
              onClick={handleExportJSON}
              disabled={isExporting || (useCustomLocation && !selectedCity)}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center gap-1"
            >
              {isExporting && exportType === "json" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (<><FileJson className="w-5 h-5" /><span className="text-xs">JSON</span></>)}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            سيتم تضمين اسم المدينة، التاريخ الهجري، وحقوق الموقع في الملف
          </p>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default PrayerExportDialog;
