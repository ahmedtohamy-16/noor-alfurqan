import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TafsirDialogProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  ayahNumber: number;
  ayahText: string;
}

const tafsirOptions = [
  { id: "ar.muyassar", name: "التفسير الميسر" },
  { id: "ar.jalalayn", name: "تفسير الجلالين" },
  { id: "ar.miqbas", name: "تنوير المقباس" },
  { id: "ar.qurtubi", name: "تفسير القرطبي" },
  { id: "ar.kathir", name: "تفسير ابن كثير" },
  { id: "ar.tabari", name: "تفسير الطبري" },
  { id: "ar.baghawi", name: "تفسير البغوي" },
  { id: "ar.saddi", name: "تفسير السعدي" },
];

const fetchTafsir = async (
  surahNumber: number,
  ayahNumber: number,
  edition: string
) => {
  const response = await fetch(
    `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/${edition}`
  );
  const data = await response.json();
  return data.data;
};

const TafsirDialog = ({
  isOpen,
  onClose,
  surahNumber,
  ayahNumber,
  ayahText,
}: TafsirDialogProps) => {
  const [selectedTafsir, setSelectedTafsir] = useState(tafsirOptions[0].id);

  const { data: tafsir, isLoading, error } = useQuery({
    queryKey: ["tafsir", surahNumber, ayahNumber, selectedTafsir],
    queryFn: () => fetchTafsir(surahNumber, ayahNumber, selectedTafsir),
    enabled: isOpen,
    retry: 1,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] arabic-ui">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="w-5 h-5 text-primary" />
            تفسير الآية {ayahNumber}
          </DialogTitle>
        </DialogHeader>

        {/* Ayah Text */}
        <div className="bg-primary/5 rounded-xl p-4 mb-4">
          <p className="font-quran text-lg leading-loose text-foreground text-center">
            {ayahText}
          </p>
        </div>

        {/* Tafsir Selector */}
        <div className="mb-4">
          <Select value={selectedTafsir} onValueChange={setSelectedTafsir}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر التفسير" />
            </SelectTrigger>
            <SelectContent>
              {tafsirOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tafsir Content */}
        <ScrollArea className="h-[300px] rounded-xl border border-border p-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : error ? (
            <p className="text-muted-foreground text-center py-8">
              هذا التفسير غير متاح حالياً لهذه الآية
            </p>
          ) : (
            <p className="text-foreground leading-relaxed text-base">
              {tafsir?.text || "لا يوجد تفسير متاح لهذه الآية"}
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TafsirDialog;
