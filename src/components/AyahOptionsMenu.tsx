import { Heart, Share2, BookOpen, Play, Copy, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { isStationaryTap } from "@/lib/tapGesture";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { arabicDigits } from "@/lib/displayFormat";

interface AyahOptionsMenuProps {
  ayahNumber: number;
  ayahText: string;
  surahNumber: number;
  surahName: string;
  globalAyahNumber: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenTafsir?: () => void;
  onOpenShare?: () => void;
  onPlayAyah?: () => void;
  onDownloadAyah?: () => void;
  children: React.ReactNode;
}

const AyahOptionsMenu = ({
  ayahNumber,
  ayahText,
  surahName,
  globalAyahNumber,
  isFavorite,
  onToggleFavorite,
  onOpenTafsir,
  onOpenShare,
  onPlayAyah,
  onDownloadAyah,
  children,
}: AyahOptionsMenuProps) => {
  const [open, setOpen] = useState(false);
  const gesture = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    // Capture catches window scrolling and any scrollable ancestor of the verse.
    document.addEventListener("scroll", close, true);
    document.addEventListener("touchmove", close, { passive: true });
    document.addEventListener("wheel", close, { passive: true });
    return () => {
      document.removeEventListener("scroll", close, true);
      document.removeEventListener("touchmove", close);
      document.removeEventListener("wheel", close);
    };
  }, [open]);

  const handleCopyAyah = async () => {
    try {
      const textToCopy = `${ayahText}\n\n— سورة ${surahName}، الآية ${arabicDigits(ayahNumber)}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success("تم نسخ الآية");
    } catch (error) {
      toast.error("فشل نسخ الآية");
    }
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild
        onPointerDown={(e) => {
          // Radix normally opens on pointer-down, before it can distinguish scrolling.
          e.preventDefault();
          if (e.button !== 0) return;
          gesture.current = { x: e.clientX, y: e.clientY, moved: false };
        }}
        onPointerMove={(e) => {
          if (gesture.current && !isStationaryTap(gesture.current, { x: e.clientX, y: e.clientY })) {
            gesture.current.moved = true;
          }
        }}
        onPointerCancel={() => { gesture.current = null; }}
        onPointerUp={(e) => {
          const start = gesture.current;
          gesture.current = null;
          if (start && !start.moved && isStationaryTap(start, { x: e.clientX, y: e.clientY })) {
            setOpen(previous => !previous);
          }
        }}
        onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-48 arabic-ui"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {onPlayAyah && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPlayAyah(); }} className="gap-3 cursor-pointer">
          <Play className="w-4 h-4" />
          <span>استماع للآية</span>
        </DropdownMenuItem>}

        {onDownloadAyah && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownloadAyah(); }} className="gap-3 cursor-pointer">
          <Download className="w-4 h-4" />
          <span>تحميل الآية</span>
        </DropdownMenuItem>}
        
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="gap-3 cursor-pointer">
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
          <span>{isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>
        </DropdownMenuItem>
        
        {onOpenTafsir && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenTafsir(); }} className="gap-3 cursor-pointer">
          <BookOpen className="w-4 h-4" />
          <span>قراءة التفسير</span>
        </DropdownMenuItem>}
        
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyAyah(); }} className="gap-3 cursor-pointer">
          <Copy className="w-4 h-4" />
          <span>نسخ الآية</span>
        </DropdownMenuItem>
        
        {onOpenShare && <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenShare(); }} className="gap-3 cursor-pointer">
          <Share2 className="w-4 h-4" />
          <span>مشاركة الآية</span>
        </DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AyahOptionsMenu;
