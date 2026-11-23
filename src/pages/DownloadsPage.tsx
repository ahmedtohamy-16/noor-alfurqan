import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Download, Loader2, Pause, Play, RotateCcw, Save, Trash2, XCircle, Clock, HardDrive, ListChecks, X } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DownloadAudioDialog } from '@/components/DownloadAudioDialog';
import { arabicDigits as ar } from '@/lib/displayFormat';
import { deliverAudioFile } from '@/lib/deliverAudioFile';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useAyahDownloads, retryDownload, deleteDownloads, getDownloadBlob, downloadFileName, useDownloadStorageLimit,
  type AyahDownload, type DownloadStatus,
} from '@/lib/ayahDownloads';

const sizeLabel = (b = 0) => b >= 1024 * 1024
  ? `${ar(Math.round(b / (1024 * 1024) * 100) / 100)} ميجابايت`
  : `${ar(Math.ceil(b / 1024))} كيلوبايت`;

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
  const limit = useDownloadStorageLimit();
  const used = downloads.reduce((n, d) => n + (d.status === 'completed' ? d.size || 0 : 0), 0);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [prepared, setPrepared] = useState<{ blob: Blob; filename: string } | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [toDelete, setToDelete] = useState<string[]>([]);
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
  const selectedItems = downloads.filter((d) => selected.has(d.id));
  const selectedSize = selectedItems.reduce((n, d) => n + (d.size || 0), 0);
  const allShownSelected = shown.length > 0 && shown.every((d) => selected.has(d.id));
  const toggleSelected = (id: string) => setSelected((previous) => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

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
    try { await a.play(); setPlayingId(d.id); }
    catch { toast.error('تعذّر تشغيل الملف'); setPlayingId(null); }
  };

  const saveToDevice = async (d: AyahDownload) => {
    const blob = await getDownloadBlob(d.id);
    if (!blob) { toast.error('الملف غير موجود على الجهاز، أعد تنزيله'); return; }
    setPrepared({ blob, filename: downloadFileName(d) });
  };

  const confirmDelete = async () => {
    if (!toDelete.length || deleting) return;
    setDeleting(true);
    try {
      if (playingId && toDelete.includes(playingId)) { audioRef.current?.pause(); setPlayingId(null); }
      await deleteDownloads(toDelete);
      setSelected((previous) => new Set([...previous].filter((id) => !toDelete.includes(id))));
      toast.success('تم حذف الملفات وتحرير المساحة');
      setToDelete([]);
    } catch { toast.error('تعذّر حذف الملفات؛ حاول مرة أخرى'); }
    finally { setDeleting(false); }
  };

  return (
    <div className="min-h-screen bg-background arabic-ui" dir="rtl">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h1 className="text-2xl font-bold text-foreground">التنزيلات الصوتية</h1>
          <Button className="gap-2 h-11" onClick={() => setRangeOpen(true)}><Download className="h-4 w-4" />تنزيل مقطع من سورة</Button>
        </div>
        <section aria-label="مساحة التخزين" className="border-y border-border py-4 mb-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold flex items-center gap-2"><HardDrive className="h-5 w-5 text-primary" />مساحة التخزين</h2>
            <span className="text-xs text-muted-foreground">على هذا الجهاز</span>
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-sm arabic-digits">
            <span>{sizeLabel(used)} من {sizeLabel(limit)}</span>
            <span className="text-muted-foreground">متبقي {sizeLabel(Math.max(0, limit - used))}</span>
          </div>
          <Progress value={Math.min(100, used / limit * 100)} aria-valuenow={Math.min(100, used / limit * 100)} className="h-2 bg-muted" />
          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span className="arabic-digits">{ar(counts.completed)} ملفات محفوظة</span>
            <span className="arabic-digits">العادي: ١٠ ميجا · برو: ١٠٠ ميجا</span>
          </div>
          {used >= limit && <p className="text-sm text-destructive">وصلت لحد المساحة؛ احذف بعض الملفات لإضافة تنزيلات جديدة.</p>}
        </section>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {filters.map((f) => (
            <Button key={f.id} size="sm" variant={filter === f.id ? 'default' : 'outline'}
              className="h-9 shrink-0 rounded-full" onClick={() => setFilter(f.id)}>
              {f.label} <span className="arabic-digits mr-1 opacity-80">{ar(counts[f.id])}</span>
            </Button>
          ))}
        </div>
        {downloads.length > 0 && <div className="mb-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-11 gap-2" onClick={() => { setSelecting(!selecting); setSelected(new Set()); }}>
              {selecting ? <X className="h-4 w-4" /> : <ListChecks className="h-4 w-4" />}{selecting ? 'إلغاء التحديد' : 'تحديد ملفات'}
            </Button>
            {selecting && <Button variant="ghost" className="h-11" onClick={() => setSelected((previous) => {
              const next = new Set(previous);
              shown.forEach((d) => { if (allShownSelected) next.delete(d.id); else next.add(d.id); });
              return next;
            })}>{allShownSelected ? 'إلغاء تحديد المعروض' : 'تحديد كل المعروض'}</Button>}
          </div>
          {selecting && <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <span className="text-sm arabic-digits">{ar(selectedItems.length)} محددة · {sizeLabel(selectedSize)}</span>
            <Button variant="destructive" className="h-11 gap-2" disabled={!selectedItems.length} onClick={() => setToDelete(selectedItems.map((d) => d.id))}>
              <Trash2 className="h-4 w-4" />حذف المحدد
            </Button>
          </div>}
        </div>}

        {shown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Download className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground mb-1">
              {downloads.length === 0 ? 'لا توجد تنزيلات بعد' : 'لا توجد تنزيلات في هذا القسم'}
            </p>
            {downloads.length === 0 && (
              <>
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
                <li key={d.id} className={cn('rounded-lg border border-border bg-card p-4', selected.has(d.id) && 'border-primary bg-primary/5')}>
                  <div className="flex flex-wrap items-start gap-2">
                    {selecting && <div className="h-11 w-11 flex items-center justify-center"><Checkbox className="h-8 w-8" aria-label={`تحديد سورة ${d.surahName} آية ${d.ayah}${d.endAyah ? ` إلى ${d.endAyah}` : ''}`} checked={selected.has(d.id)} onCheckedChange={() => toggleSelected(d.id)} /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-card-foreground">
                        سورة {d.surahName} · {d.endAyah ? 'الآيات' : 'الآية'} <span className="arabic-digits">{ar(d.ayah)}{d.endAyah ? ` – ${ar(d.endAyah)}` : ''}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{d.reciterName}</p>
                      {d.endAyah && <p className="text-xs text-muted-foreground">مقطع صوتي واحد</p>}
                      <p className={cn('text-xs mt-1 flex items-center gap-1', s.cls)}>
                        <Icon className={cn('w-3.5 h-3.5', d.status === 'downloading' && 'animate-spin')} />
                        {d.status === 'downloading' && d.phase === 'merging' ? 'تجهيز المقطع' : s.label}
                        {d.status === 'downloading' && <span className="arabic-digits">{ar(Math.round(d.progress))}٪</span>}
                        {d.status === 'completed' && d.size ? <span className="text-muted-foreground">· {sizeLabel(d.size)}</span> : null}
                      </p>
                      {d.status === 'error' && d.error && <p className="text-xs text-destructive mt-0.5">{d.error}</p>}
                    </div>
                    {!selecting && <div className="flex items-center gap-1 shrink-0 mr-auto">
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
                      <Button size="icon" variant="ghost" className="h-11 w-11 text-destructive" aria-label="حذف" onClick={() => setToDelete([d.id])}>
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>}
                  </div>
                  {(d.status === 'downloading' || d.status === 'queued') && (
                    <Progress value={d.progress} className="h-1.5 mt-3 bg-muted" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <DownloadAudioDialog open={rangeOpen} onOpenChange={setRangeOpen} chooseSurah surahNumber={1} surahName="الفاتحة" ayahNumber={null} downloadType="range" totalAyahs={7} />
      <Dialog open={!!prepared} onOpenChange={(open) => !open && setPrepared(null)}>
        <DialogContent dir="rtl" className="arabic-ui max-w-sm">
          <DialogHeader className="pr-10"><DialogTitle className="text-right">المقطع جاهز للحفظ</DialogTitle></DialogHeader>
          <DialogDescription className="text-sm text-muted-foreground break-words text-right">{prepared?.filename}</DialogDescription>
          <Button className="h-11 gap-2" onClick={() => { if (prepared) void deliverAudioFile(prepared.blob, prepared.filename).catch(() => toast.error('تعذّر حفظ الملف')); }}><Save className="h-4 w-4" />حفظ الملف</Button>
        </DialogContent>
      </Dialog>
      <AlertDialog open={toDelete.length > 0} onOpenChange={(o) => !o && !deleting && setToDelete([])}>
        <AlertDialogContent dir="rtl" className="arabic-ui">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right arabic-digits">{toDelete.length === 1 ? 'حذف الملف؟' : `حذف ${ar(toDelete.length)} ملفات؟`}</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              ستُحذف الملفات المحددة من هذا الجهاز وتُلغى تنزيلاتها الجارية؛ يمكنك تنزيلها مرة أخرى لاحقًا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={deleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} onClick={(event) => { event.preventDefault(); void confirmDelete(); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? 'جاري الحذف' : 'حذف'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DownloadsPage;
