import { useState, useEffect } from 'react';
import { Headphones, Download, Check, Loader2, Save } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getVerifiedReciters, type Reciter } from '@/data/reciters';
import { cn } from '@/lib/utils';
import { surahs } from '@/data/surahs';
import { estimateSurahMB, formatSizeMB } from '@/lib/reciterSizeEstimate';
import { useGlobalAudio } from '@/hooks/useGlobalAudio';
import { useAuth } from '@/hooks/useAuth';
import { firestoreGet, firestoreSet, COLLECTIONS } from '@/lib/firebase';
import { toast } from 'sonner';
import { arabicDigits } from '@/lib/displayFormat';
import { flushUserState } from '@/lib/userStateStore';
import { DownloadAudioDialog } from './DownloadAudioDialog';

interface ReciterSettingsPanelProps {
  surahNumber?: number;
  surahName?: string;
}

const ReciterSettingsPanel = ({ surahNumber, surahName }: ReciterSettingsPanelProps) => {
  const { selectedReciter, setReciter, isPlaying } = useGlobalAudio();
  const { user } = useAuth();
  const [draftId, setDraftId] = useState(selectedReciter.id);
  const [saving, setSaving] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  useEffect(() => { setDraftId(selectedReciter.id); }, [selectedReciter.id]);
  const handleConfirm = async () => {
    const reciter = getVerifiedReciters().find(r => r.id === draftId);
    if (!reciter) return;
    setSaving(true);
    try { setReciter(reciter); if (user) await flushUserState(user.uid); toast.success('تم حفظ القارئ'); }
    catch { toast.error('تعذّر حفظ القارئ؛ أعد المحاولة'); }
    finally { setSaving(false); }
  };
  return (
    <Card className="p-4 space-y-3 arabic-ui">
      <div className="flex items-center gap-2 mb-2">
        <Headphones className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">القارئ</h3>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {getVerifiedReciters().map((reciter) => {
          const isSelected = draftId === reciter.id;
          const isDisabled = saving;

          return (
            <div
              key={reciter.id}
              onClick={() => !isDisabled && setDraftId(reciter.id)}
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
                </div>
              </div>

            </div>
          );
        })}
      </div>

      <Button className="w-full h-11 gap-2" disabled={saving || draftId === selectedReciter.id} onClick={handleConfirm}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}حفظ القارئ</Button>
      {surahNumber && <Button variant="outline" className="w-full h-11 gap-2" onClick={() => setDownloadOpen(true)}><Download className="w-4 h-4" />تنزيل التلاوة</Button>}
      <DownloadAudioDialog open={downloadOpen} onOpenChange={setDownloadOpen} surahNumber={surahNumber || 1} surahName={surahName || "الفاتحة"} ayahNumber={null} downloadType="range" totalAyahs={surahs.find(s => s.number === surahNumber)?.numberOfAyahs || 7} />
    </Card>
  );
};

export default ReciterSettingsPanel;
