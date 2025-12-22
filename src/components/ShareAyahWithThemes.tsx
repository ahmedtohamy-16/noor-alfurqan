import { useState, useRef, useEffect } from "react";
import { Share2, Download, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareAyahWithThemesProps {
  isOpen: boolean;
  onClose: () => void;
  ayahText: string;
  surahName: string;
  ayahNumber: number;
}

const themes = [
  {
    id: "classic-green",
    name: "أخضر كلاسيكي",
    bgStart: "#1a2f1a",
    bgEnd: "#0d1f0d",
    textColor: "#ffffff",
    accentColor: "#c9a961",
    borderColor: "#c9a961",
  },
  {
    id: "royal-blue",
    name: "أزرق ملكي",
    bgStart: "#1a1f3a",
    bgEnd: "#0d1020",
    textColor: "#ffffff",
    accentColor: "#a0c4ff",
    borderColor: "#5a7fbb",
  },
  {
    id: "warm-sepia",
    name: "سيبيا دافئ",
    bgStart: "#3d2914",
    bgEnd: "#2a1a0a",
    textColor: "#f5e6d3",
    accentColor: "#d4a574",
    borderColor: "#8b6914",
  },
  {
    id: "ocean-depth",
    name: "عمق المحيط",
    bgStart: "#0a2a3a",
    bgEnd: "#051520",
    textColor: "#e0f7fa",
    accentColor: "#4dd0e1",
    borderColor: "#00838f",
  },
  {
    id: "sunset-glow",
    name: "غروب الشمس",
    bgStart: "#4a1a3a",
    bgEnd: "#2a0a20",
    textColor: "#fce4ec",
    accentColor: "#f48fb1",
    borderColor: "#ad1457",
  },
  {
    id: "forest-green",
    name: "أخضر الغابة",
    bgStart: "#1b4332",
    bgEnd: "#0a2818",
    textColor: "#d8f3dc",
    accentColor: "#95d5b2",
    borderColor: "#40916c",
  },
  {
    id: "midnight-purple",
    name: "بنفسجي منتصف الليل",
    bgStart: "#2d1b4e",
    bgEnd: "#1a0a2e",
    textColor: "#e8daef",
    accentColor: "#bb8fce",
    borderColor: "#7d3c98",
  },
  {
    id: "elegant-black",
    name: "أسود أنيق",
    bgStart: "#1a1a1a",
    bgEnd: "#000000",
    textColor: "#ffffff",
    accentColor: "#ffd700",
    borderColor: "#404040",
  },
];

const ShareAyahWithThemes = ({
  isOpen,
  onClose,
  ayahText,
  surahName,
  ayahNumber,
}: ShareAyahWithThemesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
  }, [isOpen, selectedTheme, ayahText]);

  const generatePreview = async () => {
    const blob = await generateImage();
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  };

  const generateImage = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, selectedTheme.bgStart);
    gradient.addColorStop(1, selectedTheme.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    ctx.strokeStyle = selectedTheme.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Inner decorative frame
    ctx.strokeStyle = `${selectedTheme.borderColor}50`;
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Corner decorations
    const cornerSize = 30;
    ctx.strokeStyle = selectedTheme.accentColor;
    ctx.lineWidth = 3;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(80, 110);
    ctx.lineTo(80, 80);
    ctx.lineTo(110, 80);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 110, 80);
    ctx.lineTo(canvas.width - 80, 80);
    ctx.lineTo(canvas.width - 80, 110);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(80, canvas.height - 110);
    ctx.lineTo(80, canvas.height - 80);
    ctx.lineTo(110, canvas.height - 80);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 110, canvas.height - 80);
    ctx.lineTo(canvas.width - 80, canvas.height - 80);
    ctx.lineTo(canvas.width - 80, canvas.height - 110);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Surah name
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 36px 'Amiri', serif";
    ctx.fillText(surahName, canvas.width / 2, 140);

    // Ayah number
    ctx.fillStyle = `${selectedTheme.accentColor}b0`;
    ctx.font = "28px 'Amiri', serif";
    ctx.fillText(`الآية ${ayahNumber}`, canvas.width / 2, 190);

    // Ayah text - word wrap
    ctx.fillStyle = selectedTheme.textColor;
    ctx.font = "42px 'Amiri', serif";
    
    const maxWidth = canvas.width - 180;
    const lineHeight = 75;
    const words = ayahText.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? currentLine + " " + word : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const startY = (canvas.height - lines.length * lineHeight) / 2 + 30;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    // App branding
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 32px 'Cairo', sans-serif";
    ctx.fillText("نور الفرقان", canvas.width / 2, canvas.height - 100);

    ctx.fillStyle = `${selectedTheme.textColor}80`;
    ctx.font = "20px 'Cairo', sans-serif";
    ctx.fillText("تطبيق قراءة القرآن الكريم", canvas.width / 2, canvas.height - 60);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ayah-${surahName}-${ayahNumber}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الصورة");
  };

  const handleShare = async () => {
    if (navigator.share) {
      const blob = await generateImage();
      if (!blob) return;

      const file = new File([blob], `ayah-${surahName}-${ayahNumber}.png`, { type: "image/png" });

      try {
        await navigator.share({
          title: `${surahName} - الآية ${ayahNumber}`,
          text: `${ayahText}\n\n${surahName} - الآية ${ayahNumber}\n\nنور الفرقان`,
          files: [file],
        });
      } catch (error) {
        console.error("Share failed:", error);
      }
    } else {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    const text = `${ayahText}\n\n${surahName} - الآية ${ayahNumber}\n\nنور الفرقان`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("تم نسخ النص");
    setTimeout(() => setCopied(false), 2000);
  };

  const nextTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === selectedTheme.id);
    const nextIndex = (currentIndex + 1) % themes.length;
    setSelectedTheme(themes[nextIndex]);
  };

  const prevTheme = () => {
    const currentIndex = themes.findIndex((t) => t.id === selectedTheme.id);
    const prevIndex = (currentIndex - 1 + themes.length) % themes.length;
    setSelectedTheme(themes[prevIndex]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg arabic-ui">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            مشاركة الآية
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="relative">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full rounded-xl" />
          ) : (
            <div className="aspect-square bg-muted rounded-xl animate-pulse" />
          )}
          
          {/* Theme navigation arrows */}
          <button
            onClick={prevTheme}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextTheme}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Theme selector */}
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme)}
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full border-2 transition-all",
                selectedTheme.id === theme.id
                  ? "border-primary scale-110"
                  : "border-transparent hover:border-muted"
              )}
              style={{
                background: `linear-gradient(135deg, ${theme.bgStart}, ${theme.bgEnd})`,
              }}
              title={theme.name}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">{selectedTheme.name}</p>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={handleShare} className="flex-col h-auto py-3 gap-1">
            <Share2 className="w-5 h-5" />
            <span className="text-xs">مشاركة</span>
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-col h-auto py-3 gap-1">
            <Download className="w-5 h-5" />
            <span className="text-xs">تحميل</span>
          </Button>
          <Button onClick={handleCopyText} variant="outline" className="flex-col h-auto py-3 gap-1">
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            <span className="text-xs">نسخ</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareAyahWithThemes;
