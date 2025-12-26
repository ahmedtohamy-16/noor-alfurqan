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
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reciters, type Reciter } from '@/data/reciters';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDownloadManager } from './DownloadManager';

interface DownloadAudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number | null;
  globalAyahNumber?: number | null;
  downloadType: 'surah' | 'ayah' | 'range';
  totalAyahs?: number;
}

export const DownloadAudioDialog = ({
  open,
  onOpenChange,
  surahNumber,
  surahName,
  ayahNumber,
  globalAyahNumber,
  downloadType,
  totalAyahs = 0,
}: DownloadAudioDialogProps) => {
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(totalAyahs || 10);
  const { addTask, updateTask } = useDownloadManager();

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadWithProgress = async (url: string, taskId?: string): Promise<Blob | null> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      
      const chunks: ArrayBuffer[] = [];
      let receivedLength = 0;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value.buffer as ArrayBuffer);
        receivedLength += value.length;
        
        if (total > 0) {
          const progress = (receivedLength / total) * 100;
          setDownloadProgress(progress);
          if (taskId) {
            updateTask(taskId, { progress, totalSize: formatFileSize(total) });
          }
        }
      }
      
      const blob = new Blob(chunks);
      return blob;
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  };

  const handleDownload = async () => {
    if (!selectedReciter) {
      toast.error('الرجاء اختيار القارئ');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      if (downloadType === 'ayah' && globalAyahNumber) {
        // Download single ayah using global ayah number
        const url = `${selectedReciter.server}/${globalAyahNumber}.mp3`;
        const blob = await downloadWithProgress(url);
        
        if (!blob) throw new Error('فشل في تحميل الملف');
        
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${surahName}_آية_${ayahNumber}_${selectedReciter.nameArabic}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success('تم تحميل الآية بنجاح');
      } else if (downloadType === 'range') {
        // Download range of ayahs and merge them
        toast.info('جاري تحميل الآيات...', { duration: 10000 });
        
        // Calculate first ayah global number
        // We need to get the first ayah's global number from the surah
        const startGlobalAyah = globalAyahNumber ? globalAyahNumber - (ayahNumber || 1) + rangeStart : rangeStart;
        
        const blobs: Blob[] = [];
        const total = rangeEnd - rangeStart + 1;
        
        for (let i = rangeStart; i <= rangeEnd; i++) {
          const ayahGlobalNum = startGlobalAyah + (i - rangeStart);
          const url = `${selectedReciter.server}/${ayahGlobalNum}.mp3`;
          
          try {
            const response = await fetch(url);
            if (response.ok) {
              const blob = await response.blob();
              blobs.push(blob);
            }
          } catch (e) {
            console.error(`Error fetching ayah ${i}:`, e);
          }
          
          setDownloadProgress(((i - rangeStart + 1) / total) * 100);
        }
        
        if (blobs.length === 0) throw new Error('فشل في تحميل الآيات');
        
        // Merge all audio blobs
        const mergedBlob = new Blob(blobs, { type: 'audio/mpeg' });
        const downloadUrl = window.URL.createObjectURL(mergedBlob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${surahName}_من_${rangeStart}_إلى_${rangeEnd}_${selectedReciter.nameArabic}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(downloadUrl);
        toast.success(`تم تحميل ${blobs.length} آية بنجاح`);
      } else {
        // Download full surah
        const surahFormatted = surahNumber.toString().padStart(3, '0');
        const fullSurahUrl = `https://download.quranicaudio.com/quran/${getReciterPath(selectedReciter.id)}/${surahFormatted}.mp3`;
        
        toast.info('جاري تحميل السورة...', { duration: 10000 });
        
        const blob = await downloadWithProgress(fullSurahUrl);
        if (!blob) throw new Error('السورة غير متوفرة لهذا القارئ');
        
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
      setDownloadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md arabic-ui" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">
            {downloadType === 'surah' && 'تحميل السورة كاملة'}
            {downloadType === 'ayah' && 'تحميل الآية'}
            {downloadType === 'range' && 'تحميل نطاق من الآيات'}
          </DialogTitle>
          <DialogDescription className="text-right">
            اختر القارئ الذي تريد تحميل الصوت بصوته
          </DialogDescription>
        </DialogHeader>

        {downloadType === 'range' && (
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>من آية</Label>
              <Input
                type="number"
                min={1}
                max={totalAyahs}
                value={rangeStart}
                onChange={(e) => setRangeStart(Math.min(parseInt(e.target.value) || 1, rangeEnd))}
              />
            </div>
            <div className="space-y-2">
              <Label>إلى آية</Label>
              <Input
                type="number"
                min={rangeStart}
                max={totalAyahs}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Math.max(parseInt(e.target.value) || totalAyahs, rangeStart))}
              />
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[300px] overflow-y-auto py-4">
          {reciters.map((reciter) => (
            <button
              key={reciter.id}
              onClick={() => setSelectedReciter(reciter)}
              disabled={isDownloading}
              className={cn(
                'w-full p-3 rounded-lg border text-right transition-all',
                selectedReciter?.id === reciter.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50',
                isDownloading && 'opacity-50 cursor-not-allowed'
              )}
            >
              <p className="font-semibold">{reciter.nameArabic}</p>
              <p className="text-sm text-muted-foreground">{reciter.name}</p>
            </button>
          ))}
        </div>

        {isDownloading && (
          <div className="space-y-2">
            <Progress value={downloadProgress} className="h-2" />
            <p className="text-sm text-center text-muted-foreground">
              {Math.round(downloadProgress)}%
            </p>
          </div>
        )}

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
