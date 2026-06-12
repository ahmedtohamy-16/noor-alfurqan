import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, RefreshCw, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PRO_COLOR = "#0074fc";

/**
 * Admin tool to set/rotate the temporary Pro redeem code.
 * Generates a cryptographically random 20-char code by default.
 */
const ProRedeemCodeManager = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const db = getFirestoreDb();
    const snap = await getDoc(doc(db, "pro_config", "redeem"));
    if (snap.exists()) setCode(snap.data().code || "");
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const generate = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    let out = "";
    for (let i = 0; i < bytes.length; i++) {
      out += alphabet[bytes[i] % alphabet.length];
      if (i % 5 === 4 && i < bytes.length - 1) out += "-";
    }
    setCode(out);
  };

  const save = async () => {
    if (code.length < 12) { toast.error("الكود قصير جداً"); return; }
    setSaving(true);
    try {
      const db = getFirestoreDb();
      await setDoc(doc(db, "pro_config", "redeem"), {
        code,
        updatedAt: serverTimestamp(),
      });
      toast.success("تم حفظ الكود");
    } catch (e) {
      console.error(e);
      toast.error("فشل الحفظ");
    } finally { setSaving(false); }
  };

  const remove = async () => {
    if (!confirm("إزالة الكود نهائياً؟ لن يستطيع أحد التفعيل به.")) return;
    try {
      await deleteDoc(doc(getFirestoreDb(), "pro_config", "redeem"));
      setCode("");
      toast.success("تم الحذف");
    } catch { toast.error("فشل الحذف"); }
  };

  const copy = () => {
    navigator.clipboard.writeText(code);
    toast.success("تم النسخ");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-end text-right">
          <span>كود تفعيل Pro التجريبي</span>
          <KeyRound className="w-5 h-5" style={{ color: PRO_COLOR }} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground text-right leading-relaxed">
          كود سري طويل يُمكّن المستخدمين من تفعيل Pro سنة كاملة. مخصص للاختبار —
          احذفه قبل الإطلاق العام.
        </p>
        <div className="flex gap-2">
          <Input
            dir="ltr"
            placeholder="اضغط توليد"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono"
            disabled={loading}
          />
          <Button variant="outline" onClick={generate} title="توليد جديد">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={copy} disabled={!code}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="destructive" onClick={remove} disabled={!code || saving}>
            <Trash2 className="w-4 h-4 ml-1" /> حذف
          </Button>
          <Button onClick={save} disabled={saving || !code} style={{ background: PRO_COLOR }} className="text-white">
            حفظ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProRedeemCodeManager;
