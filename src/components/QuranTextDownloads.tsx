import { useEffect, useState } from 'react';
import { BookOpen, Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { surahs } from '@/data/surahs';
import { arabicDigits, westernDigits } from '@/lib/displayFormat';
import { downloadQuranText, listQuranTextDownloads, deleteQuranText, subscribeOfflineText, type QuranTextDownload } from '@/lib/offlineQuran';
import { toast } from 'sonner';
import { useReadingSettings } from '@/hooks/useReadingSettings';

export default function QuranTextDownloads() {
  const [items, setItems] = useState<QuranTextDownload[]>([]);
  const [surah, setSurah] = useState(1);
  const [from, setFrom] = useState('١');
  const [to, setTo] = useState('٧');
  const [mode, setMode] = useState('surah');
  const [busy, setBusy] = useState(false);
  const [reading, setReading] = useState<QuranTextDownload | null>(null);
  const { settings } = useReadingSettings();
  useEffect(() => { const refresh = () => { void listQuranTextDownloads().then(setItems).catch(() => toast.error('تعذّر قراءة تنزيلات النص')); }; refresh(); return subscribeOfflineText(refresh); }, []);
  const meta = surahs.find(s => s.number === surah);
  const save = async () => {
    setBusy(true);
    try { await downloadQuranText(surah, mode === 'surah' ? 1 : Number(westernDigits(from)), mode === 'surah' ? meta?.numberOfAyahs || 1 : Number(westernDigits(to))); toast.success('تم حفظ النص للاستخدام دون اتصال'); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'تعذّر تحميل النص'); }
    finally { setBusy(false); }
  };
  return <section className="border-y border-border py-5 mb-6 space-y-4" aria-label="نصوص القرآن دون اتصال">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />نصوص القرآن</h2><span className="text-xs text-muted-foreground arabic-digits">{arabicDigits(Math.ceil(items.reduce((sum, i) => sum + i.size, 0) / 1024))} كيلوبايت</span></div>
    <div className="grid grid-cols-2 gap-2">
      <Select value={String(surah)} onValueChange={v => { const n = Number(v); setSurah(n); setFrom('١'); setTo(arabicDigits(surahs.find(s => s.number === n)?.numberOfAyahs || 1)); }}><SelectTrigger aria-label="السورة المراد تحميل نصها"><SelectValue /></SelectTrigger><SelectContent>{surahs.map(s => <SelectItem value={String(s.number)} key={s.number}>{s.name}</SelectItem>)}</SelectContent></Select>
      <Select value={mode} onValueChange={setMode}><SelectTrigger aria-label="نطاق تحميل النص"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="surah">السورة كاملة</SelectItem><SelectItem value="range">آية أو نطاق آيات</SelectItem></SelectContent></Select>
    </div>
    {mode === 'range' && <div className="grid grid-cols-2 gap-3"><label className="text-sm space-y-1 block">من آية<Input aria-label="أول آية للنص" inputMode="numeric" value={from} onChange={e => setFrom(arabicDigits(e.target.value.replace(/[^0-9٠-٩]/g, '')))} /></label><label className="text-sm space-y-1 block">إلى آية<Input aria-label="آخر آية للنص" inputMode="numeric" value={to} onChange={e => setTo(arabicDigits(e.target.value.replace(/[^0-9٠-٩]/g, '')))} /></label></div>}
    <Button onClick={save} disabled={busy} variant="outline" className="w-full h-11 gap-2">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}تحميل النص</Button>
    {items.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد نصوص محمّلة على هذا الجهاز</p> : <ul className="divide-y divide-border">{items.map(item => <li key={item.id} className="flex gap-3 items-center py-3"><div className="flex-1 min-w-0"><p className="font-semibold">{item.surahName}</p><p className="text-xs text-muted-foreground arabic-digits">الآيات {arabicDigits(item.from)} – {arabicDigits(item.to)} · {arabicDigits(Math.ceil(item.size / 1024))} كيلوبايت</p></div><Button size="icon" variant="ghost" className="w-11 h-11" aria-label={`قراءة نص ${item.surahName}`} onClick={() => setReading(item)}><BookOpen className="w-5 h-5" /></Button><Button size="icon" variant="ghost" className="w-11 h-11 text-destructive" aria-label={`حذف نص ${item.surahName}`} onClick={() => { void deleteQuranText(item.id).catch(() => toast.error('تعذّر حذف النص')); }}><Trash2 className="w-5 h-5" /></Button></li>)}</ul>}
    <Dialog open={!!reading} onOpenChange={open => { if (!open) setReading(null); }}><DialogContent className="max-w-lg max-h-[85dvh] overflow-y-auto arabic-ui" dir="rtl"><DialogHeader><DialogTitle>{reading?.surahName}</DialogTitle></DialogHeader><div className={`quran-text text-center ${{ Amiri: "font-amiri", Scheherazade: "font-scheherazade", "Noto Naskh": "font-noto-naskh", Uthmani: "font-uthmani" }[settings.fontFamily]}`} style={{ fontSize: settings.fontSize, lineHeight: Math.max(2.2, settings.lineHeight) }}>{reading?.ayahs.map(ayah => <span key={ayah.id}>{ayah.text_uthmani}<span className="text-primary text-sm mx-2 arabic-digits">﴿{arabicDigits(ayah.ayat_number_in_sura)}﴾</span> </span>)}</div></DialogContent></Dialog>
  </section>;
}