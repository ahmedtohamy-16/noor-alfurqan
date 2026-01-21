import { useState, useRef, useEffect } from "react";
import { Share2, Download, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ExportThemeSelector, { exportThemes, type ExportTheme } from "./ExportThemeSelector";

interface ShareAyahWithThemesProps {
  isOpen: boolean;
  onClose: () => void;
  ayahText: string;
  surahName: string;
  ayahNumber: number;
}

const fontOptions = [
  { id: "amiri", name: "أميري", family: "'Amiri', serif" },
  { id: "scheherazade", name: "شهرزاد", family: "'Scheherazade New', serif" },
  { id: "noto-naskh", name: "نسخ عربي", family: "'Noto Naskh Arabic', serif" },
];

const ShareAyahWithThemes = ({
  isOpen,
  onClose,
  ayahText,
  surahName,
  ayahNumber,
}: ShareAyahWithThemesProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<ExportTheme>(exportThemes[2]); // Islamic green default
  const [selectedFont, setSelectedFont] = useState(fontOptions[0]);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [isOpen, selectedTheme, selectedFont, ayahText]);

  const generatePreview = async () => {
    const blob = await generateImage();
    if (blob) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  };

  const generateImage = async (): Promise<Blob | null> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scale = 4; // 4K resolution
    canvas.width = 1080 * scale;
    canvas.height = 1080 * scale;
    ctx.scale(scale, scale);

    const width = 1080;
    const height = 1080;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, selectedTheme.bgStart);
    gradient.addColorStop(1, selectedTheme.bgEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative border
    ctx.strokeStyle = selectedTheme.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Inner decorative frame
    ctx.strokeStyle = `${selectedTheme.borderColor}50`;
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, width - 120, height - 120);

    // Corner decorations
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
    ctx.moveTo(width - 110, 80);
    ctx.lineTo(width - 80, 80);
    ctx.lineTo(width - 80, 110);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(80, height - 110);
    ctx.lineTo(80, height - 80);
    ctx.lineTo(110, height - 80);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 110, height - 80);
    ctx.lineTo(width - 80, height - 80);
    ctx.lineTo(width - 80, height - 110);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Surah name
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = `bold 40px ${selectedFont.family}`;
    ctx.fillText(surahName, width / 2, 140);

    // Ayah number
    ctx.fillStyle = `${selectedTheme.accentColor}b0`;
    ctx.font = `32px ${selectedFont.family}`;
    ctx.fillText(`الآية ${ayahNumber}`, width / 2, 195);

    // Ayah text - word wrap with LARGE CLEAR font
    ctx.fillStyle = selectedTheme.textColor;
    ctx.font = `52px ${selectedFont.family}`; // Larger font
    
    const maxWidth = width - 160;
    const lineHeight = 90;
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

    // Limit lines if too many
    const maxLines = 8;
    let displayLines = lines;
    if (lines.length > maxLines) {
      displayLines = lines.slice(0, maxLines);
      displayLines[maxLines - 1] += "...";
    }

    const startY = (height - displayLines.length * lineHeight) / 2 + 40;
    displayLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // App branding
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 36px 'Cairo', sans-serif";
    ctx.fillText("نور الفرقان", width / 2, height - 105);

    ctx.fillStyle = `${selectedTheme.textColor}80`;
    ctx.font = "22px 'Cairo', sans-serif";
    ctx.fillText("تطبيق قراءة القرآن الكريم", width / 2, height - 60);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
    });
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ayah-${surahName}-${ayahNumber}-4K.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الصورة بجودة 4K");
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg arabic-ui max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            مشاركة الآية
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="relative">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="w-full rounded-xl shadow-lg" />
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
        <ExportThemeSelector selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />

        {/* Font selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">نوع الخط</label>
          <Select 
            value={selectedFont.id} 
            onValueChange={(val) => setSelectedFont(fontOptions.find(f => f.id === val) || fontOptions[0])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  {font.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            <span className="text-xs">تحميل 4K</span>
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
