import { useState, useRef } from "react";
import { Share2, Download, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ShareAyahDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ayahText: string;
  surahName: string;
  ayahNumber: number;
}

const ShareAyahDialog = ({
  isOpen,
  onClose,
  ayahText,
  surahName,
  ayahNumber,
}: ShareAyahDialogProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Set canvas size
    canvas.width = 1080;
    canvas.height = 1080;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#1a2f1a");
    gradient.addColorStop(1, "#0d1f0d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative border
    ctx.strokeStyle = "#c9a961";
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Inner decorative frame
    ctx.strokeStyle = "rgba(201, 169, 97, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Load Arabic font
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Surah name
    ctx.fillStyle = "#c9a961";
    ctx.font = "bold 36px 'Amiri', serif";
    ctx.fillText(surahName, canvas.width / 2, 120);

    // Ayah number
    ctx.fillStyle = "rgba(201, 169, 97, 0.7)";
    ctx.font = "28px 'Amiri', serif";
    ctx.fillText(`الآية ${ayahNumber}`, canvas.width / 2, 170);

    // Ayah text - word wrap
    ctx.fillStyle = "#ffffff";
    ctx.font = "40px 'Amiri', serif";
    
    const maxWidth = canvas.width - 160;
    const lineHeight = 70;
    const words = ayahText.split(" ");
    let lines: string[] = [];
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

    const startY = (canvas.height - lines.length * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    // App branding
    ctx.fillStyle = "#c9a961";
    ctx.font = "bold 32px 'Cairo', sans-serif";
    ctx.fillText("نور الفرقان", canvas.width / 2, canvas.height - 100);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
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

      const file = new File([blob], `ayah-${surahName}-${ayahNumber}.png`, {
        type: "image/png",
      });

      try {
        await navigator.share({
          title: `${surahName} - الآية ${ayahNumber}`,
          text: `${ayahText}\n\n${surahName} - الآية ${ayahNumber}\n\nنور الفرقان`,
          files: [file],
        });
      } catch (error) {
        // User cancelled or error
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md arabic-ui">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            مشاركة الآية
          </DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="bg-gradient-to-br from-[#1a2f1a] to-[#0d1f0d] rounded-xl p-6 text-center">
          <p className="text-accent text-sm mb-2">{surahName} - الآية {ayahNumber}</p>
          <p className="font-quran text-white text-lg leading-relaxed mb-4">
            {ayahText.length > 100 ? ayahText.slice(0, 100) + "..." : ayahText}
          </p>
          <p className="text-accent text-xs">نور الفرقان</p>
        </div>

        {/* Hidden canvas for image generation */}
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

export default ShareAyahDialog;
