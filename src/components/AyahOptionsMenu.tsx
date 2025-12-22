import { Heart, Share2, BookOpen, Play, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface AyahOptionsMenuProps {
  ayahNumber: number;
  ayahText: string;
  surahNumber: number;
  surahName: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpenTafsir: () => void;
  onOpenShare: () => void;
  onPlayAyah: () => void;
  children: React.ReactNode;
}

const AyahOptionsMenu = ({
  ayahNumber,
  ayahText,
  surahName,
  isFavorite,
  onToggleFavorite,
  onOpenTafsir,
  onOpenShare,
  onPlayAyah,
  children,
}: AyahOptionsMenuProps) => {
  const handleCopyAyah = async () => {
    try {
      const textToCopy = `${ayahText}\n\n— سورة ${surahName}، الآية ${ayahNumber}`;
      await navigator.clipboard.writeText(textToCopy);
      toast.success("تم نسخ الآية");
    } catch (error) {
      toast.error("فشل نسخ الآية");
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-48 arabic-ui"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPlayAyah(); }} className="gap-3 cursor-pointer">
          <Play className="w-4 h-4" />
          <span>استماع للآية</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }} className="gap-3 cursor-pointer">
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
          <span>{isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenTafsir(); }} className="gap-3 cursor-pointer">
          <BookOpen className="w-4 h-4" />
          <span>قراءة التفسير</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCopyAyah(); }} className="gap-3 cursor-pointer">
          <Copy className="w-4 h-4" />
          <span>نسخ الآية</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpenShare(); }} className="gap-3 cursor-pointer">
          <Share2 className="w-4 h-4" />
          <span>مشاركة الآية</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AyahOptionsMenu;
