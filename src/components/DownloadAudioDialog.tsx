import { useEffect, useState } from 'react';
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
import { getVerifiedReciters, DEFAULT_RECITER_ID, type Reciter } from '@/data/reciters';
import { toast } from 'sonner';
import { useDownloadManager } from './DownloadManager';
import { startAyahDownload, startRangeDownload } from '@/lib/ayahDownloads';
import { surahs } from '@/data/surahs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { arabicDigits, ayahCountLabel } from '@/lib/displayFormat';

interface DownloadAudioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surahNumber: number;
  surahName: string;
  ayahNumber: number | null;
  globalAyahNumber?: number | null;
  downloadType: 'surah' | 'ayah' | 'range';
  totalAyahs?: number;
  chooseSurah?: boolean;
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
  chooseSurah = false,
}: DownloadAudioDialogProps) => {
  const reciters = getVerifiedReciters();
  const [selectedReciter, setSelectedReciter] = useState<Reciter | null>(reciters.find((r) => r.id === DEFAULT_RECITER_ID) ?? null);
  const [chosenSurah, setChosenSurah] = useState(surahNumber);
  const effectiveSurahNumber = chooseSurah ? chosenSurah : surahNumber;
  const effectiveSurah = surahs.find((s) => s.number === effectiveSurahNumber);
  const effectiveName = chooseSurah ? effectiveSurah?.name || surahName : surahName;
  const effectiveTotal = effectiveSurah?.numberOfAyahs || totalAyahs;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(totalAyahs || 10);
  const { addTask, updateTask } = useDownloadManager();
  useEffect(() => {
    if (open) { setRangeStart(ayahNumber || 1); setRangeEnd(Math.min(effectiveTotal, (ayahNumber || 1) + 8)); }
  }, [open, effectiveTotal, ayahNumber]);
  const validRange = Number.isInteger(rangeStart) && Number.isInteger(rangeEnd) && rangeStart >= 1 && rangeEnd >= rangeStart && rangeEnd <= effectiveTotal;

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
        startAyahDownload(selectedReciter, globalAyahNumber, surahName);
        toast.success('بدأ تنزيل الآية — تابعها من صفحة التنزيلات');
      } else if (downloadType === 'range') {
        startRangeDownload(selectedReciter, effectiveSurahNumber, rangeStart, rangeEnd, effectiveName);
        toast.success('بدأ تجهيز المقطع — تابع حالته من التنزيلات');
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
      <DialogContent className="max-w-md max-h-[90dvh] overflow-y-auto arabic-ui" dir="rtl">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-right">
            {downloadType === 'surah' && 'تحميل السورة كاملة'}
            {downloadType === 'ayah' && 'تحميل الآية'}
            {downloadType === 'range' && 'تنزيل مقطع من سورة'}
          </DialogTitle>
          <DialogDescription className="text-right">
            {downloadType === 'range' ? `سورة ${effectiveName} · مقطع صوتي واحد` : 'اختر القارئ'}
          </DialogDescription>
        </DialogHeader>

        {chooseSurah && (
          <div className="space-y-2">
            <Label>السورة</Label>
            <Select value={String(chosenSurah)} onValueChange={(v) => setChosenSurah(Number(v))} dir="rtl">
              <SelectTrigger aria-label="السورة"><SelectValue /></SelectTrigger>
              <SelectContent className="arabic-ui">{surahs.map((s) => <SelectItem key={s.number} value={String(s.number)}>سورة {s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        {downloadType === 'range' && (
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="range-start">من آية</Label>
              <Input
                id="range-start"
                type="number"
                min={1}
                max={effectiveTotal}
                value={rangeStart}
                onChange={(e) => setRangeStart(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="range-end">إلى آية</Label>
              <Input
                id="range-end"
                type="number"
                min={rangeStart}
                max={effectiveTotal}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Number(e.target.value))}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>القارئ</Label>
          <Select value={selectedReciter?.id} onValueChange={(id) => setSelectedReciter(reciters.find((r) => r.id === id) ?? null)} disabled={isDownloading} dir="rtl">
            <SelectTrigger aria-label="القارئ"><SelectValue /></SelectTrigger>
            <SelectContent className="arabic-ui">{reciters.map((r) => <SelectItem key={r.id} value={r.id}>{r.nameArabic}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {downloadType === 'range' && <p className={validRange ? 'text-sm text-muted-foreground arabic-digits' : 'text-sm text-destructive'}>
          {validRange ? `من الآية ${arabicDigits(rangeStart)} إلى ${arabicDigits(rangeEnd)} · ${ayahCountLabel(rangeEnd - rangeStart + 1)}` : `اختر آيات بين ١ و${arabicDigits(effectiveTotal)}، والنهاية بعد البداية`}
        </p>}

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
          disabled={!selectedReciter || isDownloading || (downloadType === 'range' && !validRange)}
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
              {downloadType === 'range' ? 'تنزيل المقطع' : 'تحميل'}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
