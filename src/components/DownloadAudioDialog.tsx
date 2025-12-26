import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { reciters, type Reciter } from '@/data/reciters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DownloadAudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number | null;
  downloadType: 'surah' | 'ayah';
}

export const DownloadAudioDialog = ({
  open,
  onOpenChange,
  surahNumber,
  surahName,
  ayahNumber,
  downloadType,
}: DownloadAudioDialogProps) => {
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!selectedReciter) {
      toast.error('الرجاء اختيار القارئ');
      return;
    }

    setIsDownloading(true);

    try {
      if (downloadType === 'ayah' && ayahNumber) {
        // Download single ayah
        const url = `${selectedReciter.server}/${ayahNumber}.mp3`;
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${surahName}_آية_${ayahNumber}_${selectedReciter.nameArabic}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success('تم تحميل الآية بنجاح');
      } else {
        // Download full surah - we need to get all ayahs
        // For now, we'll provide a link to the full surah if available
        // Most reciters have full surah downloads at a different URL pattern
        const surahFormatted = surahNumber.toString().padStart(3, '0');
        const fullSurahUrl = `https://download.quranicaudio.com/quran/${getReciterPath(selectedReciter.id)}/${surahFormatted}.mp3`;
        
        toast.info('جاري تحميل السورة...', { duration: 5000 });
        
        const response = await fetch(fullSurahUrl);
        if (!response.ok) {
          throw new Error('السورة غير متوفرة لهذا القارئ');
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${surahName}_${selectedReciter.nameArabic}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success('تم تحميل السورة بنجاح');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('فشل في تحميل الصوت. جرب قارئ آخر.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Map reciter IDs to quranicaudio.com paths
  const getReciterPath = (reciterId: string): string => {
    const paths: Record<string, string> = {
      'ar.alafasy': 'mishary_rashid_alafasy',
      'ar.husary': 'mahmood_khaleel_al-husaree',
      'ar.minshawi': 'muhammad_siddeeq_al-minshaawee',
      'ar.abdulsamad': 'abdul_basit_murattal',
      'ar.sudais': 'abdurrahmaan_as-sudays',
      'ar.shaatree': 'abu_bakr_ash-shaatree',
      'ar.mahermuaiqly': 'maher_al_mueaqly',
      'ar.hani_rifai': 'hani_ar-rifai',
      'ar.ayyoub': 'muhammad_ayyoob',
      'ar.shuraym': 'sa3ood_ash-shuraym',
      'ar.ahmedajamy': 'ahmed_ibn_ali_al-ajamy',
      'ar.alialhuthaify': 'ali_abdur-rahman_al-huthaify',
      'ar.abdulbari': 'abdullaah_basfar',
    };
    return paths[reciterId] || 'mishary_rashid_alafasy';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md arabic-ui" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {downloadType === 'surah' ? 'تحميل السورة كاملة' : 'تحميل الآية'}
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر القارئ الذي تريد تحميل الصوت بصوته
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto py-4">
          {reciters.map((reciter) => (
            <button
              key={reciter.id}
              onClick={() => setSelectedReciter(reciter)}
              className={cn(
                'w-full p-3 rounded-lg border text-right transition-all',
                selectedReciter?.id === reciter.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <p className="font-semibold">{reciter.nameArabic}</p>
              <p className="text-sm text-muted-foreground">{reciter.name}</p>
            </button>
          ))}
        </div>

        <Button
          onClick={handleDownload}
          disabled={!selectedReciter || isDownloading}
          className="w-full gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري التحميل...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              تحميل
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
