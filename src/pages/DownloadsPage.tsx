import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Download, Loader2, Pause, Play, RotateCcw, Save, Trash2, XCircle, Clock } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useAyahDownloads, retryDownload, deleteDownload, getDownloadBlob, downloadFileName,
  type AyahDownload, type DownloadStatus,
} from '@/lib/ayahDownloads';

const ar = (n: number) => n.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[+d]);
const sizeLabel = (b?: number) => (b ? `${ar(Math.max(1, Math.round(b / 1024)))} ك.ب` : '');

const statusInfo: Record<DownloadStatus, { label: string; icon: typeof Clock; cls: string }> = {
  queued: { label: 'في الانتظار', icon: Clock, cls: 'text-muted-foreground' },
  downloading: { label: 'جاري التنزيل', icon: Loader2, cls: 'text-primary' },
  completed: { label: 'تم التنزيل', icon: CheckCircle2, cls: 'text-primary' },
  error: { label: 'فشل التنزيل', icon: XCircle, cls: 'text-destructive' },
};

type Filter = 'all' | 'active' | 'completed' | 'error';
const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'جارية' },
  { id: 'completed', label: 'مكتملة' },
  { id: 'error', label: 'فاشلة' },
];

const DownloadsPage = () => {
  const downloads = useAyahDownloads();
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<AyahDownload | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => () => {
    audioRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  const counts = useMemo(() => ({
    all: downloads.length,
    active: downloads.filter((d) => d.status === 'queued' || d.status === 'downloading').length,
    completed: downloads.filter((d) => d.status === 'completed').length,
    error: downloads.filter((d) => d.status === 'error').length,
  }), [downloads]);

  const shown = downloads.filter((d) =>
    filter === 'all' ? true
      : filter === 'active' ? d.status === 'queued' || d.status === 'downloading'
      : d.status === filter,
  );

  const togglePlay = async (d: AyahDownload) => {
    if (playingId === d.id) { audioRef.current?.pause(); setPlayingId(null); return; }
    const blob = await getDownloadBlob(d.id);
    if (!blob) { toast.error('الملف غير موجود على الجهاز، أعد تنزيله'); return; }
    audioRef.current?.pause();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(blob);
    const a = new Audio(urlRef.current);
    a.onended = () => setPlayingId(null);
    audioRef.current = a;
    await a.play().catch(() => toast.error('تعذّر تشغيل الملف'));
    setPlayingId(d.id);
  };

  const saveToDevice = async (d: AyahDownload) => {
    const blob = await getDownloadBlob(d.id);
    if (!blob) { toast.error('الملف غير موجود على الجهاز، أعد تنزيله'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = downloadFileName(d);
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    if (playingId === toDelete.id) { audioRef.current?.pause(); setPlayingId(null); }
    await deleteDownload(toDelete.id);
    toast.success('تم حذف الملف');
    setToDelete(null);
  };

  return (
    <div className="min-h-screen bg-background arabic-ui" dir="rtl">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 py-6 pb-32">
        <h1 className="text-2xl font-bold text-foreground mb-1">الآيات المُنزَّلة</h1>
        <p className="text-sm text-muted-foreground mb-5">
          الآيات الصوتية التي نزّلتها محفوظة على هذا الجهاز وتعمل بدون إنترنت.
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {filters.map((f) => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'outline'}
              className="h-9 shrink-0 rounded-full" onClick={() => setFilter(f.id)}>
              {f.label} <span className="arabic-digits mr-1 opacity-80">{ar(counts[f.id])}</span>
            </Button>
          ))}
        </div>

        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Download className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground mb-1">
              {downloads.length === 0 ? 'لا توجد تنزيلات بعد' : 'لا توجد تنزيلات في هذا القسم'}
            </p>
            {downloads.length === 0 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  افتح أي سورة واضغط على قائمة الآية ثم «تحميل الآية».
                </p>
                <Button asChild><Link to="/quran">تصفح السور</Link></Button>
              </>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {shown.map((d) => {
              const s = statusInfo[d.status];
              const Icon = s.icon;
              return (
                <li key={d.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-card-foreground truncate">
                        سورة {d.surahName} · الآية <span className="arabic-digits">{ar(d.ayah)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{d.reciterName}</p>
                      <p className={cn('text-xs mt-1 flex items-center gap-1', s.cls)}>
                        <Icon className={cn('w-3.5 h-3.5', d.status === 'downloading' && 'animate-spin')} />
                        {s.label}
                        {d.status === 'downloading' && <span className="arabic-digits">{ar(Math.round(d.progress))}٪</span>}
                        {d.status === 'completed' && d.size ? <span className="text-muted-foreground">· {sizeLabel(d.size)}</span> : null}
                      </p>
                      {d.status === 'error' && d.error && <p className="text-xs text-destructive mt-0.5">{d.error}</p>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {d.status === 'completed' && (
                        <>
                          <Button size="icon" variant="ghost" className="h-11 w-11" aria-label={playingId === d.id ? 'إيقاف' : 'تشغيل'} onClick={() => togglePlay(d)}>
                            {playingId === d.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-11 w-11" aria-label="حفظ على الجهاز" onClick={() => saveToDevice(d)}>
                            <Save className="w-5 h-5" />
                          </Button>
                        </>
                      )}
                      {d.status === 'error' && (
                        <Button size="sm" variant="outline" className="h-11 gap-1" onClick={() => retryDownload(d.id)}>
                          <RotateCcw className="w-4 h-4" /> إعادة المحاولة
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-11 w-11 text-destructive" aria-label="حذف" onClick={() => setToDelete(d)}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  {(d.status === 'downloading' || d.status === 'queued') && (
                    <Progress value={d.progress} className="h-1.5 mt-3" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent dir="rtl" className="arabic-ui">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">حذف الملف؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              {toDelete?.status === 'downloading' || toDelete?.status === 'queued'
                ? 'سيتم إلغاء التنزيل.'
                : 'سيُحذف ملف الآية من هذا الجهاز ويمكنك تنزيله مرة أخرى لاحقًا.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DownloadsPage;
