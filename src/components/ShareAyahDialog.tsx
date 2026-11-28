import { useEffect, useState } from 'react';
import { Share2, Download, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { arabicDigits } from '@/lib/displayFormat';
import { IMAGE_WEBSITE_URL } from '@/lib/exportBranding';
import { renderVerseShare, verseShareColors, type VerseShareColor } from '@/lib/verseShareImage';
interface ShareAyahDialogProps { isOpen: boolean; onClose: () => void; ayahText: string; surahName: string; ayahNumber: number; }
export default function ShareAyahDialog({ isOpen, onClose, ayahText, surahName, ayahNumber }: ShareAyahDialogProps) {
  const [color, setColor] = useState<VerseShareColor>('brass');
  const [preview, setPreview] = useState<{ url: string; blob: Blob } | null>(null);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false; let url: string | undefined; setBusy(true); setError(false);
    renderVerseShare(ayahText, surahName, ayahNumber, color).then(blob => {
      if (cancelled) return; url = URL.createObjectURL(blob); setPreview({ url, blob });
    }).catch(() => { if (!cancelled) { setError(true); toast.error('تعذّر تجهيز صورة الآية'); } }).finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; if (url) URL.revokeObjectURL(url); };
  }, [isOpen, ayahText, surahName, ayahNumber, color]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${ayahText}\n\n${surahName} - الآية ${arabicDigits(ayahNumber)}\n\nنور الفرقان\n${IMAGE_WEBSITE_URL}`); setCopied(true); toast.success('تم نسخ النص'); }
    catch { toast.error('تعذّر نسخ النص'); }
  };
  const download = () => { if (!preview || busy || error) return; const a = document.createElement('a'); a.href = preview.url; a.download = `ayah-${surahName}-${ayahNumber}.png`; a.click(); };
  const share = async () => {
    if (!preview || busy || error) return;
    const file = new File([preview.blob], `ayah-${ayahNumber}.png`, { type: 'image/png' });
    if (!navigator.canShare?.({ files: [file] })) { download(); return; }
    try { await navigator.share({ title: `${surahName} - الآية ${arabicDigits(ayahNumber)}`, files: [file] }); }
    catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) toast.error('تعذّرت المشاركة؛ يمكنك تحميل الصورة'); }
  };
  return <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}><DialogContent dir="rtl" className="max-w-lg max-h-[92dvh] overflow-y-auto arabic-ui"><DialogHeader className="pr-8"><DialogTitle className="flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" />مشاركة الآية</DialogTitle></DialogHeader>
    <div className="relative min-h-40 bg-muted overflow-hidden rounded-lg" aria-busy={busy}>
      {preview && !error ? <img src={preview.url} alt="معاينة صورة مشاركة الآية" className="w-full h-auto" /> : <div className="aspect-square grid place-items-center text-muted-foreground">{error ? 'تعذّر تجهيز الصورة' : <Loader2 className="w-6 h-6 animate-spin" />}</div>}
      {busy && preview && <div className="absolute inset-0 bg-background/60 grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}
    </div>
    <div role="group" aria-label="لون الصورة" className="flex items-center justify-center gap-3">{verseShareColors.map(c => <Button key={c.id} size="icon" variant="outline" title={c.name} aria-label={`لون ${c.name}`} aria-pressed={color === c.id} onClick={() => setColor(c.id)} className="h-11 w-11 rounded-full"><span className={`share-swatch share-swatch-${c.id} h-6 w-6 rounded-full grid place-items-center`}>{color === c.id && <Check className="h-4 w-4" />}</span></Button>)}</div>
    <div className="grid grid-cols-3 gap-3"><Button disabled={busy || !preview || error} onClick={share} className="gap-2"><Share2 className="w-4 h-4" />مشاركة</Button><Button disabled={busy || !preview || error} onClick={download} variant="outline" className="gap-2"><Download className="w-4 h-4" />تحميل</Button><Button onClick={copy} variant="outline" className="gap-2">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}نسخ</Button></div>
  </DialogContent></Dialog>;
}
