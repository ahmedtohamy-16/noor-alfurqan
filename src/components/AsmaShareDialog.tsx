import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Download, Share2, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import type { AsmaName } from "@/data/asmaUlHusna";

const THEMES = [
  { id: "emerald", label: "زمردي", from: "#064e3b", to: "#022c22", text: "#ecfdf5" },
  { id: "midnight", label: "ليلي", from: "#0f172a", to: "#1e293b", text: "#e0e7ff" },
  { id: "gold", label: "ذهبي", from: "#78350f", to: "#451a03", text: "#fef3c7" },
  { id: "rose", label: "وردي", from: "#831843", to: "#4a044e", text: "#fce7f3" },
];

const toAr = (n: number) => n.toString().split("").map((d) => "٠١٢٣٤٥٦٧٨٩"[+d] ?? d).join("");

interface Props {
  name: AsmaName | null;
  open: boolean;
  onClose: () => void;
}

const AsmaShareDialog = ({ name, open, onClose }: Props) => {
  const [theme, setTheme] = useState(THEMES[0]);
  const [showMeaning, setShowMeaning] = useState(true);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) { setTheme(THEMES[0]); setShowMeaning(true); } }, [open]);

  if (!name) return null;

  const generateBlob = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    return new Promise((res) => canvas.toBlob((b) => res(b), "image/png"));
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.transliteration}-noor-alfurqan.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تحميل الصورة");
    } catch { toast.error("تعذّر إنشاء الصورة"); }
    setBusy(false);
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error();
      const file = new File([blob], `${name.transliteration}.png`, { type: "image/png" });
      if ((navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: name.name });
      } else {
        await handleDownload();
      }
    } catch { /* ignore */ }
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="arabic-ui max-w-md">
        <DialogHeader>
          <DialogTitle>مشاركة الاسم كصورة</DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="flex justify-center my-3">
          <div
            ref={cardRef}
            style={{
              width: 360,
              minHeight: 360,
              background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
              color: theme.text,
              padding: 32,
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontFamily: "Amiri, serif",
              position: "relative",
            }}
          >
            <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>
              الاسم {toAr(name.number)} من ٩٩
            </div>
            <div style={{ fontSize: 64, lineHeight: 1.4, fontWeight: 700, marginBottom: 12 }}>
              {name.name}
            </div>
            <div style={{ fontSize: 16, opacity: 0.85, marginBottom: showMeaning ? 16 : 0 }}>
              {name.transliteration}
            </div>
            {showMeaning && (
              <div
                style={{
                  fontSize: 18,
                  lineHeight: 1.7,
                  opacity: 0.95,
                  borderTop: `1px solid ${theme.text}33`,
                  paddingTop: 14,
                  marginTop: 6,
                  maxWidth: 300,
                }}
              >
                {name.meaning}
              </div>
            )}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 0,
                right: 0,
                fontSize: 11,
                opacity: 0.6,
                letterSpacing: 1,
              }}
            >
              نور الفرقان · Noor Al-Furqan
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm mb-2 block">الثيم</Label>
            <div className="grid grid-cols-4 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    theme.id === t.id ? "border-primary scale-105" : "border-transparent"
                  }`}
                  style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                  aria-label={t.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
            <Label htmlFor="show-meaning" className="text-sm cursor-pointer">
              إظهار معنى الاسم
            </Label>
            <Switch id="show-meaning" checked={showMeaning} onCheckedChange={setShowMeaning} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleDownload} disabled={busy} className="gap-2">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              تحميل
            </Button>
            <Button onClick={handleShare} disabled={busy} variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              مشاركة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AsmaShareDialog;
