import { useState, useEffect } from 'react';
import { Headphones, Download, Check, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { reciters, type Reciter } from '@/data/reciters';
import { cn } from '@/lib/utils';
import { useGlobalAudio } from '@/hooks/useGlobalAudio';
import { useAuth } from '@/hooks/useAuth';
import { firestoreGet, firestoreSet, COLLECTIONS } from '@/lib/firebase';
import { toast } from 'sonner';

interface ReciterSettingsPanelProps {
  surahNumber?: number;
  surahName?: string;
}

const ReciterSettingsPanel = ({ surahNumber, surahName }: ReciterSettingsPanelProps) => {
  const { selectedReciter, setReciter, isPlaying } = useGlobalAudio();
  const { user } = useAuth();
  const [downloadingReciter, setDownloadingReciter] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [offlineReciters, setOfflineReciters] = useState<Set<string>>(new Set());

  // Load offline reciters from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('offlineReciters');
    if (stored) {
      try {
        setOfflineReciters(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error('Error loading offline reciters:', e);
      }
    }
  }, []);

  // Load selected reciter from database
  useEffect(() => {
    const loadReciter = async () => {
      if (user) {
        const data = await firestoreGet<any>(COLLECTIONS.USER_READING_SETTINGS, user.uid);
        
        if (data?.selected_reciter) {
          const reciter = reciters.find(r => r.id === data.selected_reciter);
          if (reciter && reciter.id !== selectedReciter.id) {
            setReciter(reciter);
          }
        }
      }
    };
    loadReciter();
  }, [user]);

  const handleReciterSelect = async (reciter: Reciter) => {
    if (isPlaying) {
      toast.info('سيتم تغيير القارئ');
    }
    
    setReciter(reciter);
    
    // Save to database
    if (user) {
      await firestoreSet(COLLECTIONS.USER_READING_SETTINGS, user.uid, {
        user_id: user.uid,
        selected_reciter: reciter.id,
      });
    }
    
    // Save to localStorage
    localStorage.setItem('selectedReciter', reciter.id);
  };

  const getReciterPath = (reciterId: string): string => {
    // Mapping for quranicaudio.com download paths
    const paths: Record<string, string> = {
      'ar.alafasy': 'mishary_rashid_alafasy',
      'ar.husary': 'mahmood_khaleel_al-husaree',
      'ar.minshawi': 'muhammad_siddeeq_al-minshaawee',
      'ar.abdulsamad': 'abdul_basit_murattal',
      'ar.sudais': 'abdurrahmaan_as-sudays',
      'ar.shaatree': 'abu_bakr_ash-shaatree',
      'ar.mahermuaiqly': 'maher_al_mueaqly',
      'ar.hanirifai': 'hani_ar-rifai',
      'ar.shuraym': 'sa3ood_ash-shuraym',
      'ar.ahmedajamy': 'ahmed_ibn_ali_al-ajamy',
    };
    return paths[reciterId] || 'mishary_rashid_alafasy';
  };

  const estimateSurahSize = (surahNum: number): string => {
    const sizes: Record<number, number> = {
      1: 0.5, 2: 85, 3: 45, 4: 40, 5: 35, 6: 30, 7: 45, 8: 15, 9: 35, 10: 20,
    };
    const sizeMB = sizes[surahNum] || Math.max(2, Math.min(50, surahNum * 0.5));
    return `~${sizeMB.toFixed(1)} MB`;
  };

  const handleDownloadReciter = async (reciter: Reciter, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!surahNumber || !surahName) {
      toast.error('لا يمكن تحديد السورة');
      return;
    }

    setDownloadingReciter(reciter.id);
    setDownloadProgress(0);

    try {
      const surahFormatted = surahNumber.toString().padStart(3, '0');
      const url = `https://download.quranicaudio.com/quran/${getReciterPath(reciter.id)}/${surahFormatted}.mp3`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('السورة غير متوفرة');
      
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
          setDownloadProgress((receivedLength / total) * 100);
        }
      }
      
      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const cacheKey = `quran-audio-${reciter.id}-${surahNumber}`;
      
      const cache = await caches.open('quran-audio');
      const cacheResponse = new Response(blob);
      await cache.put(cacheKey, cacheResponse);
      
      const newOffline = new Set(offlineReciters);
      newOffline.add(`${reciter.id}-${surahNumber}`);
      setOfflineReciters(newOffline);
      localStorage.setItem('offlineReciters', JSON.stringify([...newOffline]));
      
      toast.success(`تم حفظ ${surahName} بصوت ${reciter.nameArabic} للاستخدام بدون نت`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('فشل في تحميل الصوت');
    } finally {
      setDownloadingReciter(null);
      setDownloadProgress(0);
    }
  };

  return (
    <Card className="p-4 space-y-3 arabic-ui">
      <div className="flex items-center gap-2 mb-2">
        <Headphones className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">القارئ</h3>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {reciters.map((reciter) => {
          const isSelected = selectedReciter.id === reciter.id;
          const isDownloading = downloadingReciter === reciter.id;
          const isOffline = surahNumber && offlineReciters.has(`${reciter.id}-${surahNumber}`);
          const isDisabled = isPlaying && !isSelected;

          return (
            <div
              key={reciter.id}
              onClick={() => !isDisabled && handleReciterSelect(reciter)}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-all',
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : isDisabled
                    ? 'border-border bg-muted/50 opacity-50 cursor-not-allowed'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                {isSelected && <Check className="w-4 h-4 text-primary" />}
                <div>
                  <p className={cn(
                    "font-semibold text-sm",
                    isSelected ? "text-primary" : "text-foreground"
                  )}>
                    {reciter.nameArabic}
                  </p>
                  <p className="text-xs text-muted-foreground">{reciter.name}</p>
                </div>
              </div>

              {surahNumber && (
                <div className="flex items-center gap-2">
                  {isOffline && (
                    <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
                      محفوظ
                    </span>
                  )}
                  
                  {isDownloading ? (
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={downloadProgress} className="h-1.5 w-16" />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(downloadProgress)}%
                      </span>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 gap-1"
                      onClick={(e) => handleDownloadReciter(reciter, e)}
                    >
                      <Download className="w-3 h-3" />
                      <span className="text-xs">{estimateSurahSize(surahNumber)}</span>
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isPlaying && (
        <p className="text-xs text-muted-foreground text-center">
          أوقف التشغيل لتغيير القارئ
        </p>
      )}
    </Card>
  );
};

export default ReciterSettingsPanel;
