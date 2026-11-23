import { arabicDigits } from "@/lib/displayFormat";
import { useState, useRef, useEffect } from "react";
import { Share2, Download, Copy, Check, ChevronLeft, ChevronRight, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ExportThemeSelector, { exportThemes, type ExportTheme } from "./ExportThemeSelector";
import { fullTextLines } from "@/lib/textLines";
import { IMAGE_WEBSITE_URL } from "@/lib/exportBranding";

interface HadithShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hadithText: string;
  bookName: string;
  hadithNumber: string | number;
  narrator?: string;
}

const HadithShareDialog = ({
  isOpen,
  onClose,
  hadithText,
  bookName,
  hadithNumber,
  narrator,
}: HadithShareDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<ExportTheme>(exportThemes[0]);
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      generatePreview();
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, selectedTheme, hadithText]);

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

    const width = 1080;
    await document.fonts.load("38px 'Noor Amiri'").catch(() => {});
    ctx.font = "38px 'Noor Amiri', 'Amiri', serif";
    const lineHeight = 70;
    const lines = fullTextLines(hadithText, width - 160, line => ctx.measureText(line).width);
    const height = Math.max(1350, 280 + lines.length * lineHeight + (narrator ? 100 : 0) + 220);
    const scale = Math.min(3, 16380 / height);

    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

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

    // Header - Book name
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 36px 'Amiri', serif";
    ctx.fillText(bookName, width / 2, 140);

    // Hadith number
    ctx.fillStyle = `${selectedTheme.accentColor}b0`;
    ctx.font = "28px 'Amiri', serif";
    ctx.fillText(`رقم الحديث: ${arabicDigits(hadithNumber)}`, width / 2, 190);

    // Hadith text - word wrap with larger font
    ctx.fillStyle = selectedTheme.textColor;
    ctx.font = "38px 'Noor Amiri', 'Amiri', serif";
    const startY = 280;
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // Narrator (if available)
    if (narrator) {
      const narratorY = startY + lines.length * lineHeight + 50;
      ctx.fillStyle = `${selectedTheme.accentColor}90`;
      ctx.font = "italic 28px 'Amiri', serif";
      ctx.fillText(`الراوي: ${narrator}`, width / 2, narratorY);
    }

    // App branding
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 36px 'Cairo', sans-serif";
    ctx.fillText("نور الفرقان", width / 2, height - 110);

    ctx.fillStyle = `${selectedTheme.textColor}80`;
    ctx.font = "22px 'Cairo', sans-serif";
    ctx.fillText(IMAGE_WEBSITE_URL, width / 2, height - 65);

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
    a.download = `hadith-${bookName}-${hadithNumber}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تحميل الصورة بجودة عالية");
  };

  const handleShare = async () => {
    if (navigator.share) {
      const blob = await generateImage();
      if (!blob) return;

      const file = new File([blob], `hadith-${bookName}-${hadithNumber}.png`, { type: "image/png" });

      try {
        await navigator.share({
          title: `حديث من ${bookName}`,
          text: `${hadithText}\n\n${bookName} - رقم ${arabicDigits(hadithNumber)}\n\nنور الفرقان`,
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
    const text = `${hadithText}\n\n${narrator ? `الراوي: ${narrator}\n` : ''}${bookName} - رقم ${arabicDigits(hadithNumber)}\n\nنور الفرقان`;
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
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-lg max-h-[90dvh] overflow-y-auto arabic-ui">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            مشاركة الحديث كصورة
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="relative">
          {previewUrl ? (
            <img src={previewUrl} alt="معاينة صورة مشاركة الحديث" className="w-full rounded-xl shadow-lg" />
          ) : (
            <div className="aspect-[4/5] bg-muted rounded-xl animate-pulse" />
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
            <span className="text-xs">تحميل ٤K</span>
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

export default HadithShareDialog;
